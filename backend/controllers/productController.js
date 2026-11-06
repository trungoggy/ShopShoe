import db, { id, now, fail, productById } from '../config/db.js';
import asyncHandler from '../middleware/asyncHandler.js';

function requiredProduct(productId) {
  const product = productById(productId);
  if (!product) fail(404, 'Không tìm thấy sản phẩm.');
  return product;
}
function normalize(value) {
  return String(value ?? '').trim().toLocaleLowerCase('vi').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
}
function list(req) {
  const filters = { ...req.query, ...req.body };
  const bounds = {};
  for (const field of ['minPrice', 'maxPrice', 'minRating']) {
    const value = String(filters[field] ?? '').trim();
    if (value === '') continue;
    bounds[field] = Number(value);
    if (!Number.isFinite(bounds[field]) || bounds[field] < 0) fail(400, 'Giá và điểm lọc phải là số không âm.');
  }
  if (bounds.minPrice !== undefined && bounds.maxPrice !== undefined && bounds.minPrice > bounds.maxPrice) fail(400, 'Giá từ phải nhỏ hơn hoặc bằng giá đến.');
  const pageSize = Math.min(100, Math.max(1, Number(process.env.PAGINATION_LIMIT) || 8));
  const page = Math.max(1, Math.floor(Number(req.query.pageNumber) || 1));
  const catalog = db.prepare('SELECT id FROM products WHERE active=1 ORDER BY createdAt DESC').all()
    .map(row => productById(row.id));
  const options = values => [...new Set(values)].sort((a, b) => a.localeCompare(b, 'vi', { numeric: true }));
  const filterOptions = {
    brand: options(catalog.map(product => product.brand)),
    category: options(catalog.map(product => product.category)),
    size: options(catalog.flatMap(product => product.variants.map(variant => variant.size))),
    color: options(catalog.flatMap(product => product.variants.map(variant => variant.color))),
  };
  const products = catalog.filter(product =>
    normalize(product.name).includes(normalize(filters.keyword)) &&
    normalize(product.brand).includes(normalize(filters.brand)) &&
    normalize(product.category).includes(normalize(filters.category)) &&
    (bounds.minPrice === undefined || product.price >= bounds.minPrice) &&
    (bounds.maxPrice === undefined || product.price <= bounds.maxPrice) &&
    (bounds.minRating === undefined || product.rating >= bounds.minRating) &&
    product.variants.some(variant => (!normalize(filters.size) || normalize(variant.size) === normalize(filters.size)) && normalize(variant.color).includes(normalize(filters.color))));
  return { products: products.slice((page - 1) * pageSize, page * pageSize), page, pages: Math.ceil(products.length / pageSize), total: products.length, filterOptions };
}
const getProducts = asyncHandler(async (req, res) => res.json(list(req)));
const filterByPriceAndRating = getProducts;
const getProductById = asyncHandler(async (req, res) => res.json(requiredProduct(req.params.id)));
const createProduct = asyncHandler(async (req, res) => {
  const productId = id();
  const stamp = now();
  db.prepare('INSERT INTO products(id,name,image,description,brand,category,price,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?,?)')
    .run(productId, 'Sản phẩm mới', '/images/sample.jpg', 'Mô tả sản phẩm', 'Thương hiệu', 'Shoes', 0, stamp, stamp);
  db.prepare('INSERT INTO variants(id,productId,size,color,stock) VALUES(?,?,?,?,0)').run(id(), productId, '40', 'Mặc định');
  res.status(201).json(requiredProduct(productId));
});
const updateProduct = asyncHandler(async (req, res) => {
  const old = requiredProduct(req.params.id);
  const data = { ...old, ...req.body };
  for (const key of ['name', 'image', 'description', 'brand', 'category']) {
    if (typeof data[key] !== 'string' || !data[key].trim()) fail(400, `Thiếu thông tin ${key}.`);
  }
  if (!Number.isFinite(Number(data.price)) || Number(data.price) < 0) fail(400, 'Giá không hợp lệ.');
  if (!Array.isArray(data.variants) || !data.variants.length || data.variants.length > 100) fail(400, 'Cần từ 1 đến 100 biến thể.');
  const combinations = new Set();
  const variants = data.variants.map(variant => {
    const size = String(variant.size || '').trim();
    const color = String(variant.color || '').trim();
    const stock = Number(variant.stock);
    const key = JSON.stringify([size, color]);
    if (!size || !color || !Number.isSafeInteger(stock) || stock < 0 || stock > 100000 || combinations.has(key)) fail(400, 'Size/màu bị trùng hoặc tồn kho không hợp lệ.');
    combinations.add(key);
    return { size, color, stock };
  });
  db.transaction(() => {
    db.prepare('UPDATE products SET name=?,image=?,description=?,brand=?,category=?,price=?,updatedAt=? WHERE id=?')
      .run(data.name.trim(), data.image.trim(), data.description.trim(), data.brand.trim(), data.category.trim(), Number(data.price), now(), old._id);
    db.prepare('UPDATE variants SET active=0 WHERE productId=?').run(old._id);
    for (const variant of variants) {
      db.prepare(`INSERT INTO variants(id,productId,size,color,stock) VALUES(?,?,?,?,?)
        ON CONFLICT(productId,size,color) DO UPDATE SET stock=excluded.stock,active=1`)
        .run(id(), old._id, variant.size, variant.color, variant.stock);
    }
  })();
  res.json(requiredProduct(old._id));
});
const deleteProduct = asyncHandler(async (req, res) => {
  requiredProduct(req.params.id);
  db.prepare('UPDATE products SET active=0,updatedAt=? WHERE id=?').run(now(), req.params.id);
  res.json({ message: 'Đã ngừng kinh doanh sản phẩm.' });
});
const createProductReview = asyncHandler(async (req, res) => {
  requiredProduct(req.params.id);
  const rating = Number(req.body.rating);
  const comment = String(req.body.comment || '').trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment) fail(400, 'Nhập nhận xét và điểm từ 1 đến 5.');
  const bought = db.prepare(`SELECT 1 FROM order_items i JOIN orders o ON o.id=i.orderId
    WHERE i.productId=? AND o.userId=? AND o.status='delivered'`).get(req.params.id, req.user._id);
  if (!bought) fail(403, 'Chỉ đánh giá sản phẩm sau khi nhận hàng.');
  if (db.prepare('SELECT 1 FROM reviews WHERE productId=? AND userId=?').get(req.params.id, req.user._id)) fail(409, 'Bạn đã đánh giá sản phẩm này.');
  db.prepare('INSERT INTO reviews(id,productId,userId,name,rating,comment,createdAt) VALUES(?,?,?,?,?,?,?)')
    .run(id(), req.params.id, req.user._id, req.user.name, rating, comment, now());
  res.status(201).json({ message: 'Đã lưu đánh giá.' });
});
function sortedProducts(field, limit, exclude = '') {
  return db.prepare('SELECT id FROM products WHERE active=1 AND id != ?').all(exclude)
    .map(row => productById(row.id)).sort((a, b) => b[field] - a[field]).slice(0, limit);
}
const getTopProducts = asyncHandler(async (req, res) => res.json(sortedProducts('rating', 3)));
const getTopProductsByPrice = asyncHandler(async (req, res) => res.json(sortedProducts('price', 4, req.params.product_id)));
const stisticReview = asyncHandler(async (req, res) => {
  const product = requiredProduct(req.params.productId);
  const result = { totalStar: product.rating };
  for (let star = 1; star <= 5; star++) result[`star${star}`] = product.reviews.length ? product.reviews.filter(review => review.rating === star).length / product.reviews.length * 100 : 0;
  res.json(result);
});
export { getProducts, getProductById, createProduct, updateProduct, deleteProduct, createProductReview, getTopProducts, getTopProductsByPrice, stisticReview, filterByPriceAndRating };
