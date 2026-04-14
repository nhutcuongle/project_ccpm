import Conversation from "../models/Conversation.js";

/**
 * Tìm conversation giữa 2 user (không phân biệt thứ tự)
 */
export const findByParticipants = async (userAId, userBId) => {
  return await Conversation.findOne({
    participants: { $all: [userAId, userBId], $size: 2 },
  }).lean();
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
  return await Conversation.find({
    participants: userId,
    status: "active",
    deletedFor: { $ne: userId },
  })
    .populate("participants", "username avatar bio")
    .sort({ updatedAt: -1 })
    .lean();
};

/**
 * Lấy danh sách conversation pending mà user là RECIPIENT (tab tin nhắn chờ)
 */
export const getPendingConversations = async (userId) => {
  return await Conversation.find({
    requestedTo: userId,
    status: "pending",
  })
    .populate("participants", "username avatar bio")
    .sort({ updatedAt: -1 })
    .lean();
};

/**
 * Lấy conversation pending mà user là SENDER (để sender xem lại)
 */
export const getSentPendingConversations = async (userId) => {
  return await Conversation.find({
    participants: userId,
    status: "pending",
    requestedTo: { $ne: userId },
  })
    .populate("participants", "username avatar bio")
    .sort({ updatedAt: -1 })
    .lean();
};

/**
 * Tìm conversation theo ID
 */
export const findById = async (convId) => {
  return await Conversation.findById(convId)
    .populate("participants", "username avatar bio")
    .lean();
};

/**
 * Cập nhật trạng thái conversation
 */
export const updateStatus = async (convId, status) => {
  return await Conversation.findByIdAndUpdate(
    convId,
    { $unset: { requestedTo: 1 }, status },
    { new: true }
  ).lean();
};

/**
 * Cập nhật lastMessage sau khi gửi tin
 */
export const updateLastMessage = async (convId, { text, sender, createdAt }) => {
  return await Conversation.findByIdAndUpdate(
    convId,
    { lastMessage: { text, sender, createdAt } },
    { new: true }
  ).lean();
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
