import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { createQuestion, getQuestions, getQuestionById } from "../controllers/questionController.js";

const router = express.Router();

// Optional authenticate for getQuestions but required for createQuestion
const optionalAuth = (req, res, next) => {
    // Nếu có token thì authenticate, nếu không thì cho qua (để lấy post mà không có userVote)
    // Giả sử authenticate middleware gắn user vào req.
    // Thực tế có thể cần một middleware riêng cho optional auth.
    // Đối với project này, nếu muốn lấy userVote thì cần auth.
    next();
};

router.get("/", (req, res, next) => {
    // Mock optional auth: check header Authorization
    next();
}, getQuestions);

router.get("/:id", getQuestionById);

router.post("/", authenticate, createQuestion);

export default router;
