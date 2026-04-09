// routes/admin/user.routes.js
import express from "express";
import {
  getAllUsers,
  toggleDisableUser,
  deleteUser,
} from "../controllers/adminUserController.js";
import { authenticate, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Lấy tất cả người dùng
router.get("/", authenticate, isAdmin, getAllUsers);

// Vô hiệu hóa hoặc kích hoạt người dùng
router.put("/:id/toggle-disable", authenticate, isAdmin, toggleDisableUser);

// Xóa người dùng
router.delete("/:id", authenticate, isAdmin, deleteUser);

export default router;
