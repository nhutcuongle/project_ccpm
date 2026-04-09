import mongoose from "mongoose";


const MessageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String },
  attachments: [{ url: String, type: String }], // optional
  status: { type: String, enum: ["sent","delivered","read"], default: "sent" },
  createdAt: { type: Date, default: Date.now },
  isRecalled: { type: Boolean, default: false },   // Thu hồi mọi người
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // xóa phía bạn
  edited: { type: Boolean, default: false },
});

export default mongoose.model("Message", MessageSchema);