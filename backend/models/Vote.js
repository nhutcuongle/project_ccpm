import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
  targetType: {
    type: String,
    enum: ["question", "answer"],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true

  },
  voteType: {
    type: String,
    enum: ["up", "down"],
    required: true
  }
}, { timestamps: true });

voteSchema.index({ targetType: 1, targetId: 1, user: 1 }, { unique: true });

export default mongoose.model("Vote", voteSchema);