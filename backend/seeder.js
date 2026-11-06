import db, { seed } from './config/db.js';

if (process.argv.includes('-d')) {
  console.error('Lệnh xóa dữ liệu đã tắt. Sao lưu data/shopshoe.sqlite trước khi tạo cơ sở dữ liệu mới.');
  process.exitCode = 1;
} else {
  seed();
  console.log('SQLite đã sẵn sàng. Chỉ thêm dữ liệu mẫu khi cơ sở dữ liệu mới và trống.');
}
db.close();
