import express from "express";
import * as followController from "../controllers/followController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes (or could be protected if desired)
router.get("/followers/:userId", followController.getFollowers);
router.get("/following/:userId", followController.getFollowing);

// Protected routes
router.post("/:userId", authenticate, followController.followUser);
router.delete("/:userId", authenticate, followController.unfollowUser);
router.get("/status/:userId", authenticate, followController.getFollowStatus);

export default router;
