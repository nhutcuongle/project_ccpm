
import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// 📸 Storage cho hình ảnh
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "qna-images",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ quality: "auto", fetch_format: "webp" }],
  },
});

// 🎥 Storage cho video
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "qna-videos",
    resource_type: "video",
    allowed_formats: ["mp4", "mov", "avi", "webm"],
    transformation: [{ quality: "auto", fetch_format: "mp4" }],
  },
});

export { cloudinary, storage, videoStorage };