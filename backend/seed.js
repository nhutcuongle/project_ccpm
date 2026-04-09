import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Đã kết nối MongoDB.");

 
    const adminEmail = "admin@gmail.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("⚠️ Tài khoản admin này đã tồn tại.");
      process.exit(0);
    }

  
    const hashedPassword = await bcrypt.hash("123456", 10);

    const adminUser = new User({
      username: "admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      identifier: "admin_super_user", 
      fullName: "Administrator",
    });

    await adminUser.save();
    console.log("🚀 Đã tạo tài khoản admin thành công!");
    console.log("📧 Email: admin@gmail.com");
    console.log("🔑 Password: 123456");

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi khi tạo tài khoản admin:", error);
    process.exit(1);
  }
};

seedAdmin();
