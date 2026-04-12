import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";
import {
  PenSquare,
  Image,
  Link2,
  Send,
  Plus,
  Clock,
  TrendingUp,
  Filter,
} from "lucide-react";
import PostItem from "../components/PostItem";
import questionService from "../services/questionService";

export default function PostsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [activeFilter, setActiveFilter] = useState("newest");

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await questionService.getAllQuestions();
      setPosts(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleUpdatePost = (id, updates) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === id ? { ...p, ...updates } : p))
    );
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !newPostTitle.trim()) return;
    try {
      await questionService.createQuestion({
        title: newPostTitle,
        content: newPostContent,
      });
      setNewPostContent("");
      setNewPostTitle("");
      setCreateOpen(false);
      fetchPosts();
    } catch (error) {
      console.error(error);
    }
  };

  const filters = [
    { key: "newest", label: "Mới nhất", icon: <Clock size={14} /> },
    { key: "popular", label: "Phổ biến", icon: <TrendingUp size={14} /> },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      {/* Create Post CTA */}
      <Card>
        <div className="flex items-center gap-3">
          <Avatar src={user?.avatar} name={user?.username} size="md" />
          <button
            onClick={() => setCreateOpen(true)}
            className="flex-1 text-left px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-500 hover:border-slate-600/50 hover:text-slate-400 transition-all cursor-text"
          >
            Bạn đang có câu hỏi gì? Chia sẻ với cộng đồng...
          </button>
          <Button onClick={() => setCreateOpen(true)} size="md">
            <Plus size={18} />
            Đăng
          </Button>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter size={16} className="text-slate-500" />
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeFilter === f.key
                ? "gradient-primary text-white"
                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
            }`}
          >
            {f.icon}
            {f.label}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-shimmer h-48" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<PenSquare size={28} className="text-indigo-400" />}
          title="Chưa có câu hỏi nào"
          description="Hãy là người đầu tiên đặt câu hỏi!"
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus size={16} />
              Đặt câu hỏi đầu tiên
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post, i) => (
            <PostItem
              key={post._id}
              post={post}
              onUpdate={handleUpdatePost}
              className={`animate-fade-in-up stagger-${Math.min(i + 1, 5)}`}
            />
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Đặt câu hỏi" size="md">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Avatar src={user?.avatar} name={user?.username} size="md" />
            <div>
              <p className="text-sm font-semibold text-slate-200">{user?.username}</p>
              <p className="text-xs text-slate-500">Đăng công khai</p>
            </div>
          </div>
          <input
            type="text"
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            placeholder="Tiêu đề câu hỏi..."
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm font-semibold text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
          />
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="Mô tả chi tiết câu hỏi của bạn... ✨"
            rows={5}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              <button className="p-2 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
                <Image size={20} />
              </button>
              <button className="p-2 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
                <Link2 size={20} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleCreatePost} disabled={!newPostContent.trim() || !newPostTitle.trim()}>
                <Send size={16} />
                Đăng bài
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
