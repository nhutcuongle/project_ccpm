import express from "express";
import { updateProfile, changePassword, getCurrentUser } from "../controllers/userController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/me", authenticate, getCurrentUser);
router.put("/update-profile", authenticate, updateProfile);
router.put("/change-password", authenticate, changePassword);

export default router;
