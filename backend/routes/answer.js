import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { createAnswer, updateAnswer, deleteAnswer, getAnswers } from "../controllers/answerController.js";

const router = express.Router();

router.post("/", authenticate, createAnswer);
router.get("/", getAnswers); // Thêm route lấy danh sách answer
router.put("/:id", authenticate, updateAnswer);
router.delete("/:id", authenticate, deleteAnswer);

export default router;
