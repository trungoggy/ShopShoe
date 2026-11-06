import jwt from 'jsonwebtoken';
import db, { publicUser, fail } from '../config/db.js';
import asyncHandler from './asyncHandler.js';

const protect = asyncHandler(async (req, res, next) => {
  let decoded;
  try {
    decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
  } catch {
    fail(401, 'Vui lòng đăng nhập lại.');
  }
  req.user = publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId));
  if (!req.user || req.user.blocked) fail(401, 'Tài khoản không tồn tại hoặc đã bị khóa.');
  next();
});
const admin = (req, res, next) => {
  if (!req.user?.isAdmin) return next(Object.assign(new Error('Cần quyền quản trị.'), { statusCode: 403 }));
  next();
};
export { protect, admin };
