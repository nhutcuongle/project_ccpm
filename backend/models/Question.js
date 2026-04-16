import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    images: [{ type: String }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approved: { type: Boolean, default: true },
    hashtags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hashtag" }],
    score: { type: Number, default: 0 },
    answersCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Tối ưu cho việc lấy feed (Mới nhất, đã duyệt)
questionSchema.index({ approved: 1, createdAt: -1 });

// Tối ưu cho việc lọc theo hashtag
questionSchema.index({ hashtags: 1, approved: 1 });

// Tối ưu cho việc sắp xếp theo độ phổ biến (Popular)
questionSchema.index({ score: -1, answersCount: -1 });

// Text index để tìm kiếm hiệu quả hơn regex (dành cho tìm kiếm text)
questionSchema.index({ title: "text", content: "text" });

export default mongoose.model("Question", questionSchema);