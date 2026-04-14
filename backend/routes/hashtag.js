import express from "express";
import * as hashtagController from "../controllers/hashtagController.js";

const router = express.Router();

router.get("/trending", hashtagController.getTrendingHashtags);

export default router;
