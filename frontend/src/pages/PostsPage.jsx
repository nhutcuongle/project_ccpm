import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import Card from "../components/ui/Card";

import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";
import Badge from "../components/ui/Badge";
import PostItem from "../components/PostItem";
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
  Search,
  AlertCircle
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

  // Moderation state
  const [moderationModal, setModerationModal] = useState({ open: false, words: [], formData: null });
  const [loading, setLoading] = useState(false);


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
      const newFiles = Array.from(e.target.files);
      setSelectedImages((prev) => [...prev, ...newFiles]);
    }
    // Reset value to allow selecting same file again if removed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };


  const handleCreateOrUpdatePost = async (isForced = false) => {
    if (!newPostTitle.trim() || !newPost.trim()) return;

    // Lấy hashtag từ ô nhập riêng
    const rawTags = hashtagInput.split(/[\s,]+/).filter(tag => tag.trim() !== "");
    const formattedHashtags = rawTags.map((tag) => tag.startsWith("#") ? tag.slice(1).toLowerCase() : tag.toLowerCase());

    setLoading(true);
    try {
      if (editingPostId) {
        // Edit mode
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
        
        if (isForced) {
           formData.append("forceModeration", "true");
        }

        try {
          const res = await questionService.createQuestion(formData);
          if (!res.data.data.approved) {
             toast.success("Bài viết đã được gửi và đang chờ kiểm duyệt");
          } else {
             toast.success("Đã đăng bài thành công");
          }
        } catch (err) {
          if (err.response?.data?.status === "REQUIRES_MODERATION") {
            setModerationModal({
              open: true,
              words: err.response.data.data.bannedWords || [],
              formData: formData
            });
            return;
          }
          throw err;
        }
      }

      await fetchPosts();
      await fetchTrendingTags();
      closeModal();
      setModerationModal({ open: false, words: [], formData: null });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
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

  const handleUpdatePost = (postId, data) => {
    setPosts(prevPosts => prevPosts.map(p => p._id === postId ? { ...p, ...data } : p));
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
              <PostItem 
                key={post._id} 
                post={post}
                onUpdate={handleUpdatePost}
                className={`animate-fade-in-up stagger-${Math.min(i + 1, 5)}`}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                setActiveHashtagFilter={setActiveHashtagFilter}
                getTimeAgo={getTimeAgo}
              />
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
                <div className="flex gap-3 mb-2 overflow-x-auto pb-3 pt-1 px-1 custom-scrollbar">
                  {selectedImages.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 border-slate-700/50 group bg-slate-800">
                      <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" alt="upload preview" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Xóa ảnh"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 shrink-0 rounded-xl border-2 border-dashed border-slate-700 hover:border-indigo-500/50 flex flex-col items-center justify-center text-slate-500 hover:text-indigo-400 transition-all bg-slate-800/30"
                  >
                    <Plus size={20} />
                    <span className="text-[10px] mt-1 font-medium">Thêm</span>
                  </button>
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
            <Button 
              onClick={() => handleCreateOrUpdatePost(false)} 
              disabled={!newPostTitle.trim() || !newPost.trim()}
              loading={loading}
            >
              <Send size={16} />
              {editingPostId ? "Lưu thay đổi" : "Đăng bài"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Moderation Confirmation Modal */}
      <Modal 
        isOpen={moderationModal.open} 
        onClose={() => setModerationModal({ ...moderationModal, open: false })}
        title="Nội dung cần kiểm duyệt"
        size="sm"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 mb-2">Phát hiện từ nhạy cảm</h3>
          <p className="text-sm text-slate-400 mb-4">
            Bài viết của bạn chứa một số từ ngữ cần được kiểm duyệt: 
            <span className="text-amber-400 font-semibold ml-1">
              {moderationModal.words.join(", ")}
            </span>
          </p>
          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 text-[11px] text-slate-500 text-left mb-6">
            Lưu ý: Nếu tiếp tục, bài viết của bạn sẽ không hiển thị ngay lập tức mà phải chờ Quản trị viên phê duyệt.
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              className="flex-1" 
              onClick={() => setModerationModal({ ...moderationModal, open: false })}
            >
              Hủy bỏ
            </Button>
            <Button 
              variant="primary" 
              className="flex-1" 
              onClick={() => handleCreateOrUpdatePost(true)}
              loading={loading}
            >
              Đồng ý gửi duyệt
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
