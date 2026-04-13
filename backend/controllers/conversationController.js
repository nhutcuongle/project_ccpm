import * as conversationService from "../services/conversationService.js";
import * as messageService from "../services/messageService.js";

/**
 * GET /api/conversations
 * Lấy danh sách active conversations của user đang đăng nhập
 */
export const getActiveConversations = async (req, res) => {
  try {
    const conversations = await conversationService.getActiveConversations(req.user._id);
    res.json({ conversations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/conversations/pending
 * Lấy danh sách tin nhắn chờ (user là recipient)
 */
export const getPendingConversations = async (req, res) => {
  try {
    const [pending, sent] = await Promise.all([
      conversationService.getPendingConversations(req.user._id),
      conversationService.getSentPendingConversations(req.user._id),
    ]);
    res.json({ pending, sent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/conversations/pending/count
 * Đếm số tin nhắn chờ (dùng cho badge)
 */
export const getPendingCount = async (req, res) => {
  try {
    const count = await conversationService.countPendingRequests(req.user._id);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/conversations/start/:recipientId
 * Bắt đầu hoặc lấy conversation với một user
 */
export const startConversation = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const conversation = await conversationService.getOrCreateConversation(
      String(req.user._id),
      recipientId
    );
    res.json({ conversation });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * POST /api/conversations/:id/accept
 * Chấp nhận tin nhắn chờ
 */
export const acceptRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await conversationService.acceptRequest(id, req.user._id);

    // Emit socket event để cả 2 phía biết
    const { getIo } = await import("../socket.js");
    const io = getIo();
    if (io) {
      io.to(`conv_${id}`).emit("request_accepted", { conversationId: id });
    }

    res.json({ conversation, message: "Đã chấp nhận yêu cầu nhắn tin" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * POST /api/conversations/:id/reject
 * Từ chối tin nhắn chờ
 */
export const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await conversationService.rejectRequest(id, req.user._id);

    // Emit socket event để sender biết
    const { getIo } = await import("../socket.js");
    const io = getIo();
    if (io) {
      io.to(`conv_${id}`).emit("request_rejected", { conversationId: id });
    }

    res.json({ conversation, message: "Đã từ chối yêu cầu nhắn tin" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/conversations/:id/messages
 * Lấy tin nhắn của một conversation (có phân trang)
 */
export const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const result = await messageService.getMessages(req.user._id, id, page);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
