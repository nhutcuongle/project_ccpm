import express from "express";
import { updateProfile, changePassword, getCurrentUser, getUserById, getUserByIdentifier, searchUsers } from "../controllers/userController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/search", authenticate, searchUsers);
router.get("/me", authenticate, getCurrentUser);
router.get("/identifier/:identifier", authenticate, getUserByIdentifier);
router.get("/:userId", authenticate, getUserById);
router.put("/update-profile", authenticate, updateProfile);
router.put("/change-password", authenticate, changePassword);

export default router;

