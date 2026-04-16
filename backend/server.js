import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import compression from "compression";
import helmet from "helmet";
import User from "./models/User.js";

import authRoutes from "./routes/auth.js";
import adminUserRoutes from "./routes/adminUser.js";
import adminQuestionRoutes from "./routes/adminQuestion.js";
import adminStatsRoutes from "./routes/adminStats.js";
import adminBannedWordRoutes from "./routes/adminBannedWord.js";

import userRoutes from "./routes/user.js";
import voteRoutes from "./routes/vote.js";
import answerRoutes from "./routes/answer.js";
import questionRoutes from "./routes/question.js";
import followRoutes from "./routes/follow.js";
import conversationRoutes from "./routes/conversation.js";
import messageRoutes from "./routes/message.js";
import hashtagRoutes from "./routes/hashtag.js";
import { authenticate, isAdmin } from "./middlewares/authMiddleware.js";
import { initIo } from "./socket.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// ==============================
// SOCKET.IO SETUP
// ==============================
const io = new Server(httpServer, {
  cors: {
    origin: [process.env.CLIENT_URL || "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  },
});

// Khởi tạo singleton io để dùng trong services
initIo(io);

// Middleware xác thực socket bằng JWT
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Thiếu token xác thực"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("_id username avatar");
    if (!user) return next(new Error("Người dùng không tồn tại"));

    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Token không hợp lệ"));
  }
});

io.on("connection", (socket) => {
  const userId = String(socket.user._id);
  console.log(`🔌 Socket connected: ${socket.user.username} (${socket.id})`);

  // Join room cá nhân để nhận notifications
  socket.join(`user_${userId}`);

  // Join vào room conversation khi user mở cuộc hội thoại
  socket.on("join_conversation", (convId) => {
    socket.join(`conv_${convId}`);
  });

  // Rời room conversation
  socket.on("leave_conversation", (convId) => {
    socket.leave(`conv_${convId}`);
  });

  // Typing indicator
  socket.on("typing", ({ convId }) => {
    socket.to(`conv_${convId}`).emit("user_typing", {
      userId,
      username: socket.user.username,
    });
  });

  socket.on("stop_typing", ({ convId }) => {
    socket.to(`conv_${convId}`).emit("user_stop_typing", { userId });
  });

  socket.on("disconnect", (reason) => {
    console.log(`❌ Socket disconnected: ${socket.user.username} | Reason: ${reason}`);
  });
});

// ==============================
// EXPRESS MIDDLEWARE
// ==============================
app.use(helmet()); // Bảo mật các HTTP header
app.use(compression()); // Nén dữ liệu gửi đi (Gzip)
app.use(
  cors({
    origin: [process.env.CLIENT_URL || "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);
app.use(express.json());

// ==============================
// RATE LIMITING (Phase 1 Scaling)
// ==============================
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  limit: 100, // Ghới hạn 100 requests cho mỗi IP mỗi 15 phút
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau 15 phút.",
  },
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  limit: 20, // Chỉ cho phép 20 lần thử đăng nhập/đăng ký mỗi giờ mỗi IP
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Quá nhiều nỗ lực xác thực từ IP này, vui lòng thử lại sau 1 giờ.",
  },
});

// Áp dụng limiter chung cho tất cả API
app.use("/api", apiLimiter);

// ==============================
// ROUTES
// ==============================
app.use("/api/auth", authLimiter, authRoutes);

app.use("/api/protected", authenticate, (req, res) => {
  res.json({ message: `Xin chào ${req.user.role}`, id: req.user.id });
});

app.use("/api/admin-only", authenticate, isAdmin, (req, res) => {
  res.json({ message: "Bạn là admin!" });
});

app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/questions", adminQuestionRoutes);
app.use("/api/admin/stats", adminStatsRoutes);
app.use("/api/admin/banned-words", adminBannedWordRoutes);

app.use("/api/user", userRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/hashtags", hashtagRoutes);

// ==============================
// CONNECT DB & START
// ==============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    httpServer.listen(process.env.PORT, () =>
      console.log(`✅ Server running on http://localhost:${process.env.PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
