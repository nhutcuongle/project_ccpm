# Hướng Dẫn Cài Đặt Dự Án Q&A Forum (MERN Stack)

Chào mừng đến với dự án **Q&A Forum**! Repository này bao gồm cả backend (Node.js/Express) và frontend (React/Vite). Hãy làm theo các hướng dẫn dưới đây để cấu hình và chạy dự án trên máy cá nhân của bạn.

## 📌 Các Yêu Cầu Cần Thiết

Trước khi bắt đầu, hãy đảm bảo rằng máy tính của bạn đã được cài đặt các phần mềm sau:

- **Node.js** (Khuyên dùng phiên bản v18 trở lên) và **npm**
- **MongoDB** (Local hoặc sử dụng MongoDB Atlas)
- **Git** (Quản lý phiên bản mã nguồn)
- Một IDE như VS Code (đảm bảo đã cài đặt tiện ích mở rộng như ESLint/Prettier)

---

## 🚀 Cài Đặt Backend (Node.js & MongoDB)

Backend được xây dựng dựa trên **Node.js**, **Express**, **Mongoose**, và kết nối với cơ sở dữ liệu **MongoDB**.

### 1. Di chuyển vào thư mục Backend
```bash
cd backend
```

### 2. Cài đặt Dependencies (Thư Viện)
```bash
npm install
```

### 3. Cấu Hình Biến Môi Trường (Environment Variables)
Tạo một file `.env` nằm trong thư mục `backend/` (ngang hàng với `package.json`) dựa theo cấu trúc của file `.env.example`.

Các Biến Môi Trường Chỉnh Sửa Quan Trọng:
- `PORT`: Cổng chạy server (Thường đặt là `5000`)
- `MONGO_URI`: Đường dẫn kết nối CSDL MongoDB (VD: `mongodb://localhost:27017/qna_db` hoặc link MongoDB Atlas)
- `JWT_SECRET`: Khóa bí mật dùng để mã hoá/giải mã token JWT.
- Các khóa bên thứ 3 khác: JWT_EXPIRES_IN, Cloudinary keys...

### 4. Build & Khởi Chạy Ứng Dụng

**Để bắt đầu chạy ứng dụng (Môi trường phát triển):**
```bash
npm run dev
```

Backend server sẽ chính thức hoạt động tại địa chỉ: `http://localhost:5000` (hoặc cổng bạn đã set trong file `.env`).

---

## 🎨 Cài Đặt Frontend (React + Vite)

Frontend là một Web App hiện đại được xây dựng qua sự kết hợp của **React**, **Vite** và **Tailwind CSS**.

### 1. Di chuyển vào thư mục Frontend
Mở một cửa sổ Terminal mới (hoặc tab mới) ở thư mục gốc của project (hehehe) và trỏ vào thư mục:
```bash
cd frontend
```

### 2. Cài đặt Dependencies (Thư Viện)
Cài đặt tất cả các gói package cần thiết:
```bash
npm install
```

### 3. Cấu Hình Biến Môi Trường
Tạo file `.env` (hoặc sửa trực tiếp code theo link IP tuỳ setup file hiện tại của team bạn) với biến trỏ về Backend API:
Ví dụ: `VITE_API_BASE_URL=http://localhost:5000/api`

### 4. Khởi Chạy Máy Chủ Phát Triển (Development Server)
Sau khi cài đặt xong dependencies, hãy chạy môi trường dev của Vite:
```bash
npm run dev
```

Frontend app sẽ hoạt động qua cổng local và bình thường có thể truy cập tại `http://localhost:5173`.

---

## 💡 Quy Trình Git & Tránh Xung Đột Code (Conflict)

Để đảm bảo source code của dự án luôn chạy ổn định và tránh lỗi phát sinh khi nhiều người cùng làm, team cần tuân thủ quy trình Git dưới đây:

### 1. Quy Trình Chia Nhánh (Branching Strategy)
Không code trực tiếp lên nhánh `main`. Quy định tên nhánh nên theo chuẩn sau:
- **`main`**: Nhánh chứa source code ổn định nhất, dùng để build/deploy. Tuyệt đối không push code trực tiếp lên đây.
- **`dev`** (hoặc `develop`): Nhánh tổng hợp code từ các thành viên để test chung trước khi đưa lên `main`.
- **Nhánh tính năng (Feature)**: Định dạng `feature/ten-tinh-nang` (VD: `feature/login-api`, `feature/chat-box`).
- **Nhánh sửa lỗi (Bugfix)**: Định dạng `bugfix/ten-loi` (VD: `bugfix/fix-user-model`).

### 2. Các Bước Làm Việc Hàng Ngày (Tránh Conflict)

**Trước khi bắt đầu code mới:**
1. Di chuyển về nhánh `dev`: `git checkout dev`
2. Lấy code mới nhất từ mọi người: `git pull origin dev`
3. Tạo nhánh mới của bạn từ nhánh `dev`: `git checkout -b feature/ten-tinh-nang-cua-ban`

**Trong lúc code:**
- Thường xuyên commit các thay đổi nhỏ, tránh để dồn một cục lớn mới commit.
- **Quy tắc ghi Commit Message:** Prefix + Cụm từ mô tả ngắn gọn:
  - `feat: Thêm repository pattern`
  - `fix: Bắt lỗi crash lúc query database`
  - `ui: Chỉnh lại màu nút Submit`
  - `docs: Cập nhật README`

**Khi hoàn thành code và chuẩn bị push:**
1. Lưu lại các thay đổi của bạn: `git commit -m "feat: Nội dung gì đó"`
2. **QUAN TRỌNG:** Quay lại nhánh `dev` và pull code mới nhất (đề phòng có ai đó vừa đẩy code lên trong lúc bạn đang làm): 
   `git checkout dev` 👉 `git pull origin dev`
3. Trở lại nhánh của bạn và merge (hoặc rebase) nhánh `dev` vào nhánh của bạn: 
   `git checkout feature/ten-tinh-nang-cua-ban` 👉 `git merge dev`
4. Nếu có **conflict (xung đột)**, Git sẽ báo cho bạn. Bạn mở VS Code lên, tìm các file bị báo đỏ, thảo luận với người viết đoạn code đó (nếu cần), rồi xóa các dòng đánh dấu dư thừa `<<<<<<<` và `>>>>>>>`, chọn phần code đúng nhất.
5. Sau khi giải quyết conflict xong: `git add .` 👉 `git commit -m "Merge dev and resolve conflict"`
6. Đẩy nhánh của bạn lên Github: `git push origin feature/ten-tinh-nang-cua-ban`

### 3. Review Code (Pull Request)
- Lên Github/Gitlab tạo **Pull Request (PR)** từ nhánh `feature/...` của bạn vào nhánh `dev`.
- Yêu cầu ít nhất 1 thành viên khác (hoặc Tech Lead) vào xem code.
- Nhớ nhắc các bạn review nếu file `.env.example` hoặc `package.json` có cài đặt thêm thư viện, yêu cầu mọi người `npm install` lại để tránh lỗi.