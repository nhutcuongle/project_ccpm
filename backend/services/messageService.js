import * as messageRepository from "../repositories/messageRepository.js";
import * as conversationRepository from "../repositories/conversationRepository.js";
import { getIo } from "../socket.js";

/**
 * Gửi tin nhắn trong một conversation
 */
export const sendMessage = async (senderId, convId, text) => {
  if (!text || !text.trim()) throw new Error("Nội dung tin nhắn không được rỗng");

  const conv = await conversationRepository.findById(convId);
  if (!conv) throw new Error("Cuộc hội thoại không tồn tại");

  // Kiểm tra sender có phải là participant không
  const isParticipant = conv.participants.some(
    (p) => String(p._id) === String(senderId)
  );
  if (!isParticipant) throw new Error("Bạn không có quyền nhắn tin trong cuộc hội thoại này");

  // Nếu conversation bị rejected → không cho gửi
  if (conv.status === "rejected") {
    throw new Error("Yêu cầu nhắn tin đã bị từ chối");
  }

  // Tạo message
  const message = await messageRepository.createMessage({
    conversation: convId,
    sender: senderId,
    text: text.trim(),
  });

  // Populate sender info
  const populatedMsg = await messageRepository.findById(message._id);

  // Tìm recipient để tăng unread
  const recipient = conv.participants.find(
    (p) => String(p._id) !== String(senderId)
  );
  const recipientId = recipient?._id;

  // Cập nhật lastMessage và unread count đồng thời
  await Promise.all([
    conversationRepository.updateLastMessage(convId, {
      text: text.trim(),
      sender: senderId,
      createdAt: message.createdAt,
    }),
    conversationRepository.incrementUnread(convId, recipientId),
  ]);

  // Emit socket event real-time
  const io = getIo();
  if (io) {
    const payload = {
      ...populatedMsg,
      conversationId: convId,
    };
    // Gửi đến room của conversation
    io.to(`conv_${convId}`).emit("new_message", payload);
  }

  return populatedMsg;
};

/**
 * Lấy tin nhắn của một conversation với phân trang
 */
export const getMessages = async (userId, convId, page = 1) => {
  const conv = await conversationRepository.findById(convId);
  if (!conv) throw new Error("Cuộc hội thoại không tồn tại");

  const isParticipant = conv.participants.some(
    (p) => String(p._id) === String(userId)
  );
  if (!isParticipant) throw new Error("Bạn không có quyền xem cuộc hội thoại này");

  const limit = 30;
  const [messages, total] = await Promise.all([
    messageRepository.getByConversation(convId, page, limit),
    messageRepository.countByConversation(convId),
  ]);

  // Reset unread count cho user này
  await conversationRepository.resetUnread(convId, userId);

  return {
    messages,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
};

/**
 * Thu hồi tin nhắn
 */
export const recallMessage = async (userId, msgId) => {
  const msg = await messageRepository.findById(msgId);
  if (!msg) throw new Error("Tin nhắn không tồn tại");

  if (String(msg.sender) !== String(userId)) {
    throw new Error("Bạn chỉ có thể thu hồi tin nhắn của mình");
  }

  const updated = await messageRepository.recallMessage(msgId);

  // Emit socket event
  const io = getIo();
  if (io) {
    io.to(`conv_${msg.conversation}`).emit("message_recalled", { msgId });
  }

  return updated;
};
