import * as voteService from "../services/voteService.js";

export const toggleVote = async (req, res) => {
  try {
    const { targetType, targetId, voteType } = req.body;
    const userId = req.user.id; // Lấy ID qua token ở authenticateMiddleware

    if (!["question", "answer"].includes(targetType)) {
      return res.status(400).json({ message: "Loại đối tượng không hợp lệ." });
    }

    if (!["up", "down"].includes(voteType)) {
      return res.status(400).json({ message: "voteType chỉ chấp nhận 'up' hoặc 'down'." });
    }

    const { score, userVote } = await voteService.handleVote(
      targetType,
      targetId,
      userId,
      voteType
    );
    res.status(200).json({ message: "Thành công.", score, userVote });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
