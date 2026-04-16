import express from "express";
import multer from "multer";
import { storage } from "../utils/cloudinary.js";
import { updateProfile, changePassword, getCurrentUser, getUserById, getUserByIdentifier, searchUsers, updateAvatar } from "../controllers/userController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const upload = multer({ storage });


const router = express.Router();

router.get("/search", authenticate, searchUsers);
router.get("/me", authenticate, getCurrentUser);
router.get("/identifier/:identifier", authenticate, getUserByIdentifier);
router.get("/:userId", authenticate, getUserById);
router.put("/update-profile", authenticate, updateProfile);
router.put("/update-avatar", authenticate, upload.single("avatar"), updateAvatar);
router.put("/change-password", authenticate, changePassword);


export default router;

