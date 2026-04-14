import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";
import {
  PenSquare,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Image as ImageIcon,
  Link2,
  Send,
  Plus,
  Clock,
  TrendingUp,
  Filter,
  X,
  Edit,
  Trash2,
  Hash,
  Search
} from "lucide-react";

import * as questionService from "../services/questionService";
import * as hashtagService from "../services/hashtagService";

export default function PostsPage() {
  const { user, isAdmin } = useAuth();
  const [posts, setPosts] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);

  // Post payload state
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPost, setNewPost] = useState(""); // content
  const [hashtagInput, setHashtagInput] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const fileInputRef = useRef(null);

  const [activeFilter, setActiveFilter] = useState("newest");
  const [activeHashtagFilter, setActiveHashtagFilter] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  useEffect(() => {
    fetchPosts();
  }, [activeFilter, activeHashtagFilter, activeSearch]);

  useEffect(() => {
    fetchTrendingTags();
  }, []);

  const fetchPosts = async () => {
    try {
      const params = {
        sort: activeFilter === "newest" ? "latest" : "popular",
      };
      if (activeHashtagFilter) {
        params.hashtag = activeHashtagFilter;
      }
      if (activeSearch) {
        params.search = activeSearch;
      }
      const res = await questionService.getQuestions(params);
      setPosts(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTrendingTags = async () => {
    try {
      const res = await hashtagService.getTrendingHashtags();
      setTrendingTags(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files));
    }
  };

  const handleCreateOrUpdatePost = async () => {
    if (!newPostTitle.trim() || !newPost.trim()) return;

    // Lấy hashtag từ ô nhập riêng (tách bằng dấu phẩy hoặc khoảng trắng)
    const rawTags = hashtagInput.split(/[\s,]+/).filter(tag => tag.trim() !== "");
    const formattedHashtags = rawTags.map((tag) => tag.startsWith("#") ? tag.slice(1).toLowerCase() : tag.toLowerCase());

    try {
      if (editingPostId) {
        // Edit mode (không sửa ảnh)
        const updateData = {
          title: newPostTitle,
          content: newPost,
          hashtags: formattedHashtags.length > 0 ? formattedHashtags : undefined,
        };
        await questionService.updateQuestion(editingPostId, updateData);
      } else {
        // Create mode
        const formData = new FormData();
        formData.append("title", newPostTitle);
        formData.append("content", newPost);
        if (formattedHashtags.length > 0) {
          formData.append("hashtags", formattedHashtags.join(","));
        }
        if (selectedImages && selectedImages.length > 0) {
          selectedImages.forEach((img) => formData.append("images", img));
        }
        await questionService.createQuestion(formData);
      }

      await fetchPosts();
      await fetchTrendingTags();
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra: " + err.message);
    }
  };

  const closeModal = () => {
    setNewPostTitle("");
    setNewPost("");
    setHashtagInput("");
    setSelectedImages([]);
    setEditingPostId(null);
    setCreateOpen(false);
  };

  const openCreateModal = () => {
    closeModal();
    setCreateOpen(true);
  };

  const handleEdit = (post) => {
    setEditingPostId(post._id);
    setNewPostTitle(post.title);
    setNewPost(post.content);
    setHashtagInput(post.hashtags ? post.hashtags.map(h => h.name).join(", ") : "");
    setSelectedImages([]);
    setCreateOpen(true);
    setActiveDropdown(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa câu hỏi này?")) {
      try {
        await questionService.deleteQuestion(id);
        await fetchPosts();
        await fetchTrendingTags();
      } catch (err) {
        console.error(err);
        alert("Không thể xóa!");
      }
    }
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return "Vừa xong";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const filters = [
    { key: "newest", label: "Mới nhất", icon: <Clock size={14} /> },
    { key: "popular", label: "Phổ biến", icon: <TrendingUp size={14} /> },
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
      {/* Main Content Area */}
      <div className="w-full lg:flex-1 space-y-6 animate-fade-in-up">
        {/* Create Post CTA */}
        <Card>
          <div className="flex items-center gap-3">
            <Avatar src={user?.avatar} name={user?.username} size="md" />
            <button
              onClick={openCreateModal}
              className="flex-1 text-left px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-500 hover:border-slate-600/50 hover:text-slate-400 transition-all cursor-text"
            >
              Bạn muốn hỏi gì? Gõ #hashtag để phân loại...
            </button>
            <Button onClick={openCreateModal} size="md">
              <Plus size={18} />
              Đăng
            </Button>
          </div>
        </Card>

        {/* Filters and Active Hashtag */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-500" />
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeFilter === f.key
                      ? "gradient-primary text-white"
                      : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                    }`}
                >
                  {f.icon}
                  {f.label}
                </button>
              ))}
            </div>

            {(activeHashtagFilter || activeSearch) && (
              <div className="flex items-center gap-2">
                {activeHashtagFilter && (
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-500">
                    <Hash size={14} />
                    {activeHashtagFilter}
                    <button onClick={() => setActiveHashtagFilter("")}>
                      <X size={14} className="hover:text-amber-300 ml-1" />
                    </button>
                  </div>
                )}
                {activeSearch && (
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-400">
                    <Search size={14} />
                    {activeSearch}
                    <button onClick={() => { setActiveSearch(""); setSearchQuery(""); }}>
                      <X size={14} className="hover:text-indigo-300 ml-1" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (searchQuery.trim().startsWith("#")) {
                    setActiveHashtagFilter(searchQuery.trim().slice(1).toLowerCase());
                    setSearchQuery("");
                    setActiveSearch("");
                  } else {
                    setActiveSearch(searchQuery.trim());
                  }
                }
              }}
              placeholder="Tìm kiếm (hoặc gõ #tag)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all font-sans"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
        </div>

        {/* Posts Feed */}
        {posts.length === 0 ? (
          <EmptyState
            icon={<PenSquare size={28} className="text-indigo-400" />}
            title="Chưa có câu hỏi nào"
            description="Hãy là người đầu tiên đặt câu hỏi!"
            action={
              <Button onClick={openCreateModal}>
                <Plus size={16} />
                Tạo bài đầu tiên
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {posts.map((post, i) => (
              <Card key={post._id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 5)} overflow-visible`}>
                {/* Post Header */}
                <div className="flex items-start justify-between mb-3 relative">
                  <div className="flex items-center gap-3">
                    <Avatar src={post.author?.avatar} name={post.author?.username || "Ẩn danh"} size="md" />
                    <div>
                      <p className="text-sm font-semibold text-slate-200">
                        {post.author?.username || "Ẩn danh"}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-slate-500">{getTimeAgo(post.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Options */}
                  {(user?._id === post.author?._id || isAdmin) && (
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

                {/* Content */}
                <h3 className="text-base font-bold text-slate-100 mb-2">{post.title}</h3>
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
                        key={tag._id}
                        onClick={() => setActiveHashtagFilter(tag.name)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <Badge variant="info">#{tag.name}</Badge>
                      </button>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-700/30">
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 transition-all">
                      <Heart size={16} />
                      {post.score || 0}
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 transition-all">
                      <MessageCircle size={16} />
                      {post.answersCount || 0}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Right Sidebar - Trending Hashtags */}
      <div className="w-full lg:w-72 space-y-6">
        <Card className="sticky top-20">
          <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-400" />
            Chủ đề nôi bật
          </h3>
          {trendingTags.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có chủ đề nào.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {trendingTags.map((tag) => (
                <button
                  key={tag._id}
                  onClick={() => setActiveHashtagFilter(tag.name)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all ${activeHashtagFilter === tag.name
                      ? "bg-indigo-500/10 border border-indigo-500/30"
                      : "hover:bg-white/5"
                    }`}
                >
                  <span className={`text-sm font-medium ${activeHashtagFilter === tag.name ? 'text-indigo-400' : 'text-slate-300'}`}>
                    #{tag.name}
                  </span>
                  <span className="text-xs text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-full">
                    {tag.postCount}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Create / Edit Post Modal */}
      <Modal isOpen={createOpen} onClose={closeModal} title={editingPostId ? "Sửa câu hỏi" : "Tạo câu hỏi"} size="md">
        <div className="flex items-center gap-3 mb-4">
          <Avatar src={user?.avatar} name={user?.username} size="md" />
          <div>
            <p className="text-sm font-semibold text-slate-200">{user?.username}</p>
            <p className="text-xs text-slate-500">Đăng công khai</p>
          </div>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            placeholder="Tiêu đề câu hỏi của bạn..."
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 font-semibold placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all font-sans"
            autoFocus
          />

          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Nội dung chi tiết..."
            rows={5}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
          />

          <input
            type="text"
            value={hashtagInput}
            onChange={(e) => setHashtagInput(e.target.value)}
            placeholder="Hashtags (phân cách bằng dấu phẩy, vd: react, nodejs)"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 font-semibold placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all font-sans"
          />

          {!editingPostId && (
            <div>
              <input
                type="file"
                multiple
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />
              {selectedImages.length > 0 && (
                <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                  {selectedImages.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-slate-700">
                      <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" alt="upload preview" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-1">
            <button
              title="Đính kèm ảnh"
              onClick={() => fileInputRef.current?.click()}
              disabled={!!editingPostId}
              className={`p-2 rounded-lg transition-all ${editingPostId ? 'text-slate-600 cursor-not-allowed' : 'text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10'}`}
            >
              <ImageIcon size={20} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">{newPostTitle.length} - {newPost.length}/1000</span>
            <Button onClick={handleCreateOrUpdatePost} disabled={!newPostTitle.trim() || !newPost.trim()}>
              <Send size={16} />
              {editingPostId ? "Lưu thay đổi" : "Đăng bài"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
