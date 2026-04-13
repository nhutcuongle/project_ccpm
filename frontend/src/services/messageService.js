import axiosClient from "./axiosClient.js";

/**
 * Lấy danh sách active conversations (tab chính)
 */
export const getConversations = () =>
  axiosClient.get("/conversations").then((r) => r.data.conversations);

/**
 * Lấy danh sách pending conversations (tab tin nhắn chờ)
 * Trả về { pending: [...], sent: [...] }
 */
export const getPendingConversations = () =>
  axiosClient.get("/conversations/pending").then((r) => r.data);

/**
 * Đếm số tin nhắn chờ - dùng cho badge
 */
export const getPendingCount = () =>
  axiosClient.get("/conversations/pending/count").then((r) => r.data.count);

/**
 * Bắt đầu hoặc lấy conversation với một user
 */
export const startConversation = (recipientId) =>
  axiosClient
    .post(`/conversations/start/${recipientId}`)
    .then((r) => r.data.conversation);

/**
 * Lấy tin nhắn của một conversation (phân trang)
 */
export const getMessages = (convId, page = 1) =>
  axiosClient.get(`/conversations/${convId}/messages`, { params: { page } }).then((r) => r.data);

/**
 * Gửi tin nhắn
 */
export const sendMessage = (convId, text) =>
  axiosClient.post("/messages", { convId, text }).then((r) => r.data.message);

/**
 * Chấp nhận yêu cầu nhắn tin
 */
export const acceptRequest = (convId) =>
  axiosClient.post(`/conversations/${convId}/accept`).then((r) => r.data);

/**
 * Từ chối yêu cầu nhắn tin
 */
export const rejectRequest = (convId) =>
  axiosClient.post(`/conversations/${convId}/reject`).then((r) => r.data);

/**
 * Thu hồi tin nhắn
 */
export const recallMessage = (msgId) =>
  axiosClient.delete(`/messages/${msgId}/recall`).then((r) => r.data.message);
