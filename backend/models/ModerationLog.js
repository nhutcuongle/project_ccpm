import mongoose from "mongoose";

const moderationLogSchema = new mongoose.Schema({
  moderator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  targetType: { type: String, enum: ["question", "answer"], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  action: { type: String, enum: ["approve", "delete"], required: true },
  reason: { type: String }
}, { timestamps: true });

export default mongoose.model("ModerationLog", moderationLogSchema);