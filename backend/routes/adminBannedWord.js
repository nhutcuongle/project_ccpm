import express from "express";
import { getBannedWords, addBannedWord, deleteBannedWord } from "../controllers/adminBannedWordController.js";
import { authenticate, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Tất cả các route này yêu cầu quyền admin
router.use(authenticate);
router.use(isAdmin);

router.get("/", getBannedWords);
router.post("/", addBannedWord);
router.delete("/:id", deleteBannedWord);

export default router;
