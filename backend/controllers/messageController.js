import * as messageService from "../services/messageService.js";

/**
 * POST /api/messages
 * Gửi tin nhắn
 * Body: { convId, text }
 */
export const sendMessage = async (req, res) => {
  try {
    const { convId, text } = req.body;
    if (!convId) return res.status(400).json({ message: "Thiếu convId" });

    const message = await messageService.sendMessage(req.user._id, convId, text);
    res.status(201).json({ message });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * DELETE /api/messages/:id/recall
 * Thu hồi tin nhắn
 */
export const recallMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await messageService.recallMessage(req.user._id, id);
    res.json({ message });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * DELETE /api/messages/:id/delete-for-me
 * Xóa tin nhắn từ phía mình
 */
export const deleteForMe = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await messageService.deleteForMe(req.user._id, id);
    res.json({ message });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
