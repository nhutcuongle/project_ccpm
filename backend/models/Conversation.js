import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ], // 2 người (có thể mở rộng cho group)
    lastMessage: {
      text: String,
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: Date,
    },
   
    status: {
      type: String,
      enum: ["active", "pending", "rejected"],
      default: "active",
    },
    // nếu pending, xác định ai là recipient (người nhận yêu cầu)
    requestedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    unreadCounts: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        count: Number,
      },
    ],
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]

    
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", ConversationSchema);