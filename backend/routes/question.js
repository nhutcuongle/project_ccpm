import express from "express";
import multer from "multer";
import { storage } from "../utils/cloudinary.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import * as questionController from "../controllers/questionController.js";

const upload = multer({ storage });
const router = express.Router();

// Public routes
router.get("/", questionController.getQuestions);
router.get("/:id", questionController.getQuestionById);

// Protected routes
router.post("/", authenticate, upload.array("images", 5), questionController.createQuestion);
router.put("/:id", authenticate, questionController.updateQuestion);
router.delete("/:id", authenticate, questionController.deleteQuestion);

export default router;
