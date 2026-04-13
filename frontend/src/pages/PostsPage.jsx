import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";
import {
  PenSquare,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Image,
  Link2,
  Send,
  Plus,
  Clock,
  TrendingUp,
  Filter,
  X,
} from "lucide-react";

// Mock data - sẽ thay bằng API thật sau
const mockPosts = [
  {
    _id: "1",
    author: { username: "Nguyễn Văn A", identifier: "nguyenvana", avatar: "" },
    content: "Hôm nay mình vừa hoàn thành project NodeJS! Cảm ơn các bạn đã giúp đỡ trong suốt quá trình làm dự án. Chia sẻ một vài kinh nghiệm mình đã học được... 🚀",
    likes: 24,
    comments: 5,
    shares: 2,
    createdAt: "5 phút trước",
    liked: false,
    saved: false,
    tags: ["NodeJS", "Project"],
  },
  {
    _id: "2",
    author: { username: "Trần Thị B", identifier: "tranthib", avatar: "" },
    content: "Tips học React hiệu quả:\n\n1. Hiểu rõ State và Props\n2. Practice với các mini projects\n3. Đọc documentation chính thức\n4. Tham gia cộng đồng\n\nAi có thêm kinh nghiệm gì không? Share cùng mình nha! 💡",
    likes: 56,
    comments: 12,
    shares: 8,
    createdAt: "30 phút trước",
    liked: true,
    saved: true,
    tags: ["React", "Tips"],
  },
  {
    _id: "3",
    author: { username: "Lê Minh C", identifier: "leminhc", avatar: "" },
    content: "Mình mới tìm được một IDE extension rất hay cho JavaScript, giúp format code tự động và highlight errors realtime. Ai dùng VS Code thì thử Prettier + ESLint combo nhé! 🔥",
    likes: 18,
    comments: 3,
    shares: 1,
    createdAt: "2 giờ trước",
    liked: false,
    saved: false,
    tags: ["Tools", "VSCode"],
  },
];

export default function PostsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(mockPosts);
  const [createOpen, setCreateOpen] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [activeFilter, setActiveFilter] = useState("newest");

  const toggleLike = (id) => {
    setPosts(posts.map((p) =>
      p._id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ));
  };

  const toggleSave = (id) => {
    setPosts(posts.map((p) =>
      p._id === id ? { ...p, saved: !p.saved } : p
    ));
  };

  const handleCreatePost = () => {
    if (!newPost.trim()) return;
    const post = {
      _id: Date.now().toString(),
      author: { username: user?.username, identifier: user?.identifier, avatar: user?.avatar },
      content: newPost,
      likes: 0,
      comments: 0,
      shares: 0,
      createdAt: "Vừa xong",
      liked: false,
      saved: false,
      tags: [],
    };
    setPosts([post, ...posts]);
    setNewPost("");
    setCreateOpen(false);
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
            Bạn đang nghĩ gì? Chia sẻ với cộng đồng...
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
      {posts.length === 0 ? (
        <EmptyState
          icon={<PenSquare size={28} className="text-indigo-400" />}
          title="Chưa có bài viết nào"
          description="Hãy là người đầu tiên chia sẻ!"
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus size={16} />
              Đăng bài đầu tiên
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post, i) => (
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
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Tạo bài viết" size="md">
        <div className="flex items-center gap-3 mb-4">
          <Avatar src={user?.avatar} name={user?.username} size="md" />
          <div>
            <p className="text-sm font-semibold text-slate-200">{user?.username}</p>
            <p className="text-xs text-slate-500">Đăng công khai</p>
          </div>
        </div>
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Bạn đang nghĩ gì? Chia sẻ kiến thức, hỏi đáp, hoặc đơn giản là cuộc sống... ✨"
          rows={5}
          autoFocus
          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
        />
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-1">
            <button className="p-2 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
              <Image size={20} />
            </button>
            <button className="p-2 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
              <Link2 size={20} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">{newPost.length}/1000</span>
            <Button onClick={handleCreatePost} disabled={!newPost.trim()}>
              <Send size={16} />
              Đăng bài
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
