import Conversation from "../models/Conversation.js";
import { decryptConversationObj } from "../utils/encryption.js";

/**
 * Tìm conversation giữa 2 user (không phân biệt thứ tự)
 */
export const findByParticipants = async (userAId, userBId) => {
  const conv = await Conversation.findOne({
    participants: { $all: [userAId, userBId], $size: 2 },
  }).lean();
  return decryptConversationObj(conv);
};

/**
 * Tạo conversation mới
 */
export const createConversation = async ({ participants, status, requestedTo }) => {
  const conv = new Conversation({
    participants,
    status,
    requestedTo,
    unreadCounts: participants.map((u) => ({ user: u, count: 0 })),
  });
  return await conv.save();
};

/**
 * Lấy danh sách conversation active của user (tab chính)
 */
export const getActiveConversations = async (userId) => {
  const convs = await Conversation.find({
    participants: userId,
    status: "active",
    deletedFor: { $ne: userId },
  })
    .populate("participants", "username avatar bio")
    .sort({ updatedAt: -1 })
    .lean();
  return convs.map(decryptConversationObj);
};

/**
 * Lấy danh sách conversation pending mà user là RECIPIENT (tab tin nhắn chờ)
 */
export const getPendingConversations = async (userId) => {
  const convs = await Conversation.find({
    requestedTo: userId,
    status: "pending",
  })
    .populate("participants", "username avatar bio")
    .sort({ updatedAt: -1 })
    .lean();
  return convs.map(decryptConversationObj);
};

/**
 * Lấy conversation pending mà user là SENDER (để sender xem lại)
 */
export const getSentPendingConversations = async (userId) => {
  const convs = await Conversation.find({
    participants: userId,
    status: "pending",
    requestedTo: { $ne: userId },
  })
    .populate("participants", "username avatar bio")
    .sort({ updatedAt: -1 })
    .lean();
  return convs.map(decryptConversationObj);
};

/**
 * Tìm conversation theo ID
 */
export const findById = async (convId) => {
  const conv = await Conversation.findById(convId)
    .populate("participants", "username avatar bio")
    .lean();
  return decryptConversationObj(conv);
};

/**
 * Cập nhật trạng thái conversation
 */
export const updateStatus = async (convId, status) => {
  const conv = await Conversation.findByIdAndUpdate(
    convId,
    { $unset: { requestedTo: 1 }, status },
    { new: true }
  ).lean();
  return decryptConversationObj(conv);
};

/**
 * Cập nhật lastMessage sau khi gửi tin
 */
export const updateLastMessage = async (convId, { text, sender, createdAt }) => {
  const conv = await Conversation.findByIdAndUpdate(
    convId,
    { lastMessage: { text, sender, createdAt } },
    { new: true }
  ).lean();
  return decryptConversationObj(conv);
};

/**
 * Tăng unread count của user cụ thể
 */
export const incrementUnread = async (convId, userId) => {
  return await Conversation.findOneAndUpdate(
    { _id: convId, "unreadCounts.user": userId },
    { $inc: { "unreadCounts.$.count": 1 } },
    { new: true }
  ).lean();
};

/**
 * Reset unread count về 0 cho user
 */
export const resetUnread = async (convId, userId) => {
  return await Conversation.findOneAndUpdate(
    { _id: convId, "unreadCounts.user": userId },
    { $set: { "unreadCounts.$.count": 0 } },
    { new: true }
  ).lean();
};

/**
 * Đếm số pending conversations mà user là recipient
 */
export const countPending = async (userId) => {
  return await Conversation.countDocuments({
    requestedTo: userId,
    status: "pending",
  });
};
