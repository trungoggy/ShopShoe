# ShopShoe chạy với SQLite

Yêu cầu Node.js 20.13 hoặc bản Node LTS hỗ trợ better-sqlite3 đã cài.

Tại thư mục gốc, chạy `npm install` và `npm install --prefix frontend` khi thiết lập máy mới.
Chạy `npm run dev`, mở http://localhost:3000.
Cơ sở dữ liệu mới được tạo và nạp dữ liệu mẫu ở lần chạy đầu tiên.

Tài khoản quản trị ban đầu là `admin@shopshoe.local`, mật khẩu `ShopShoe@2026`.
Đổi mật khẩu trong hồ sơ nếu sử dụng ngoài buổi thực hành cá nhân.

Dữ liệu lưu tại `data/shopshoe.sqlite`. Dừng máy chủ rồi sao lưu cả thư mục `data` và `uploads`.
Khởi động lại giữ nguyên dữ liệu. `npm run data:import` chỉ tạo dữ liệu khi database trống.
Tài khoản và dữ liệu trên MongoDB Atlas cũ chưa được chuyển vào database mới.
Các size và màu ban đầu là dữ liệu mẫu phục vụ thực hành, có thể sửa ở quản trị sản phẩm.
Giỏ hàng cũ chưa chọn biến thể được làm trống khi mở phiên bản này, cần chọn lại size/màu.

MVP dùng COD hoặc chuyển khoản giả lập do quản trị viên xác nhận thủ công.
Chọn biến thể, thêm giỏ, đăng nhập, nhập thông tin giao hàng, chọn thanh toán và đặt đơn.
Máy chủ tính lại giá từ dữ liệu sản phẩm và trừ kho trong giao dịch SQLite khi tạo đơn.
Hủy đơn chưa thanh toán ở trạng thái chờ/chuẩn bị phải ghi lý do và hoàn kho đúng một lần.
Trạng thái đi từ chờ xác nhận sang chuẩn bị, đang giao rồi đã giao.
Đơn COD được ghi nhận thu tiền khi đã giao. Đơn chuyển khoản phải xác nhận thu tiền trước khi hoàn tất.
Đơn đã thanh toán muốn hủy cần quy trình hoàn tiền, nằm ngoài MVP hiện tại.
Đánh giá chỉ dành cho người đã nhận sản phẩm. Doanh thu quản trị tính từ đơn đã giao và đã thu tiền.
Giá USD, phí ship miễn khi tiền hàng trên 100 USD, còn lại 10 USD, thuế mô phỏng 15% giữ theo quy tắc của giao diện ban đầu.
Chức năng danh mục/thương hiệu được nhập trực tiếp trong sản phẩm, chưa có màn hình CRUD danh mục riêng.
Đây là bản demo trên máy, server chỉ lắng nghe localhost.

Khi hoàn thiện báo cáo, thống nhất SQLite ở chương 1 và 4, mô tả các bảng users/products/variants/orders/order_items/reviews,
thay mô tả PayPal bằng COD và chuyển khoản giả lập. Chương kiểm thử ghi nhận kết quả kiểm tra thực tế.
http://localhost:3000/
Email admin@shopshoe.local
Mật khẩu ShopShoe@2026
Giao diện dùng Vite. Tệp HTML đầu vào là `frontend/index.html`. `npm run build --prefix frontend` tạo bản dựng tại `frontend/build`.

## Cài đặt sau khi tải từ GitHub

Tại thư mục gốc, chạy các lệnh sau trong PowerShell.

```powershell
npm ci
npm ci --prefix frontend
Copy-Item .env.example .env
```

Mở .env và thay JWT_SECRET bằng chuỗi ngẫu nhiên của riêng bạn trước khi chạy.
Có thể tạo chuỗi bằng lệnh sau rồi sao chép kết quả vào JWT_SECRET.

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
npm run dev
```

Database và ảnh tải lên được lưu riêng trên mỗi máy. Khi chuyển máy, dùng bản sao lưu dữ liệu nếu cần tiếp tục sử dụng dữ liệu cũ.
