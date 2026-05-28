<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/94092bf9-d484-4b67-831b-479a788cb39d

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## 🔑 HƯỚNG DẪN ĐĂNG NHẬP / LOGIN INSTRUCTIONS

Hệ thống Reno Coffee sử dụng cơ chế **Đăng nhập Hợp nhất (Unified Login)**. Cả Khách hàng và Nhân viên đều đăng nhập trên cùng một giao diện Đăng nhập duy nhất:
- Điền **SĐT Khách hàng** hoặc **ID Nhân viên** vào ô tài khoản.
- Nhập mật khẩu/mã ca tương ứng. Hệ thống sẽ tự động phân quyền và chuyển hướng phù hợp.

---

### 👥 Tài khoản Nhân viên Cửa hàng (Staff Accounts)
Sử dụng các thông tin sau để đăng nhập vào màn hình Quản trị (Dashboard POS/Admin):

| ID Nhân viên | Mật khẩu | Tên Nhân viên | Vai trò / Phân quyền | Chi nhánh Mặc định |
| :--- | :--- | :--- | :--- | :--- |
| **`bar-1`** | `1234` | Phạm Minh Đức | **Manager** (Quản lý cửa hàng) | Reno Flagship Roastery |
| **`bar-2`** | `1234` | Lê Hoàng Giang | **Head Barista** (Trưởng ca pha chế) | Reno Espresso Bar |
| **`bar-3`** | `1234` | Trần Minh Hải | **Roaster** (Thợ rang cà phê) | Reno Flagship Roastery |
| **`bar-4`** | `1234` | Nguyễn Duy Anh | **Apprentice** (Nhân viên học việc) | Reno Garden Coffee |

*Lưu ý: Mật khẩu mặc định cho toàn bộ nhân viên thử nghiệm là **`1234`**.*

---

### 🛍️ Tài khoản Khách hàng (Customer Accounts)
- Bạn có thể nhập bất kỳ **Số điện thoại Việt Nam hợp lệ** (Ví dụ: `0912345678`) để đăng nhập nhanh.
- Nếu số điện thoại chưa được đăng ký, chọn **Tạo tài khoản mới** ngay dưới form để đăng ký thành viên và bắt đầu tích lũy điểm thưởng!

