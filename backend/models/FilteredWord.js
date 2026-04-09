import mongoose from "mongoose";

const filteredWordSchema = new mongoose.Schema({
  word: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: ["text"],
    default: "text",
  },
  action: { type: String, enum: ["block", "pending", "censor"], default: "pending" },
  hitCount: { type: Number, default: 0 },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
}, { timestamps: true });

export default mongoose.model("FilteredWord", filteredWordSchema);