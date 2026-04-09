import jwt from "jsonwebtoken";
import User from "../models/User.js"; // cần thêm

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Thiếu token." });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select(
      "_id username role permissions isDisabled"
    );

    if (!user)
      return res.status(401).json({ message: "Người dùng không tồn tại." });

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token không hợp lệ." });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Chỉ admin được phép." });
  next();
};