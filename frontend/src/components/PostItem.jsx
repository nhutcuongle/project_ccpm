import { useState, useEffect } from "react";
import Card from "./ui/Card";
import Avatar from "./ui/Avatar";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Send,
  Trash2,
  Edit
} from "lucide-react";
import voteService from "../services/voteService";
import answerService from "../services/answerService";
import { useAuth } from "../context/AuthContext";

export default function PostItem({ post, onUpdate, className, activeDropdown, setActiveDropdown, handleEdit, handleDelete, setActiveHashtagFilter, getTimeAgo }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [isVoting, setIsVoting] = useState(false);
  const [loadingAnswers, setLoadingAnswers] = useState(false);

  const handleVote = async (voteType) => {
    if (!user) return alert("Vui lòng đăng nhập để bình chọn");
    if (isVoting) return;

    try {
      setIsVoting(true);
      const res = await voteService.toggleVote("question", post._id, voteType);
      // Cập nhật lại post trong danh sách cha
      onUpdate(post._id, { score: res.score, userVote: res.userVote });
    } catch (error) {
      console.error(error);
    } finally {
      setIsVoting(false);
    }
  };

  const fetchAnswers = async () => {
    try {
      setLoadingAnswers(true);
      const res = await answerService.getAnswers(post._id);
      setAnswers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAnswers(false);
    }
  };

  useEffect(() => {
    if (showComments) {
      fetchAnswers();
    }
  }, [showComments]);

  const handlePostAnswer = async () => {
    if (!newAnswer.trim()) return;
    try {
      const res = await answerService.createAnswer({
        questionId: post._id,
        content: newAnswer,
      });
      setNewAnswer("");
      fetchAnswers();
      // Cập nhật answersCount ở post
      onUpdate(post._id, { answersCount: post.answersCount + 1 });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (!window.confirm("Bạn có chắc muốn xoá?")) return;
    try {
      await answerService.deleteAnswer(answerId);
      fetchAnswers();
      // Ước tính lại answersCount (backend đã xử lý chuẩn, ở đây mình có thể fetch lại post hoặc trừ tạm)
      onUpdate(post._id, { answersCount: Math.max(0, post.answersCount - 1) });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card className={`overflow-visible ${className || ""}`}>
      <div className="flex gap-4">
        {/* Voting Sidebar */}
        <div className="flex flex-col items-center gap-1 pt-1">
          <button
            onClick={() => handleVote("up")}
            disabled={isVoting}
            className={`p-1 rounded hover:bg-slate-800 transition-colors ${
              post.userVote === "up" ? "text-orange-500" : "text-slate-500"
            }`}
          >
            <ArrowBigUp size={28} fill={post.userVote === "up" ? "currentColor" : "none"} />
          </button>
          <span className={`text-sm font-bold ${
            post.userVote === "up" ? "text-orange-500" : post.userVote === "down" ? "text-indigo-400" : "text-slate-300"
          }`}>
            {post.score || 0}
          </span>
          <button
            onClick={() => handleVote("down")}
            disabled={isVoting}
            className={`p-1 rounded hover:bg-slate-800 transition-colors ${
              post.userVote === "down" ? "text-indigo-400" : "text-slate-500"
            }`}
          >
            <ArrowBigDown size={28} fill={post.userVote === "down" ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Post Content Area */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-3 relative">
            <div className="flex items-center gap-3">
              <Avatar src={post.author?.avatar} name={post.author?.username || "Ẩn danh"} size="md" />
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  {post.author?.username || "Ẩn danh"}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-slate-500">{getTimeAgo ? getTimeAgo(post.createdAt) : new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Dropdown Options */}
            {(user?._id === post.author?._id || user?.role === "admin") && (
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === post._id ? null : post._id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
                >
                  <MoreHorizontal size={18} />
                </button>
                {activeDropdown === post._id && (
                  <div className="absolute right-0 mt-2 w-36 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-10 overflow-hidden">
                    <button
                      onClick={() => handleEdit(post)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 flex items-center gap-2"
                    >
                      <Edit size={14} /> Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(post._id)}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                    >
                      <Trash2 size={14} /> Xóa
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Body */}
          <h3 className="text-base font-bold text-slate-100 mb-2 truncate whitespace-normal">{post.title}</h3>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line mb-3">
            {post.content}
          </p>

          {/* Images */}
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {post.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt="Question upload"
                  className="rounded-lg object-cover w-full max-h-48"
                />
              ))}
            </div>
          )}

          {/* Tags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.hashtags.map((tag) => (
                <button
                  key={tag._id || tag}
                  onClick={() => setActiveHashtagFilter(tag.name || tag)}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <Badge variant="info">#{tag.name || tag}</Badge>
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-700/30">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowComments(!showComments)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  showComments ? "text-indigo-400 bg-indigo-500/10" : "text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10"
                }`}
              >
                <MessageCircle size={16} />
                {post.answersCount || 0} câu trả lời
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all">
                <Share2 size={16} />
                Chia sẻ
              </button>
            </div>
            <button className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 transition-all">
              <Bookmark size={18} />
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-slate-700/30 space-y-4 animate-fade-in">
              {/* Write Answer */}
              <div className="flex gap-3">
                <Avatar src={user?.avatar} name={user?.username} size="sm" />
                <div className="flex-1 relative">
                  <textarea
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="Viết câu trả lời của bạn..."
                    rows={2}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                  />
                  <button
                    onClick={handlePostAnswer}
                    disabled={!newAnswer.trim()}
                    className="absolute right-2 bottom-2 p-1.5 text-indigo-400 hover:text-indigo-300 disabled:text-slate-600 transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>

              {/* Answers List */}
              {loadingAnswers ? (
                <div className="text-center py-4 text-slate-500 text-xs text-shimmer">Đang tải...</div>
              ) : answers.length === 0 ? (
                <p className="text-center py-4 text-slate-500 text-xs">Chưa có câu trả lời nào.</p>
              ) : (
                <div className="space-y-4">
                  {answers.map((ans) => (
                    <div key={ans._id} className="flex gap-3 group">
                      <Avatar src={ans.author.avatar} name={ans.author.username} size="sm" />
                      <div className="flex-1 bg-slate-800/30 rounded-xl p-3 relative">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-xs font-bold text-slate-200">{ans.author.username}</p>
                          {user?._id === ans.author._id && (
                            <button
                               onClick={() => handleDeleteAnswer(ans._id)}
                               className="text-slate-600 hover:text-red-400 transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-slate-300">{ans.content}</p>
                        
                        {/* Recursive Comments would go here if needed, 
                            but for now we keep it simple as per plan. */}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
