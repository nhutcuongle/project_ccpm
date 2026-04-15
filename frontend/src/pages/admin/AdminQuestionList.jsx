import { useState, useEffect, useCallback } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { Search, Trash2, FileText, Calendar, User, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import axiosClient from "../../services/axiosClient";

export default function AdminQuestionList() {
  const [questions, setQuestions] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchQuestions = useCallback(async (p = 1, search = query) => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/admin/questions", {
        params: { page: p, limit: 10, search: search },
      });
      setQuestions(res.data.data);
      setTotal(res.data.pagination.total);
    } catch {
      toast.error("Không thể tải danh sách câu hỏi");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchQuestions(1, query);
  }, [query]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setActionLoading(deleteModal);
    try {
      await axiosClient.delete(`/admin/questions/${deleteModal}`);
      toast.success("Đã xóa câu hỏi");
      setDeleteModal(null);
      fetchQuestions(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Xóa thất bại");
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FileText size={24} className="text-amber-400" />
            Quản lý câu hỏi
          </h1>
          <p className="text-sm text-slate-500 mt-1">Tổng cộng {total} bài đăng đang được giám sát</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, nội dung..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 input-glow transition-all"
          />
        </div>
      </div>

      {/* Questions Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="py-16"><Spinner size="lg" /></div>
        ) : questions.length === 0 ? (
          <EmptyState
            icon={<FileText size={28} className="text-amber-400" />}
            title="Không tìm thấy câu hỏi"
            description="Chưa có câu hỏi nào được tạo hoặc từ khóa tìm kiếm không khớp"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/30">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Nội dung câu hỏi</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Tác giả</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Thời gian</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Tương tác</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, i) => (
                    <tr
                      key={q._id}
                      className={`border-b border-slate-700/20 hover:bg-white/[0.02] transition-colors animate-fade-in-up`}
                    >
                      <td className="px-6 py-4 max-w-md">
                        <div>
                          <p className="text-sm font-semibold text-slate-200 line-clamp-1">{q.title}</p>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1">{q.content}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar src={q.author?.avatar} name={q.author?.username} size="xs" />
                          <span className="text-sm text-slate-400">{q.author?.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(q.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>{q.score} điểm</span>
                          <span>{q.answersCount} phản hồi</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end">
                          <Button
                            variant="danger"
                            size="sm"
                            ghost
                            onClick={() => setDeleteModal(q._id)}
                            icon={<Trash2 size={14} />}
                          >
                            Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/30">
                <p className="text-xs text-slate-500">Trang {page} / {totalPages}</p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => { setPage(page - 1); fetchQuestions(page - 1); }}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => { setPage(page + 1); fetchQuestions(page + 1); }}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Xác nhận xóa bài đăng">
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} className="text-red-400" />
          </div>
          <p className="text-slate-300 mb-1">Xóa bài đăng vi phạm chính sách?</p>
          <p className="text-xs text-slate-500">Hành động này sẽ xóa vĩnh viễn nội dung và các bình luận liên quan</p>
        </div>
        <div className="flex gap-3 mt-4">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteModal(null)}>
            Hủy
          </Button>
          <Button variant="danger" className="flex-1" loading={!!actionLoading} onClick={handleDelete}>
            Xóa bài đăng
          </Button>
        </div>
      </Modal>
    </div>
  );
}
