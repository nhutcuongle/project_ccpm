import Message from "../models/Message.js";
import { decryptMessageObj } from "../utils/encryption.js";

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
export const getByConversation = async (convId, userId, page = 1, limit = 30) => {
  const skip = (page - 1) * limit;
  const messages = await Message.find({ 
    conversation: convId,
    deletedFor: { $ne: userId }
  })
    .populate("sender", "username avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  
  return messages.map(decryptMessageObj).reverse(); // trả về theo thứ tự cũ → mới
};

/**
 * Đếm tổng tin nhắn trong conversation
 */
export const countByConversation = async (convId, userId) => {
  return await Message.countDocuments({ 
    conversation: convId,
    deletedFor: { $ne: userId }
  });
};

/**
 * Tìm message theo ID
 */
export const findById = async (msgId) => {
  const msg = await Message.findById(msgId).lean();
  return decryptMessageObj(msg);
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
export const getFirstMessage = async (convId, userId) => {
  const query = { conversation: convId };
  if (userId) query.deletedFor = { $ne: userId };

  const msg = await Message.findOne(query)
    .populate("sender", "username avatar")
    .sort({ createdAt: 1 })
    .lean();
    
  return decryptMessageObj(msg);
};

/**
 * Xóa tin nhắn từ phía người dùng
 */
export const deleteForMe = async (msgId, userId) => {
  return await Message.findByIdAndUpdate(
    msgId,
    { $addToSet: { deletedFor: userId } },
    { new: true }
  ).lean();
};
