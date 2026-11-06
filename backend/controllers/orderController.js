import db, { id, now, fail, orderById } from '../config/db.js';
import asyncHandler from '../middleware/asyncHandler.js';

function requiredOrder(orderId) {
  const order = orderById(orderId);
  if (!order) fail(404, 'Không tìm thấy đơn hàng.');
  return order;
}
function ownOrder(order, user) {
  if (order.userId !== user._id && !user.isAdmin) fail(403, 'Bạn không có quyền xem đơn hàng này.');
}
const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, requestKey } = req.body;
  if (!Array.isArray(orderItems) || !orderItems.length || orderItems.length > 100) fail(400, 'Giỏ hàng không hợp lệ.');
  if (typeof requestKey !== 'string' || requestKey.length < 8 || requestKey.length > 100) fail(400, 'Vui lòng làm mới trang xác nhận đơn hàng.');
  for (const key of ['fullName', 'phone', 'address', 'city', 'country']) {
    if (typeof shippingAddress?.[key] !== 'string' || !shippingAddress[key].trim()) fail(400, 'Vui lòng nhập đầy đủ họ tên, điện thoại và địa chỉ nhận hàng.');
  }
  if (!/^[+\d\s().-]{9,20}$/.test(shippingAddress.phone)) fail(400, 'Số điện thoại không hợp lệ.');
  if (!['COD', 'BankTransfer'].includes(paymentMethod)) fail(400, 'Phương thức thanh toán không hợp lệ.');
  const orderId = db.transaction(() => {
    const existing = db.prepare('SELECT id,userId FROM orders WHERE requestKey=?').get(requestKey);
    if (existing) {
      if (existing.userId !== req.user._id) fail(409, 'Mã yêu cầu đã được sử dụng.');
      return existing.id;
    }
    const quantities = new Map();
    for (const item of orderItems) {
      if (typeof item.variantId !== 'string' || !Number.isSafeInteger(item.qty) || item.qty <= 0) fail(400, 'Vui lòng chọn lại size/màu trong giỏ hàng.');
      quantities.set(item.variantId, (quantities.get(item.variantId) || 0) + item.qty);
    }
    const items = [];
    for (const [variantId, qty] of quantities) {
      const variant = db.prepare(`SELECT v.*,p.name,p.image,p.price FROM variants v JOIN products p ON p.id=v.productId
        WHERE v.id=? AND v.active=1 AND p.active=1`).get(variantId);
      if (!variant || variant.stock < qty) fail(409, 'Một biến thể đã hết hàng hoặc không đủ số lượng. Vui lòng cập nhật giỏ hàng.');
      items.push({ ...variant, qty });
    }
    const itemsPrice = Math.round(items.reduce((sum, item) => sum + item.price * item.qty, 0) * 100) / 100;
    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    const taxPrice = Math.round(itemsPrice * 15) / 100;
    const totalPrice = Math.round((itemsPrice + shippingPrice + taxPrice) * 100) / 100;
    const orderId = id();
    const stamp = now();
    db.prepare(`INSERT INTO orders(id,userId,address,paymentMethod,itemsPrice,shippingPrice,taxPrice,totalPrice,status,requestKey,createdAt,updatedAt)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`).run(orderId, req.user._id, JSON.stringify(shippingAddress), paymentMethod, itemsPrice, shippingPrice, taxPrice, totalPrice, 'pending', requestKey, stamp, stamp);
    for (const item of items) {
      db.prepare('UPDATE variants SET stock=stock-? WHERE id=?').run(item.qty, item.id);
      db.prepare('INSERT INTO order_items(id,orderId,productId,variantId,name,image,size,color,qty,price) VALUES(?,?,?,?,?,?,?,?,?,?)')
        .run(id(), orderId, item.productId, item.id, item.name, item.image, item.size, item.color, item.qty, item.price);
    }
    return orderId;
  })();
  res.status(201).json(requiredOrder(orderId));
});
const getMyOrders = asyncHandler(async (req, res) => res.json(db.prepare('SELECT id FROM orders WHERE userId=? ORDER BY createdAt DESC').all(req.user._id).map(row => orderById(row.id))));
const getOrderById = asyncHandler(async (req, res) => {
  const order = requiredOrder(req.params.id);
  ownOrder(order, req.user);
  res.json(order);
});
const getOrders = asyncHandler(async (req, res) => res.json(db.prepare('SELECT id FROM orders ORDER BY createdAt DESC').all().map(row => orderById(row.id))));
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = requiredOrder(req.params.id);
  if (order.status === 'cancelled') fail(400, 'Đơn đã hủy.');
  db.prepare('UPDATE orders SET isPaid=1,paidAt=COALESCE(paidAt,?),updatedAt=? WHERE id=?').run(now(), now(), order._id);
  res.json(requiredOrder(order._id));
});
function changeStatus(orderId, status, reason) {
  return db.transaction(() => {
    const order = requiredOrder(orderId);
    if (order.status === status) return order;
    const allowed = { pending: ['preparing', 'cancelled'], preparing: ['shipping', 'cancelled'], shipping: ['delivered'], delivered: [], cancelled: [] };
    if (!allowed[order.status]?.includes(status)) fail(400, 'Chuyển trạng thái đơn không hợp lệ.');
    if (status === 'cancelled') {
      if (typeof reason !== 'string' || !reason.trim()) fail(400, 'Cần nhập lý do hủy.');
      if (order.isPaid) fail(400, 'Cần xử lý hoàn tiền trước khi hủy đơn đã thanh toán.');
      for (const item of order.orderItems) db.prepare('UPDATE variants SET stock=stock+? WHERE id=?').run(item.qty, item.variantId);
    }
    if (status === 'delivered' && order.paymentMethod === 'BankTransfer' && !order.isPaid) fail(400, 'Cần xác nhận thanh toán trước khi hoàn tất đơn chuyển khoản.');
    const stamp = now();
    const paid = order.isPaid || (status === 'delivered' && order.paymentMethod === 'COD');
    db.prepare('UPDATE orders SET status=?,cancelReason=?,isPaid=?,paidAt=?,deliveredAt=?,updatedAt=? WHERE id=?')
      .run(status, status === 'cancelled' ? reason.trim() : '', Number(paid), order.paidAt || (paid ? stamp : null), status === 'delivered' ? stamp : null, stamp, orderId);
    return requiredOrder(orderId);
  })();
}
const updateOrderStatus = asyncHandler(async (req, res) => res.json(changeStatus(req.params.id, req.body.status, req.body.reason)));
const updateOrderToDelivered = asyncHandler(async (req, res) => res.json(changeStatus(req.params.id, 'delivered')));
export { addOrderItems, getMyOrders, getOrderById, getOrders, updateOrderToPaid, updateOrderToDelivered, updateOrderStatus };
