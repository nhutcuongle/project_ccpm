# Kế Hoạch & Phân Công Nhiệm Vụ Backend

Tài liệu này xác định rõ ràng trách nhiệm của từng thành viên trong team nhằm hoàn thiện phần Backend của ứng dụng **Q&A Forum & Chat**.

**Lưu ý chung:**
- Cấu trúc chung: **Routes -> Controllers -> Services -> Repositories**.
- *Auth, User Profile và Admin Management hiện tại đã được Code sẵn làm mẫu chuẩn.* Các module mới bắt buộc phải đi theo thiết kế 3-tier này.
- Mọi API lấy danh sách dữ liệu (GET list) bắt buộc phải có phân trang (`limit`, `skip`).

---

## 👨‍💻 Thành viên 1: Core Q&A & Feed (Xử lý bài đăng chính)
**Nhiệm vụ:** Chịu trách nhiệm cho luồng tạo câu hỏi chính và hiển thị trang chủ/tìm kiếm dựa trên Hashtag.

**Các Models liên quan:** `Question.js`, `Hashtag.js`

**Các tác vụ cụ thể:**
1. **Quản lý Câu Hỏi (Question API):**
   - API tạo câu hỏi (tiêu đề, nội dung, images, thêm mảng `hashtags`).
   - API sửa và xóa câu hỏi (Chỉ tác giả hoặc admin mới được làm).
   - Cấu hình middleware `multer` / `cloudinary` phục vụ riêng cho việc up ảnh của câu hỏi (Tham khảo file `utils/cloudinary.js`).
2. **Hashtag System:**
   - Khi tạo bài viết, API phải tách mảng hastag text (vd: `#laptrinh`), tự động tạo document trong `Hashtag.js` (nếu chưa có) và tăng `postCount` lên 1. Nếu có rồi thì chỉ tăng count.
   - API lấy danh sách Hashtag phổ biến (trending) trả về frontend.
3. **Feed & Search:**
   - Cung cấp API Lấy danh sách câu hỏi (Feed) cho trang chủ, sắp xếp theo thời gian hoặc ngẫu nhiên.
   - Cung cấp API Lấy danh sách câu hỏi theo 1 hashtag cụ thể (vd: GET `/api/questions?hashtag=nodejs`).

---

## 👨‍💻 Thành viên 2: Tương Tác Bài Viết (Interaction & Engagement)
**Nhiệm vụ:** Chịu trách nhiệm cho hệ thống bình luận, trả lời, tính toán điểm vote. Phần này đòi hỏi logic kỹ thuật xử lý dữ liệu (Cập nhật cache số lượng).

**Các Models liên quan:** `Answer.js`, `Vote.js`

**Các tác vụ cụ thể:**
1. **Answer & Comment:**
   - API trả lời câu hỏi và cập nhật trường `answersCount` bên trong `Question.js` lên +1.
   - API sửa, xóa câu trả lời (Cập nhật lại `answersCount` nếu xóa).
   - API bình luận (Comment) lên các bài đăng.
2. **Hệ Thống Bình Chọn (Voting):**
   - API thực hiện Upvote/Downvote một `Question` hoặc một `Answer` (Dựa trên `targetType` và `targetId`).
   - Xử lý mượt logic: Chặn không cho user vote liên tục, đồng thời tự động cập nhật trường `score` tổng cộng ở trong `Question.js`/`Answer.js` sau mỗi lần cộng/trừ điểm.


---

## 👨‍💻 Thành viên 3: Nhắn Tin Real-time & Chat System
**Nhiệm vụ:** Chịu trách nhiệm phần tính năng khá độc lập là Chat. Cần phối hợp song song xử lý lưu Database và truyền tải WebSockets để đạt trạng thái Real-time.

**Các Models liên quan:** `Conversation.js`, `Message.js`, cấu hình `server.js`

**Các tác vụ cụ thể:**
1. **REST API cho Cuộc Trò Chuyện:**
   - API kết nối (Tạo conversation mới giữa 2 người, hoặc load lại cuộc cũ nếu đã có). Phải bắt chặt logic request trạng thái `pending`.
   - API Lấy danh sách toàn bộ cuộc trò chuyện của một user (Hiển thị preview tin cuối và `unreadCounts`).
2. **REST API cho Tin Nhắn:**
   - API Lấy lịch sử chat của 1 Conversation (có phân trang).
   - API Tạo tin nhắn mới (cho phép chèn hình ảnh nếu có).
   - API Thu hồi `isRecalled` và Xóa ở phía bản thân `deletedFor`.
3. **Tích hợp WebSockets (Socket.io):**
   - Chạy `socket.io` trên cùng port backend.
   - Khi API bắn tin đi -> Đồng thời emit Socket báo hiệu tin nhắn đến cho đối phương (nếu họ đang online) để Frontend push text ngay lập tức mà không phải Refresh.
   - Emit tin nhắn trạng thái "Đã đọc", "Đã nhận".

---

## 🤝 Giao Tiếp Trong Team

**Lưu ý cho việc ghép nối (Integration):**
- **Mem 1 và Mem 2:** Hai phần Q&A và Interaction có liên kết với nhau chặt chẽ. Hai bạn cần thống nhất kỹ tên tham số (Params/Body) truyền lên lấy ID bài viết, tránh việc người làm biến `postId` người làm biến `questionId`.
- **Mem 3:** Nên code REST API chạy mượt trên Postman trước rồi bắt đầu ghép Socket sau cùng để đỡ rối lỗi.

Hãy dùng Postman share bộ API Collection với cho toàn đội và liên tục Review code cho nhau hằng ngày nhé. Chúc anh em code mượt, không sập Bug!