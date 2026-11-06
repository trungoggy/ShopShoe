const notFound = (req, res, next) => {
  const error = new Error(`Không tìm thấy đường dẫn ${req.path}`);
  error.statusCode = 404;
  next(error);
};
const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  console.error(err.message);
  res.status(status).json({ message: status === 500 ? 'Máy chủ gặp lỗi. Vui lòng thử lại.' : err.message });
};
export { notFound, errorHandler };
