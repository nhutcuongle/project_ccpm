import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import adminUserRoutes from "./routes/adminUser.js";
import userRoutes from "./routes/user.js";
import { authenticate, isAdmin } from "./middlewares/authMiddleware.js";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// ==============================
// ROUTES
// ==============================
app.use("/api/auth", authRoutes);

app.use("/api/protected", authenticate, (req, res) => {
  res.json({ message: `Xin chào ${req.user.role}`, id: req.user.id });
});

app.use("/api/admin-only", authenticate, isAdmin, (req, res) => {
  res.json({ message: "Bạn là admin!" });
});

app.use("/api/admin/users", adminUserRoutes);
app.use("/api/user", userRoutes);

// ==============================
// CONNECT DB & START
// ==============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log(`✅ Server running on http://localhost:${process.env.PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
