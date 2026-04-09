import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isDisabled: { type: Boolean, default: false }, // ✅ thêm dòng này
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },

    fullName: { type: String, default: "" },
    address: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    identifier: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);