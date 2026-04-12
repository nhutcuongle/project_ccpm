import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { toggleVote } from "../controllers/voteController.js";

const router = express.Router();

router.post("/", authenticate, toggleVote);

export default router;
