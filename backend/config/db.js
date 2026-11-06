import 'dotenv/config';
import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import products from '../data/products.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const filename = path.resolve(root, process.env.SQLITE_FILE || 'data/shopshoe.sqlite');
mkdirSync(path.dirname(filename), { recursive: true });
const db = new Database(filename);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    password TEXT NOT NULL, isAdmin INTEGER NOT NULL DEFAULT 0, blocked INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, image TEXT NOT NULL, description TEXT NOT NULL,
    brand TEXT NOT NULL, category TEXT NOT NULL, price REAL NOT NULL CHECK(price >= 0),
    active INTEGER NOT NULL DEFAULT 1, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS variants (
    id TEXT PRIMARY KEY, productId TEXT NOT NULL REFERENCES products(id),
    size TEXT NOT NULL, color TEXT NOT NULL, stock INTEGER NOT NULL CHECK(stock >= 0),
    active INTEGER NOT NULL DEFAULT 1, UNIQUE(productId, size, color)
  );
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY, userId TEXT NOT NULL REFERENCES users(id), address TEXT NOT NULL,
    paymentMethod TEXT NOT NULL, itemsPrice REAL NOT NULL, shippingPrice REAL NOT NULL,
    taxPrice REAL NOT NULL, totalPrice REAL NOT NULL, status TEXT NOT NULL,
    cancelReason TEXT NOT NULL DEFAULT '', isPaid INTEGER NOT NULL DEFAULT 0,
    paidAt TEXT, deliveredAt TEXT, requestKey TEXT NOT NULL UNIQUE,
    createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY, orderId TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    productId TEXT NOT NULL REFERENCES products(id), variantId TEXT NOT NULL REFERENCES variants(id),
    name TEXT NOT NULL, image TEXT NOT NULL, size TEXT NOT NULL, color TEXT NOT NULL,
    qty INTEGER NOT NULL CHECK(qty > 0), price REAL NOT NULL CHECK(price >= 0)
  );
  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY, productId TEXT NOT NULL REFERENCES products(id),
    userId TEXT NOT NULL REFERENCES users(id), name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5), comment TEXT NOT NULL,
    createdAt TEXT NOT NULL, UNIQUE(productId, userId)
  );
  CREATE INDEX IF NOT EXISTS orders_user ON orders(userId);
  CREATE INDEX IF NOT EXISTS items_order ON order_items(orderId);
`);

export const id = () => randomUUID();
export const now = () => new Date().toISOString();
export function fail(status, message) {
  const error = new Error(message);
  error.statusCode = status;
  throw error;
}
export function publicUser(row) {
  if (!row) return null;
  const { password, id: userId, ...rest } = row;
  return { ...rest, _id: userId, isAdmin: Boolean(row.isAdmin), blocked: Boolean(row.blocked) };
}
export function productById(productId, includeInactive = false) {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  if (!row || (!row.active && !includeInactive)) return null;
  const variants = db.prepare('SELECT * FROM variants WHERE productId = ? AND active = 1 ORDER BY size, color').all(productId)
    .map(({ id: variantId, ...variant }) => ({ ...variant, _id: variantId }));
  const reviews = db.prepare('SELECT * FROM reviews WHERE productId = ? ORDER BY createdAt DESC').all(productId)
    .map(({ id: reviewId, userId, ...review }) => ({ ...review, _id: reviewId, user: userId }));
  return { ...row, _id: row.id, variants, reviews,
    countInStock: variants.reduce((sum, variant) => sum + variant.stock, 0),
    numReviews: reviews.length,
    rating: reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0 };
}
export function orderById(orderId) {
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  if (!row) return null;
  return { ...row, _id: row.id, shippingAddress: JSON.parse(row.address),
    user: publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(row.userId)),
    isPaid: Boolean(row.isPaid), isDelivered: row.status === 'delivered',
    orderItems: db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(orderId)
      .map(item => ({ ...item, _id: item.id, product: item.productId })) };
}
export const seed = db.transaction(() => {
  if (db.prepare('SELECT COUNT(*) AS count FROM users').get().count) return;
  const adminId = id();
  const stamp = now();
  db.prepare('INSERT INTO users(id,name,email,password,isAdmin,createdAt,updatedAt) VALUES(?,?,?,?,1,?,?)')
    .run(adminId, 'Quản trị ShopShoe', 'admin@shopshoe.local', bcrypt.hashSync('ShopShoe@2026', 10), stamp, stamp);
  for (const product of products) {
    const productId = id();
    db.prepare('INSERT INTO products(id,name,image,description,brand,category,price,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?,?)')
      .run(productId, product.name, product.image, product.description, product.brand.trim(), product.category, product.price, stamp, stamp);
    const sizes = ['38', '39', '40', '41', '42'];
    sizes.forEach((size, index) => {
      const stock = Math.floor(product.countInStock / sizes.length) + (index < product.countInStock % sizes.length ? 1 : 0);
      db.prepare('INSERT INTO variants(id,productId,size,color,stock) VALUES(?,?,?,?,?)').run(id(), productId, size, 'Mặc định', stock);
    });
  }
});
export default db;
