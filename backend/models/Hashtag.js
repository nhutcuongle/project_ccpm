import mongoose from "mongoose";

const hashtagSchema = new mongoose.Schema(
  {
    // Tên hashtag (không bao gồm dấu #, tự động lowercase + trim)
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Số lượng bài viết sử dụng hashtag này (dùng cho trending)
    postCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index để tìm kiếm hashtag nhanh
hashtagSchema.index({ postCount: -1 });

export default mongoose.model("Hashtag", hashtagSchema);
