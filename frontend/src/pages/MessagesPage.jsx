import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import {
  Search, Send, MoreVertical, ArrowLeft, MessageCircle,
  Plus, Check, CheckCheck, Clock, X, UserCheck, Loader,
  AlertCircle, MoreHorizontal, Trash2, RotateCcw
} from "lucide-react";
import * as messageService from "../services/messageService.js";

dayjs.extend(relativeTime);
dayjs.locale("vi");

// ─────────────────────────────────────────────────────
// NEW CONVERSATION MODAL
// ─────────────────────────────────────────────────────
function NewConversationModal({ onClose, onStart }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const { default: axiosClient } = await import("../services/axiosClient.js");
      const res = await axiosClient.get(`/user/search?q=${encodeURIComponent(val)}`);
      setResults(res.data.users || []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-700/50">
        <div className="flex items-center justify-between p-5 border-b border-slate-700/30">
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <MessageCircle size={18} className="text-indigo-400" />
            Tin nhắn mới
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          <div className="relative mb-3">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              autoFocus
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={query}
              onChange={handleSearch}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {searching && (
              <div className="flex justify-center py-4">
                <Loader size={18} className="animate-spin text-indigo-400" />
              </div>
            )}
            {!searching && results.map((u) => (
              <button
                key={u._id}
                onClick={() => onStart(u)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.05] transition-all text-left"
              >
                <Avatar src={u.avatar} name={u.username} size="sm" />
                <div>
                  <p className="text-sm font-medium text-slate-200">{u.username}</p>
                  <p className="text-xs text-slate-500">{u.bio || ""}</p>
                </div>
              </button>
            ))}
            {!searching && query && results.length === 0 && (
              <p className="text-center text-sm text-slate-500 py-4">Không tìm thấy người dùng</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// CONVERSATION ITEM
// ─────────────────────────────────────────────────────
function ConvItem({ conv, selected, onClick }) {
  const unread = conv.unread ?? 0;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 hover:bg-white/[0.03] transition-all border-b border-slate-700/10 group ${
        selected ? "bg-indigo-500/10 border-l-2 border-l-indigo-500" : ""
      }`}
    >
      <Avatar src={conv.other?.avatar} name={conv.other?.username} size="md" />
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-200 truncate">{conv.other?.username}</span>
          <span className="text-[10px] text-slate-500 shrink-0 ml-2">
            {conv.lastMessage?.createdAt ? dayjs(conv.lastMessage.createdAt).fromNow() : ""}
          </span>
        </div>
        <p className="text-xs text-slate-500 truncate mt-0.5">
          {conv.lastMessage?.text || "Chưa có tin nhắn"}
        </p>
      </div>
      {unread > 0 && (
        <span className="w-5 h-5 rounded-full gradient-primary text-[10px] font-bold text-white flex items-center justify-center shrink-0">
          {unread}
        </span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────
// PENDING ITEM
// ─────────────────────────────────────────────────────
function PendingItem({ conv, onPreview, onAccept, onReject, isSent }) {
  const [loading, setLoading] = useState(false);

  const handle = async (action) => {
    setLoading(true);
    try { await action(); } finally { setLoading(false); }
  };

  return (
    <div className="p-4 border-b border-slate-700/10 hover:bg-white/[0.02] transition-all">
      <div className="flex items-center gap-3 mb-3">
        <Avatar src={conv.other?.avatar} name={conv.other?.username} size="md" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-200">{conv.other?.username}</p>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {conv.lastMessage?.text || "Đã gửi yêu cầu nhắn tin"}
          </p>
        </div>
        <button
          onClick={onPreview}
          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors shrink-0"
        >
          Xem
        </button>
      </div>

      {!isSent && (
        <div className="flex gap-2">
          <button
            onClick={() => handle(onAccept)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-xs font-medium transition-all disabled:opacity-50"
          >
            <UserCheck size={13} /> Chấp nhận
          </button>
          <button
            onClick={() => handle(onReject)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-700/40 text-slate-400 hover:bg-red-500/20 hover:text-red-400 text-xs font-medium transition-all disabled:opacity-50"
          >
            <X size={13} /> Từ chối
          </button>
        </div>
      )}

      {isSent && (
        <div className="flex items-center gap-1.5 text-xs text-amber-400/70">
          <Clock size={12} /> Đang chờ {conv.other?.username} chấp nhận
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// MESSAGE BUBBLE
// ─────────────────────────────────────────────────────
function MessageBubble({ msg, isMe, onRecall, onDeleteForMe }) {
  const [showOptions, setShowOptions] = useState(false);
  const [showModal, setShowModal] = useState(false);
  // For own msg: "everyone" = recall, "me" = delete for me
  const [deleteMode, setDeleteMode] = useState("everyone");
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    };
    if (showOptions) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showOptions]);

  const openModal = () => {
    setShowOptions(false);
    setDeleteMode(isMe ? "everyone" : "me");
    setShowModal(true);
  };

  const handleConfirm = () => {
    setShowModal(false);
    if (!isMe) {
      // Other's message → only delete for me
      onDeleteForMe(msg._id);
    } else {
      if (deleteMode === "everyone") {
        onRecall(msg._id);
      } else {
        onDeleteForMe(msg._id);
      }
    }
  };

  if (msg.isRecalled) {
    return (
      <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
        <div className="px-4 py-2 rounded-2xl text-xs text-slate-500 italic bg-slate-800/40 border border-slate-700/30">
          Tin nhắn đã bị thu hồi
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`flex ${isMe ? "justify-end" : "justify-start"} group relative`}>

        {/* 3-dot button — LEFT of bubble (for own messages) */}
        {isMe && (
          <div className="relative flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity px-1" ref={menuRef}>
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
            >
              <MoreHorizontal size={15} />
            </button>
            {showOptions && (
              <div className="absolute top-full right-0 mt-1 z-30 w-32 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden py-1 animate-fade-in text-left">
                <button
                  onClick={openModal}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-white/5 transition-colors"
                >
                  <Trash2 size={13} /> Thu hồi
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bubble Content */}
        <div
          className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm ${
            isMe
              ? "gradient-primary text-white rounded-br-sm"
              : "bg-slate-800/80 text-slate-200 rounded-bl-sm"
          }`}
        >
          <p style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.text}</p>
          <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? "text-indigo-200/60" : "text-slate-500"}`}>
            <span className="text-[10px]">{dayjs(msg.createdAt).format("HH:mm")}</span>
            {isMe && (msg.status === "read" ? <CheckCheck size={11} /> : <Check size={11} />)}
          </div>
        </div>

        {/* 3-dot button — RIGHT of bubble (for other's messages) */}
        {!isMe && (
          <div className="relative flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity px-1" ref={menuRef}>
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
            >
              <MoreHorizontal size={15} />
            </button>
            {showOptions && (
              <div className="absolute top-full left-0 mt-1 z-30 w-32 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden py-1 animate-fade-in text-left">
                <button
                  onClick={openModal}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-white/5 transition-colors"
                >
                  <Trash2 size={13} /> Thu hồi
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-700/50 animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/30">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Trash2 size={15} className="text-red-400" />
                Xóa tin nhắn
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-3">
              {isMe ? (
                <>
                  <p className="text-xs text-slate-400 mb-3">Chọn cách xóa tin nhắn này:</p>
                  <label className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:bg-white/[0.03] border-slate-700/40 has-[:checked]:border-indigo-500/50 has-[:checked]:bg-indigo-500/5">
                    <input
                      type="radio"
                      name={`deleteMode-${msg._id}`}
                      value="everyone"
                      checked={deleteMode === "everyone"}
                      onChange={() => setDeleteMode("everyone")}
                      className="mt-0.5 accent-indigo-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-200">Xóa với mọi người</p>
                      <p className="text-xs text-slate-500 mt-0.5">Tin nhắn sẽ bị thu hồi, cả hai phía đều không xem được nữa.</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:bg-white/[0.03] border-slate-700/40 has-[:checked]:border-indigo-500/50 has-[:checked]:bg-indigo-500/5">
                    <input
                      type="radio"
                      name={`deleteMode-${msg._id}`}
                      value="me"
                      checked={deleteMode === "me"}
                      onChange={() => setDeleteMode("me")}
                      className="mt-0.5 accent-indigo-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-200">Xóa về phía bạn</p>
                      <p className="text-xs text-slate-500 mt-0.5">Chỉ bạn không thấy tin nhắn này. Người kia vẫn xem bình thường.</p>
                    </div>
                  </label>
                </>
              ) : (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
                    <Trash2 size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">Xóa về phía bạn</p>
                    <p className="text-xs text-slate-500 mt-0.5">Tin nhắn này sẽ bị ẩn khỏi màn hình của bạn. Người kia vẫn xem được bình thường.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-2 px-5 py-4 border-t border-slate-700/30">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-xl text-sm font-medium text-slate-400 bg-slate-800/50 hover:bg-slate-700/50 transition-all border border-slate-700/30"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-all shadow-md shadow-red-500/20"
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────
export default function MessagesPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();

  // ─── State ───────────────────────────────────────
  const [activeTab, setActiveTab]           = useState("main");
  const [conversations, setConversations]   = useState([]);
  const [pending, setPending]               = useState([]);
  const [sentPending, setSentPending]       = useState([]);
  const [pendingCount, setPendingCount]     = useState(0);
  const [selectedConv, setSelectedConv]     = useState(null);
  const [messages, setMessages]             = useState([]);
  const [text, setText]                     = useState("");
  const [loadingConvs, setLoadingConvs]     = useState(true);
  const [loadingMsgs, setLoadingMsgs]       = useState(false);
  const [searchQuery, setSearchQuery]       = useState("");
  const [showNewModal, setShowNewModal]     = useState(false);
  const [typingUser, setTypingUser]         = useState(null);
  const [hasMore, setHasMore]               = useState(false);
  const [page, setPage]                     = useState(1);

  const messagesEndRef  = useRef(null);
  const typingTimer     = useRef(null);
  const inputRef        = useRef(null);

  // ─── Fetch conversations ──────────────────────────
  const fetchConversations = useCallback(async () => {
    setLoadingConvs(true);
    try {
      const data = await messageService.getConversations();
      setConversations(data);
    } catch { /* silently fail */ }
    finally { setLoadingConvs(false); }
  }, []);

  const fetchPending = useCallback(async () => {
    try {
      const { pending: p, sent: s } = await messageService.getPendingConversations();
      setPending(p || []);
      setSentPending(s || []);
      setPendingCount(p?.length || 0);
    } catch { /* silently fail */ }
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchPending();
  }, [fetchConversations, fetchPending]);

  // ─── Load messages when conversation selected ─────
  const loadMessages = useCallback(async (conv, p = 1) => {
    setLoadingMsgs(true);
    try {
      const res = await messageService.getMessages(conv._id, p);
      if (p === 1) {
        setMessages(res.messages);
      } else {
        setMessages((prev) => [...res.messages, ...prev]);
      }
      setHasMore(res.pagination.hasMore);
      setPage(p);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Không thể tải tin nhắn");
    } finally { setLoadingMsgs(false); }
  }, []);

  const openConversation = useCallback((conv) => {
    // Leave old room
    if (selectedConv && socket) {
      socket.emit("leave_conversation", selectedConv._id);
    }
    setSelectedConv(conv);
    setMessages([]);
    setPage(1);
    loadMessages(conv, 1);

    // Join new room
    if (socket) {
      socket.emit("join_conversation", conv._id);
    }
    inputRef.current?.focus();
  }, [selectedConv, socket, loadMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (page === 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, page]);

  // ─── Socket events ────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (msg) => {
      const convId = String(msg.conversationId || msg.conversation);
      // If in this conversation, add message
      if (selectedConv && String(selectedConv._id) === convId) {
        setMessages((prev) => {
          // De-duplicate
          const exists = prev.find((m) => String(m._id) === String(msg._id));
          return exists ? prev : [...prev, msg];
        });
      } else {
        // Update unread badge in sidebar
        setConversations((prev) =>
          prev.map((c) =>
            String(c._id) === convId
              ? { ...c, unread: (c.unread || 0) + 1, lastMessage: { text: msg.text, createdAt: msg.createdAt } }
              : c
          )
        );
      }
    };

    const onRecalled = ({ msgId }) => {
      setMessages((prev) =>
        prev.map((m) => String(m._id) === String(msgId) ? { ...m, isRecalled: true, text: "" } : m)
      );
    };

    const onAccepted = ({ conversationId }) => {
      // Move from pending/sent to active
      setConversations((prev) => {
        const existing = prev.find((c) => String(c._id) === String(conversationId));
        return existing ? prev : prev;
      });
      fetchConversations();
      fetchPending();
      toast.success("Yêu cầu nhắn tin đã được chấp nhận!");
      if (selectedConv && String(selectedConv._id) === String(conversationId)) {
        setSelectedConv((c) => c ? { ...c, status: "active" } : c);
      }
    };

    const onRejected = ({ conversationId }) => {
      fetchPending();
      if (selectedConv && String(selectedConv._id) === String(conversationId)) {
        setSelectedConv(null);
        toast.error("Yêu cầu nhắn tin đã bị từ chối");
      }
    };

    const onTyping = ({ username }) => {
      setTypingUser(username);
    };

    const onStopTyping = () => setTypingUser(null);

    socket.on("new_message", onNewMessage);
    socket.on("message_recalled", onRecalled);
    socket.on("request_accepted", onAccepted);
    socket.on("request_rejected", onRejected);
    socket.on("user_typing", onTyping);
    socket.on("user_stop_typing", onStopTyping);

    return () => {
      socket.off("new_message", onNewMessage);
      socket.off("message_recalled", onRecalled);
      socket.off("request_accepted", onAccepted);
      socket.off("request_rejected", onRejected);
      socket.off("user_typing", onTyping);
      socket.off("user_stop_typing", onStopTyping);
    };
  }, [socket, selectedConv, fetchConversations, fetchPending]);

  // ─── Send message ─────────────────────────────────
  const handleSend = async () => {
    if (!text.trim() || !selectedConv) return;
    if (selectedConv.status === "pending" && String(selectedConv.requestedTo) === String(user?._id || user?.id))
      return; // recipient chưa chấp nhận thì không gửi được từ phía họ

    const msgText = text.trim();
    setText("");

    // Optimistic update
    const tempId = "temp_" + Date.now();
    const optimisticMsg = {
      _id: tempId,
      text: msgText,
      sender: user?._id || user?.id,
      createdAt: new Date().toISOString(),
      status: "sending"
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setConversations((prev) =>
      prev.map((c) =>
        String(c._id) === String(selectedConv._id)
          ? { ...c, lastMessage: { text: msgText, createdAt: optimisticMsg.createdAt } }
          : c
      )
    );

    try {
      const msg = await messageService.sendMessage(selectedConv._id, msgText);
      // Replace optimistic message
      setMessages((prev) => {
        const filtered = prev.filter((m) => m._id !== tempId);
        const exists = filtered.find((m) => String(m._id) === String(msg._id));
        return exists ? filtered : [...filtered, msg];
      });
      setConversations((prev) =>
        prev.map((c) =>
          String(c._id) === String(selectedConv._id)
            ? { ...c, lastMessage: { text: msgText, createdAt: msg.createdAt } }
            : c
        )
      );
    } catch (e) {
      toast.error(e?.response?.data?.message || "Gửi tin nhắn thất bại");
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setText(msgText);
    }
  };

  // ─── Recall / Delete For Me ───────────────────────
  const handleRecall = async (msgId) => {
    try {
      await messageService.recallMessage(msgId);
      // Optimistic update locally
      setMessages((prev) =>
        prev.map((m) => (String(m._id) === String(msgId) ? { ...m, isRecalled: true, text: "" } : m))
      );
    } catch (e) {
      toast.error(e?.response?.data?.message || "Không thể thu hồi tin nhắn");
    }
  };

  const handleDeleteForMe = async (msgId) => {
    try {
      await messageService.deleteForMe(msgId);
      // Remove entirely from local view
      setMessages((prev) => prev.filter((m) => String(m._id) !== String(msgId)));
      toast.success("Đã xóa tin nhắn");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Không thể xóa tin nhắn");
    }
  };

  // ─── Typing indicator ─────────────────────────────
  const handleTyping = () => {
    if (!socket || !selectedConv) return;
    socket.emit("typing", { convId: selectedConv._id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("stop_typing", { convId: selectedConv._id });
    }, 1500);
  };

  // ─── New conversation via modal ───────────────────
  const handleStartConversation = async (targetUser) => {
    setShowNewModal(false);
    try {
      const conv = await messageService.startConversation(targetUser._id);
      // Format the conv object like the API returns it
      const formatted = {
        _id: conv._id,
        other: targetUser,
        status: conv.status,
        requestedTo: conv.requestedTo,
        lastMessage: conv.lastMessage,
        unread: 0,
      };

      if (conv.status === "active") {
        setActiveTab("main");
        setConversations((prev) => {
          const exists = prev.find((c) => String(c._id) === String(conv._id));
          return exists ? prev : [formatted, ...prev];
        });
      } else {
        setActiveTab("pending");
        setSentPending((prev) => {
          const exists = prev.find((c) => String(c._id) === String(conv._id));
          return exists ? prev : [formatted, ...prev];
        });
        toast("Tin nhắn đang chờ được chấp nhận", { icon: "⏳" });
      }
      openConversation(formatted);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Không thể bắt đầu cuộc hội thoại");
    }
  };

  // ─── Auto start from Profile navigation ───────────
  useEffect(() => {
    if (location.state?.startChatWith) {
      handleStartConversation(location.state.startChatWith);
      // clean up state to prevent loops
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.startChatWith]);

  // ─── Accept / Reject ──────────────────────────────
  const handleAccept = async (convId) => {
    try {
      await messageService.acceptRequest(convId);
      toast.success("Đã chấp nhận yêu cầu nhắn tin");
      await fetchPending();
      await fetchConversations();
      if (selectedConv && String(selectedConv._id) === String(convId)) {
        setSelectedConv((c) => c ? { ...c, status: "active", requestedTo: undefined } : c);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleReject = async (convId) => {
    try {
      await messageService.rejectRequest(convId);
      toast("Đã từ chối yêu cầu", { icon: "🚫" });
      if (selectedConv && String(selectedConv._id) === String(convId)) {
        setSelectedConv(null);
      }
      await fetchPending();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  // ─── Load more messages ───────────────────────────
  const handleLoadMore = () => {
    if (!selectedConv || !hasMore || loadingMsgs) return;
    loadMessages(selectedConv, page + 1);
  };

  // ─── Filtered lists ───────────────────────────────
  const filteredConvs = conversations.filter((c) =>
    c.other?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPending = pending.filter((c) =>
    c.other?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isPendingRecipient =
    selectedConv?.status === "pending" &&
    String(selectedConv?.requestedTo) === String(user?._id || user?.id);

  // ─────────────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-7rem)] flex gap-0 overflow-hidden rounded-2xl glass animate-fade-in-up">
      {/* ═══ SIDEBAR ═════════════════════════════════════════ */}
      <div className={`${selectedConv ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 lg:w-96 border-r border-slate-700/30`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-700/30">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <MessageCircle size={20} className="text-indigo-400" />
              Tin nhắn
            </h2>
            <button
              onClick={() => setShowNewModal(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
              title="Tin nhắn mới"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>

          {/* Tabs */}
          <div className="flex mt-3 p-1 bg-slate-800/50 rounded-xl">
            <button
              onClick={() => setActiveTab("main")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "main"
                  ? "bg-indigo-500 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Tin nhắn
            </button>
            <button
              onClick={() => { setActiveTab("pending"); fetchPending(); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
                activeTab === "pending"
                  ? "bg-indigo-500 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Tin nhắn chờ
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full gradient-primary text-[9px] font-bold text-white flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {/* ── TAB MAIN ── */}
          {activeTab === "main" && (
            <>
              {loadingConvs && (
                <div className="flex justify-center py-8">
                  <Loader size={20} className="animate-spin text-indigo-400" />
                </div>
              )}
              {!loadingConvs && filteredConvs.length === 0 && (
                <div className="p-6 text-center">
                  <MessageCircle size={32} className="text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">Chưa có cuộc hội thoại nào</p>
                  <button
                    onClick={() => setShowNewModal(true)}
                    className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Bắt đầu nhắn tin
                  </button>
                </div>
              )}
              {filteredConvs.map((conv) => (
                <ConvItem
                  key={conv._id}
                  conv={conv}
                  selected={selectedConv?._id === conv._id}
                  onClick={() => openConversation(conv)}
                />
              ))}
            </>
          )}

          {/* ── TAB PENDING ── */}
          {activeTab === "pending" && (
            <>
              {/* Received requests */}
              {filteredPending.length > 0 && (
                <>
                  <div className="px-4 pt-3 pb-1">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Yêu cầu nhận được ({filteredPending.length})
                    </p>
                  </div>
                  {filteredPending.map((conv) => (
                    <PendingItem
                      key={conv._id}
                      conv={conv}
                      isSent={false}
                      onPreview={() => openConversation(conv)}
                      onAccept={() => handleAccept(conv._id)}
                      onReject={() => handleReject(conv._id)}
                    />
                  ))}
                </>
              )}

              {/* Sent requests */}
              {sentPending.length > 0 && (
                <>
                  <div className="px-4 pt-3 pb-1">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Đã gửi ({sentPending.length})
                    </p>
                  </div>
                  {sentPending.map((conv) => (
                    <PendingItem
                      key={conv._id}
                      conv={conv}
                      isSent={true}
                      onPreview={() => openConversation(conv)}
                      onAccept={() => {}}
                      onReject={() => {}}
                    />
                  ))}
                </>
              )}

              {filteredPending.length === 0 && sentPending.length === 0 && (
                <div className="p-6 text-center">
                  <Clock size={32} className="text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">Không có tin nhắn chờ</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ═══ CHAT AREA ═══════════════════════════════════════ */}
      <div className={`${selectedConv ? "flex" : "hidden md:flex"} flex-1 flex-col`}>
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700/30">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConv(null)}
                  className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-white/5 transition-all"
                >
                  <ArrowLeft size={20} />
                </button>
                <button
                  onClick={() => navigate(`/profile/${selectedConv.other?._id}`)}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <Avatar src={selectedConv.other?.avatar} name={selectedConv.other?.username} size="md" />
                  <div>
                    <p className="text-sm font-semibold text-slate-200 hover:text-indigo-300 transition-colors">{selectedConv.other?.username}</p>
                    <p className="text-xs text-slate-500">
                      {typingUser ? (
                        <span className="text-indigo-400 animate-pulse">Đang nhập...</span>
                      ) : (
                        selectedConv.status === "pending" ? (
                          <span className="text-amber-400 flex items-center gap-1">
                            <Clock size={11} /> Đang chờ chấp nhận
                          </span>
                        ) : "Đang hoạt động"
                      )}
                    </p>
                  </div>
                </button>
              </div>
              <button className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all">
                <MoreVertical size={18} />
              </button>
            </div>

            {/* Pending banner — shown when current user is recipient */}
            {isPendingRecipient && (
              <div className="mx-4 mt-3 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-amber-300">
                  <AlertCircle size={14} />
                  <span><strong>{selectedConv.other?.username}</strong> muốn nhắn tin với bạn</span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleAccept(selectedConv._id)}
                    className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-xs font-medium transition-all"
                  >
                    Chấp nhận
                  </button>
                  <button
                    onClick={() => handleReject(selectedConv._id)}
                    className="px-3 py-1 rounded-lg bg-slate-700/40 text-slate-400 hover:bg-red-500/20 hover:text-red-400 text-xs font-medium transition-all"
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
              {/* Load more */}
              {hasMore && (
                <div className="flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMsgs}
                    className="px-4 py-1.5 rounded-full text-xs text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/10 transition-all disabled:opacity-50"
                  >
                    {loadingMsgs ? <Loader size={12} className="animate-spin" /> : "Tải thêm tin nhắn"}
                  </button>
                </div>
              )}

              {loadingMsgs && messages.length === 0 && (
                <div className="flex justify-center py-8">
                  <Loader size={20} className="animate-spin text-indigo-400" />
                </div>
              )}

              {messages.map((msg) => {
                const getStrId = (v) => {
                  if (!v) return "";
                  if (typeof v === "string") return v;
                  if (typeof v === "object") {
                    if (v._id) return String(v._id);
                    if (v.id) return String(v.id);
                  }
                  return String(v);
                };
                const msgSenderStr = getStrId(msg.sender);
                const userStr = getStrId(user);
                const isMe = msgSenderStr === userStr;
                
                return (
                  <MessageBubble
                    key={msg._id}
                    msg={msg}
                    isMe={isMe}
                    onRecall={handleRecall}
                    onDeleteForMe={handleDeleteForMe}
                  />
                );
              })}

              {messages.length === 0 && !loadingMsgs && (
                <div className="flex-1 flex items-center justify-center">
                  <EmptyState
                    icon={<MessageCircle size={24} className="text-indigo-400" />}
                    title="Chưa có tin nhắn nào"
                    description="Hãy bắt đầu cuộc trò chuyện!"
                  />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input — disable nếu recipient chưa chấp nhận (từ phía sender) */}
            {selectedConv.status === "active" || isPendingRecipient ? (
              <div className="p-4 border-t border-slate-700/30">
                {isPendingRecipient ? (
                  <p className="text-center text-xs text-amber-400/70 py-2">
                    Hãy chấp nhận yêu cầu để trả lời
                  </p>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <textarea
                        ref={inputRef}
                        rows={1}
                        placeholder="Nhập tin nhắn..."
                        value={text}
                        onChange={(e) => { setText(e.target.value); handleTyping(); }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                        style={{ maxHeight: "120px", overflowY: "auto" }}
                      />
                    </div>
                    <Button
                      onClick={handleSend}
                      size="md"
                      className="!px-4 !py-2.5 shrink-0"
                      disabled={!text.trim()}
                    >
                      <Send size={16} />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              /* Sender đang chờ recipient chấp nhận */
              <div className="p-4 border-t border-slate-700/30">
                <div className="flex items-center justify-center gap-2 py-2 text-xs text-amber-400/70">
                  <Clock size={13} />
                  Đang chờ <strong>{selectedConv.other?.username}</strong> chấp nhận yêu cầu nhắn tin
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={<MessageCircle size={28} className="text-indigo-400" />}
              title="Chọn một cuộc hội thoại"
              description="Chọn từ danh sách bên trái hoặc bắt đầu cuộc trò chuyện mới"
            />
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewModal && (
        <NewConversationModal
          onClose={() => setShowNewModal(false)}
          onStart={handleStartConversation}
        />
      )}
    </div>
  );
}
