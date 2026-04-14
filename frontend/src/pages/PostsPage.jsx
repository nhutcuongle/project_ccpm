<<<<<<< HEAD
import { useState, useEffect } from "react";
=======
import { useState } from "react";
import { Link } from "react-router-dom";
>>>>>>> origin/feature/messenger
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
<<<<<<< HEAD
            <PostItem
              key={post._id}
              post={post}
              onUpdate={handleUpdatePost}
              className={`animate-fade-in-up stagger-${Math.min(i + 1, 5)}`}
            />
=======
            <Card key={post._id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 5)}`}>
              {/* Post Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Link to={`/profile/${post.author._id || post._id}`}>
                    <Avatar src={post.author.avatar} name={post.author.username} size="md" className="hover:opacity-80 transition-opacity" />
                  </Link>
                  <div>
                    <Link to={`/profile/${post.author._id || post._id}`} className="text-sm font-semibold text-slate-200 hover:text-indigo-400 transition-colors">
                      {post.author.username}
                    </Link>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-slate-500">@{post.author.identifier}</p>
                      <span className="text-slate-700">·</span>
                      <p className="text-xs text-slate-500">{post.createdAt}</p>
                    </div>
                  </div>
                </div>
                <button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              {/* Content */}
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line mb-3">
                {post.content}
              </p>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="info">#{tag}</Badge>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-700/30">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleLike(post._id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      post.liked
                        ? "text-pink-400 bg-pink-500/10"
                        : "text-slate-500 hover:text-pink-400 hover:bg-pink-500/10"
                    }`}
                  >
                    <Heart size={16} fill={post.liked ? "currentColor" : "none"} />
                    {post.likes}
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
                    <MessageCircle size={16} />
                    {post.comments}
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all">
                    <Share2 size={16} />
                    {post.shares}
                  </button>
                </div>
                <button
                  onClick={() => toggleSave(post._id)}
                  className={`p-1.5 rounded-lg transition-all ${
                    post.saved
                      ? "text-amber-400"
                      : "text-slate-500 hover:text-amber-400"
                  }`}
                >
                  <Bookmark size={18} fill={post.saved ? "currentColor" : "none"} />
                </button>
              </div>
            </Card>
>>>>>>> origin/feature/messenger
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
