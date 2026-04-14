import express from "express";
import { getSystemStats } from "../controllers/adminStatsController.js";
import { authenticate, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Lấy thống kê hệ thống
router.get("/", authenticate, isAdmin, getSystemStats);

export default router;
