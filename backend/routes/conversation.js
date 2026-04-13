import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getActiveConversations,
  getPendingConversations,
  getPendingCount,
  startConversation,
  acceptRequest,
  rejectRequest,
  getMessages,
} from "../controllers/conversationController.js";

const router = express.Router();

// Tất cả routes đều cần đăng nhập
router.use(authenticate);

// Lấy danh sách cuộc hội thoại chính (active)
router.get("/", getActiveConversations);

// Lấy danh sách tin nhắn chờ (pending)
router.get("/pending", getPendingConversations);

// Đếm số tin nhắn chờ (badge)
router.get("/pending/count", getPendingCount);

// Bắt đầu hoặc lấy conversation với user khác
router.post("/start/:recipientId", startConversation);

// Chấp nhận yêu cầu nhắn tin
router.post("/:id/accept", acceptRequest);

// Từ chối yêu cầu nhắn tin
router.post("/:id/reject", rejectRequest);

// Lấy tin nhắn của conversation (có phân trang ?page=1)
router.get("/:id/messages", getMessages);

export default router;
