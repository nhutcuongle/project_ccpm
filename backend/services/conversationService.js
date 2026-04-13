import * as conversationRepository from "../repositories/conversationRepository.js";
import * as followRepository from "../repositories/followRepository.js";

/**
 * Kiểm tra mutual follow giữa 2 user
 */
const isMutualFollow = async (userAId, userBId) => {
  const [aFollowsB, bFollowsA] = await Promise.all([
    followRepository.findOne(userAId, userBId),
    followRepository.findOne(userBId, userAId),
  ]);
  return !!aFollowsB && !!bFollowsA;
};

/**
 * Bắt đầu hoặc lấy conversation hiện có giữa sender và recipient.
 * Logic:
 *   - Nếu đã có conversation → trả về (bất kể status)
 *   - Nếu chưa có:
 *       • mutual follow → status = "active"
 *       • không mutual  → status = "pending", requestedTo = recipientId
 */
export const getOrCreateConversation = async (senderId, recipientId) => {
  if (senderId === recipientId) {
    throw new Error("Không thể tự nhắn tin cho chính mình");
  }

  // Tìm conversation đã tồn tại
  const existing = await conversationRepository.findByParticipants(senderId, recipientId);
  if (existing) return existing;

  // Kiểm tra mutual follow
  const mutual = await isMutualFollow(senderId, recipientId);

  const conv = await conversationRepository.createConversation({
    participants: [senderId, recipientId],
    status: mutual ? "active" : "pending",
    requestedTo: mutual ? undefined : recipientId,
  });

  return conv;
};

/**
 * Lấy tất cả active conversations của user
 */
export const getActiveConversations = async (userId) => {
  const conversations = await conversationRepository.getActiveConversations(userId);
  return conversations.map((c) => formatConversation(c, userId));
};

/**
 * Lấy pending conversations mà user là recipient
 */
export const getPendingConversations = async (userId) => {
  const conversations = await conversationRepository.getPendingConversations(userId);
  return conversations.map((c) => formatConversation(c, userId));
};

/**
 * Lấy pending conversations mà user là sender
 */
export const getSentPendingConversations = async (userId) => {
  const conversations = await conversationRepository.getSentPendingConversations(userId);
  return conversations.map((c) => formatConversation(c, userId));
};

/**
 * Chấp nhận tin nhắn chờ
 */
export const acceptRequest = async (convId, userId) => {
  const conv = await conversationRepository.findById(convId);
  if (!conv) throw new Error("Cuộc hội thoại không tồn tại");

  if (String(conv.requestedTo) !== String(userId)) {
    throw new Error("Bạn không có quyền thực hiện hành động này");
  }

  if (conv.status !== "pending") {
    throw new Error("Yêu cầu không ở trạng thái chờ");
  }

  return await conversationRepository.updateStatus(convId, "active");
};

/**
 * Từ chối tin nhắn chờ
 */
export const rejectRequest = async (convId, userId) => {
  const conv = await conversationRepository.findById(convId);
  if (!conv) throw new Error("Cuộc hội thoại không tồn tại");

  if (String(conv.requestedTo) !== String(userId)) {
    throw new Error("Bạn không có quyền thực hiện hành động này");
  }

  if (conv.status !== "pending") {
    throw new Error("Yêu cầu không ở trạng thái chờ");
  }

  return await conversationRepository.updateStatus(convId, "rejected");
};

/**
 * Đếm số tin nhắn chờ của user
 */
export const countPendingRequests = async (userId) => {
  return await conversationRepository.countPending(userId);
};

/**
 * Format conversation: lấy thông tin đối phương, unread count
 */
const formatConversation = (conv, currentUserId) => {
  const other = conv.participants.find(
    (p) => String(p._id) !== String(currentUserId)
  );
  const unreadEntry = conv.unreadCounts?.find(
    (u) => String(u.user) === String(currentUserId)
  );

  return {
    _id: conv._id,
    other,
    lastMessage: conv.lastMessage,
    status: conv.status,
    requestedTo: conv.requestedTo,
    unread: unreadEntry?.count || 0,
    updatedAt: conv.updatedAt,
  };
};
