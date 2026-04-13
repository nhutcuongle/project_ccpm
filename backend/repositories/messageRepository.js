import Message from "../models/Message.js";

/**
 * Tạo tin nhắn mới
 */
export const createMessage = async ({ conversation, sender, text, attachments }) => {
  const msg = new Message({ conversation, sender, text, attachments });
  return await msg.save();
};

/**
 * Lấy tin nhắn theo conversation, phân trang (newest → oldest)
 */
export const getByConversation = async (convId, page = 1, limit = 30) => {
  const skip = (page - 1) * limit;
  const messages = await Message.find({ conversation: convId })
    .populate("sender", "username avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  return messages.reverse(); // trả về theo thứ tự cũ → mới
};

/**
 * Đếm tổng tin nhắn trong conversation
 */
export const countByConversation = async (convId) => {
  return await Message.countDocuments({ conversation: convId });
};

/**
 * Tìm message theo ID
 */
export const findById = async (msgId) => {
  return await Message.findById(msgId).lean();
};

/**
 * Thu hồi tin nhắn (isRecalled = true, xoá text)
 */
export const recallMessage = async (msgId) => {
  return await Message.findByIdAndUpdate(
    msgId,
    { isRecalled: true, text: "" },
    { new: true }
  ).lean();
};

/**
 * Cập nhật status (sent → delivered → read)
 */
export const updateStatus = async (msgId, status) => {
  return await Message.findByIdAndUpdate(msgId, { status }, { new: true }).lean();
};

/**
 * Lấy tin nhắn đầu tiên của conversation (dùng cho preview khi pending)
 */
export const getFirstMessage = async (convId) => {
  return await Message.findOne({ conversation: convId })
    .populate("sender", "username avatar")
    .sort({ createdAt: 1 })
    .lean();
};
