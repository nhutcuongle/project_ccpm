import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { sendMessage, recallMessage } from "../controllers/messageController.js";

const router = express.Router();

// Tất cả routes đều cần đăng nhập
router.use(authenticate);

// Gửi tin nhắn: POST /api/messages { convId, text }
router.post("/", sendMessage);

// Thu hồi tin nhắn: DELETE /api/messages/:id/recall
router.delete("/:id/recall", recallMessage);

export default router;
