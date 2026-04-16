import express from "express";
import { getAllQuestions, deleteQuestion, approveQuestion, rejectQuestion } from "../controllers/adminQuestionController.js";
import { authenticate, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authenticate);
router.use(isAdmin);

router.get("/", getAllQuestions);
router.delete("/:id", deleteQuestion);
router.patch("/:id/approve", approveQuestion);
router.delete("/:id/reject", rejectQuestion);

export default router;
