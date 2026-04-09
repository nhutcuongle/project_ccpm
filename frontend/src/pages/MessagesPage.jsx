import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import {
  Search,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  MessageCircle,
  Plus,
  Image,
  Check,
  CheckCheck,
} from "lucide-react";

// Mock data - sẽ thay bằng API thật sau
const mockConversations = [
  {
    _id: "1",
    name: "Nguyễn Văn A",
    avatar: "",
    lastMessage: "Bạn ơi, bài tập hôm nay làm chưa?",
    time: "2 phút",
    unread: 3,
    online: true,
  },
  {
    _id: "2",
    name: "Trần Thị B",
    avatar: "",
    lastMessage: "Cảm ơn bạn nhé! 😊",
    time: "15 phút",
    unread: 0,
    online: true,
  },
  {
    _id: "3",
    name: "Lê Minh C",
    avatar: "",
    lastMessage: "Đã gửi file cho bạn rồi",
    time: "1 giờ",
    unread: 0,
    online: false,
  },
  {
    _id: "4",
    name: "Phạm Đức D",
    avatar: "",
    lastMessage: "OK, mai mình gặp nha",
    time: "Hôm qua",
    unread: 0,
    online: false,
  },
];

const mockMessages = [
  { _id: "m1", sender: "other", text: "Chào bạn! Bạn ơi cho mình hỏi", time: "10:30", read: true },
  { _id: "m2", sender: "me", text: "Chào bạn! Bạn cần gì nè?", time: "10:31", read: true },
  { _id: "m3", sender: "other", text: "Bạn ơi, bài tập hôm nay làm chưa? Mình chưa hiểu phần cuối lắm", time: "10:32", read: true },
  { _id: "m4", sender: "me", text: "Mình làm rồi nè, để mình gửi cho bạn tham khảo nhé 📝", time: "10:33", read: true },
  { _id: "m5", sender: "other", text: "Cảm ơn bạn nhiều! 🙏", time: "10:34", read: true },
  { _id: "m6", sender: "me", text: "Không có gì đâu, bạn xem xong hỏi gì cứ nhắn mình", time: "10:35", read: false },
];

export default function MessagesPage() {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = mockConversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = () => {
    if (!message.trim()) return;
    // TODO: Backend integration - gửi tin nhắn thật
    setMessage("");
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-0 overflow-hidden rounded-2xl glass animate-fade-in-up">
      {/* Sidebar - Conversation List */}
      <div className={`${selectedChat ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 lg:w-96 border-r border-slate-700/30`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-700/30">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <MessageCircle size={20} className="text-indigo-400" />
              Tin nhắn
            </h2>
            <button className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
              <Plus size={20} />
            </button>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <button
              key={conv._id}
              onClick={() => setSelectedChat(conv)}
              className={`w-full flex items-center gap-3 p-4 hover:bg-white/[0.03] transition-all border-b border-slate-700/10 ${
                selectedChat?._id === conv._id ? "bg-indigo-500/10 border-l-2 border-l-indigo-500" : ""
              }`}
            >
              <Avatar src={conv.avatar} name={conv.name} size="md" online={conv.online} />
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-200 truncate">{conv.name}</span>
                  <span className="text-[10px] text-slate-500 shrink-0 ml-2">{conv.time}</span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">{conv.lastMessage}</p>
              </div>
              {conv.unread > 0 && (
                <span className="w-5 h-5 rounded-full gradient-primary text-[10px] font-bold text-white flex items-center justify-center shrink-0">
                  {conv.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${selectedChat ? "flex" : "hidden md:flex"} flex-1 flex-col`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700/30">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-white/5"
                >
                  <ArrowLeft size={20} />
                </button>
                <Avatar src={selectedChat.avatar} name={selectedChat.name} size="md" online={selectedChat.online} />
                <div>
                  <p className="text-sm font-semibold text-slate-200">{selectedChat.name}</p>
                  <p className="text-xs text-emerald-400">
                    {selectedChat.online ? "Đang trực tuyến" : "Ngoại tuyến"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all">
                  <Phone size={18} />
                </button>
                <button className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all">
                  <Video size={18} />
                </button>
                <button className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {mockMessages.map((msg) => (
                <div key={msg._id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.sender === "me"
                        ? "gradient-primary text-white rounded-br-md"
                        : "bg-slate-800/80 text-slate-200 rounded-bl-md"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 ${msg.sender === "me" ? "text-indigo-200/60" : "text-slate-500"}`}>
                      <span className="text-[10px]">{msg.time}</span>
                      {msg.sender === "me" && (
                        msg.read ? <CheckCheck size={12} /> : <Check size={12} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-700/30">
              <div className="flex items-center gap-2">
                <button className="p-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all">
                  <Paperclip size={20} />
                </button>
                <button className="p-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all">
                  <Image size={20} />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-all">
                    <Smile size={18} />
                  </button>
                </div>
                <Button 
                  onClick={handleSend} 
                  size="md" 
                  className="!px-4 !py-2.5"
                  disabled={!message.trim()}
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={<MessageCircle size={28} className="text-indigo-400" />}
              title="Chọn một cuộc hội thoại"
              description="Chọn từ danh sách bên trái để bắt đầu nhắn tin"
            />
          </div>
        )}
      </div>
    </div>
  );
}
