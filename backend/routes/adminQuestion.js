import express from "express";
import { getAllQuestions, deleteQuestion } from "../controllers/adminQuestionController.js";
import { authenticate, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Lấy tất cả câu hỏi
router.get("/", authenticate, isAdmin, getAllQuestions);

// Xóa câu hỏi (cưỡng chế)
router.delete("/:id", authenticate, isAdmin, deleteQuestion);

export default router;
