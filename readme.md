# ShopShoe

Website bán giày, có trang mua hàng và trang quản trị sản phẩm, tài khoản, đơn hàng.

## Chuẩn bị

- Node.js 20.13.0 đã được dùng để chạy và kiểm tra dự án.
- Mở thư mục ShopShoe trong VS Code. Các lệnh dưới đây chạy từ terminal ở thư mục gốc, nơi có `package.json`.

## Cài đặt lần đầu

Cài thư viện cho backend và frontend.

```powershell
npm ci
npm ci --prefix frontend
```

Nếu chưa có `.env`, tạo tệp từ cấu hình mẫu.

```powershell
Copy-Item .env.example .env
```

Mở `.env` và điền các giá trị sau. Thay `chuoi_bi_mat_cua_ban` bằng chuỗi riêng của bạn.

```dotenv
NODE_ENV=development
PORT=5000
SQLITE_FILE=data/shopshoe.sqlite
JWT_SECRET=chuoi_bi_mat_cua_ban
PAGINATION_LIMIT=8
```

Có thể tạo chuỗi cho `JWT_SECRET` bằng lệnh sau rồi chép kết quả vào `.env`.

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

## Chạy website

```powershell
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000). Giữ terminal đang chạy trong lúc sử dụng. Nhấn `Ctrl+C` khi muốn dừng.

Lần đầu chạy với cơ sở dữ liệu mới, chương trình tự tạo bảng và thêm sản phẩm mẫu. Những lần sau tiếp tục dùng dữ liệu đã lưu.

## Tài khoản quản trị

Tài khoản được tạo khi khởi tạo cơ sở dữ liệu mới.

| Thông tin | Giá trị |
| --- | --- |
| Email | `admin@shopshoe.local` |
| Mật khẩu | `ShopShoe@2026` |

Sau khi đăng nhập, vào hồ sơ để đổi mật khẩu. Nếu đã đổi trước đó, dùng mật khẩu bạn đã đặt.

## Mua hàng

1. Tìm giày theo tên hoặc chọn thương hiệu, danh mục, size, màu và khoảng giá. Bấm **Áp dụng bộ lọc** để xem kết quả.
2. Mở sản phẩm, chọn size, màu và số lượng rồi thêm vào giỏ.
3. Kiểm tra giỏ hàng, đăng nhập hoặc đăng ký tài khoản.
4. Nhập họ tên, số điện thoại và địa chỉ nhận hàng.
5. Chọn phương thức thanh toán, kiểm tra tổng tiền và xác nhận đặt hàng.
6. Vào hồ sơ để xem lịch sử đơn. Mở chi tiết đơn để theo dõi trạng thái.

Có thể gửi đánh giá sản phẩm sau khi đơn chứa sản phẩm đó đã được giao. Mỗi tài khoản đánh giá một lần cho mỗi sản phẩm.

## Quản trị

Đăng nhập bằng tài khoản quản trị rồi mở mục tương ứng trong menu.

- **Sản phẩm** — thêm sản phẩm, sửa thông tin, tải ảnh và nhập tồn kho cho từng size/màu. Khi xóa sản phẩm, sản phẩm được ngừng bán và lịch sử đơn vẫn được giữ.
- **Đơn hàng** — xem chi tiết và chuyển lần lượt từ chờ xác nhận sang chuẩn bị, đang giao, đã giao. Khi hủy đơn chưa thanh toán ở bước chờ hoặc chuẩn bị, cần nhập lý do. Số lượng đã đặt được trả lại kho.
- **Người dùng** — sửa thông tin, phân quyền hoặc khóa/mở khóa tài khoản. Thao tác xóa khách hàng hiện được xử lý bằng cách khóa tài khoản để giữ lịch sử đơn.

Tồn kho được trừ khi tạo đơn thành công. Đơn đã xác nhận thanh toán chưa hỗ trợ hủy trực tiếp trong phiên bản này.

## Thanh toán và cách tính tiền

- **COD** — thanh toán khi nhận hàng. Hệ thống ghi nhận đã thu tiền khi quản trị chuyển đơn sang đã giao.
- **Chuyển khoản giả lập** — quản trị xác nhận đã thu tiền trước khi hoàn tất giao hàng. Chức năng dùng để thực hành quy trình, chưa kết nối ngân hàng.

Giá hiển thị theo USD. Tiền hàng trên 100 USD được miễn phí giao hàng, các đơn còn lại có phí 10 USD. Thuế mô phỏng là 15% tiền hàng. Máy chủ tính lại tổng tiền khi tạo đơn.

## Lưu và sao lưu dữ liệu

Dữ liệu nằm trong thư mục `data`, ảnh tải lên nằm trong `uploads`. Dừng chương trình trước khi sao lưu cả hai thư mục. Khi chuyển máy, chép chúng vào đúng vị trí trong dự án trước khi chạy.

GitHub lưu mã nguồn và ảnh sản phẩm mẫu. Tệp `.env`, cơ sở dữ liệu và ảnh tải lên được lưu riêng trên từng máy.

## Kiểm tra và tạo bản dựng

```powershell
# Kiểm thử giao diện
npm test --prefix frontend -- --run

# Tạo bản dựng tại frontend/build
npm run build --prefix frontend

# Kiểm tra cảnh báo bảo mật của thư viện
npm audit
npm audit --prefix frontend
```

## Khi gặp lỗi

| Hiện tượng | Cách kiểm tra |
| --- | --- |
| Không mở được trang | Kiểm tra terminal còn chạy `npm run dev` và mở đúng cổng 3000. |
| Báo cổng đang được sử dụng | Dừng phiên ShopShoe đang chạy ở terminal khác rồi chạy lại. |
| Báo thiếu `JWT_SECRET` | Kiểm tra `.env` nằm ở thư mục gốc và đã điền `JWT_SECRET`. |
| Bộ lọc không có kết quả | Bấm **Xóa bộ lọc**, kiểm tra cả từ khóa tìm kiếm và thuộc tính đã nhập trong sản phẩm. |
| Không đặt được hàng | Kiểm tra số lượng còn lại của size/màu và điền đủ thông tin nhận hàng. |
| Phiên đăng nhập hết hạn | Đăng xuất rồi đăng nhập lại. |
