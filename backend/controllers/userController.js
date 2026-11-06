import bcrypt from 'bcryptjs';
import db, { id, now, fail, publicUser } from '../config/db.js';
import asyncHandler from '../middleware/asyncHandler.js';
import generateToken from '../utils/generateToken.js';

function userById(userId) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) fail(404, 'Không tìm thấy tài khoản.');
  return user;
}
function fields(body) {
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(400, 'Tên hoặc email không hợp lệ.');
  if (body.password !== undefined && (typeof body.password !== 'string' || body.password.length < 8)) fail(400, 'Mật khẩu phải có ít nhất 8 ký tự.');
  return { name, email };
}
function checkEmail(email, userId = '') {
  if (db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, userId)) fail(409, 'Email đã được sử dụng.');
}
const authUser = asyncHandler(async (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(req.body.email || '').trim());
  if (!user || user.blocked || typeof req.body.password !== 'string' || !bcrypt.compareSync(req.body.password, user.password)) fail(401, 'Email hoặc mật khẩu không đúng.');
  generateToken(res, user.id);
  res.json(publicUser(user));
});
const registerUser = asyncHandler(async (req, res) => {
  if (!req.body.password) fail(400, 'Vui lòng nhập mật khẩu.');
  const { name, email } = fields(req.body);
  checkEmail(email);
  const userId = id();
  const stamp = now();
  db.prepare('INSERT INTO users(id,name,email,password,createdAt,updatedAt) VALUES(?,?,?,?,?,?)')
    .run(userId, name, email, bcrypt.hashSync(req.body.password, 10), stamp, stamp);
  generateToken(res, userId);
  res.status(201).json(publicUser(userById(userId)));
});
const logoutUser = (req, res) => {
  res.clearCookie('jwt');
  res.json({ message: 'Đã đăng xuất.' });
};
const getUserProfile = asyncHandler(async (req, res) => res.json(publicUser(userById(req.user._id))));
const getUsers = asyncHandler(async (req, res) => res.json(db.prepare('SELECT * FROM users ORDER BY createdAt DESC').all().map(publicUser)));
const getUserById = asyncHandler(async (req, res) => res.json(publicUser(userById(req.params.id))));
function update(userId, body, asAdmin) {
  const old = userById(userId);
  const { name, email } = fields({ ...old, ...body, password: body.password || undefined });
  checkEmail(email, userId);
  const password = body.password ? bcrypt.hashSync(body.password, 10) : old.password;
  const isAdmin = asAdmin ? Number(Boolean(body.isAdmin)) : old.isAdmin;
  const blocked = asAdmin ? Number(Boolean(body.blocked ?? old.blocked)) : old.blocked;
  if (old.isAdmin && (!isAdmin || blocked) && db.prepare('SELECT COUNT(*) AS count FROM users WHERE isAdmin = 1 AND blocked = 0').get().count <= 1) fail(400, 'Cần giữ ít nhất một quản trị viên hoạt động.');
  db.prepare('UPDATE users SET name=?,email=?,password=?,isAdmin=?,blocked=?,updatedAt=? WHERE id=?')
    .run(name, email, password, isAdmin, blocked, now(), userId);
  return publicUser(userById(userId));
}
const updateUserProfile = asyncHandler(async (req, res) => res.json(update(req.user._id, req.body, false)));
const updateUser = asyncHandler(async (req, res) => res.json(update(req.params.id, req.body, true)));
const deleteUser = asyncHandler(async (req, res) => {
  const user = userById(req.params.id);
  if (user.isAdmin) fail(400, 'Không thể xóa quản trị viên.');
  // Retain order and review references, and revoke access to this account.
  db.prepare('UPDATE users SET blocked=1,updatedAt=? WHERE id=?').run(now(), user.id);
  res.json({ message: 'Đã khóa tài khoản để bảo toàn lịch sử đơn hàng.' });
});
export { authUser, registerUser, logoutUser, getUserProfile, updateUserProfile, getUsers, deleteUser, getUserById, updateUser };
