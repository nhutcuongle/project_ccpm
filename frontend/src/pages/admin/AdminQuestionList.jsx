import { useState, useEffect, useCallback } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { Search, Trash2, FileText, Calendar, User, AlertTriangle, CheckCircle2, XCircle, Clock } from "lucide-react";
import Badge from "../../components/ui/Badge";

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
  const [filter, setFilter] = useState("all"); // all, pending, approved


  const fetchQuestions = useCallback(async (p = 1, search = query, currentFilter = filter) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 10, search: search };
      if (currentFilter === "pending") params.approved = "false";
      if (currentFilter === "approved") params.approved = "true";
      
      const res = await axiosClient.get("/admin/questions", { params });
      setQuestions(res.data.data);
      setTotal(res.data.pagination.total);
    } catch {
      toast.error("Không thể tải danh sách câu hỏi");
    } finally {
      setLoading(false);
    }
  }, [filter, query]);

  useEffect(() => {
    fetchQuestions(1, query, filter);
  }, [query, filter, fetchQuestions]);


  const handleApprove = async (id) => {
    try {
      await axiosClient.patch(`/admin/questions/${id}/approve`);
      toast.success("Đã duyệt bài viết");
      fetchQuestions(page);
    } catch {
      toast.error("Duyệt bài thất bại");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn từ chối bài viết này? Bài viết sẽ bị xóa.")) return;
    try {
      await axiosClient.delete(`/admin/questions/${id}/reject`);
      toast.success("Đã từ chối bài viết");
      fetchQuestions(page);
    } catch {
      toast.error("Từ chối bài thất bại");
    }
  };

  const handleDelete = async (id = deleteModal) => {
    if (!id) return;
    setActionLoading(id);
    try {
      await axiosClient.delete(`/admin/questions/${id}`);
      toast.success("Đã xóa bài viết");
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

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
            {[
              { id: "all", label: "Tất cả" },
              { id: "pending", label: "Chờ duyệt" },
              { id: "approved", label: "Đã duyệt" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => { setFilter(t.id); setPage(1); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === t.id ? "bg-indigo-500 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>
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
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Trạng thái</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Thời gian</th>
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
                        <span className="text-sm text-slate-400 font-medium">{q.author?.username}</span>
                      </td>
                      <td className="px-6 py-4">
                        {q.approved ? (
                          <Badge variant="active" className="flex items-center gap-1 w-fit">
                            <CheckCircle2 size={10} /> Đã duyệt
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="flex items-center gap-1 w-fit">
                            <Clock size={10} /> Chờ duyệt
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(q.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {!q.approved && (
                            <>
                              <button
                                onClick={() => handleApprove(q._id)}
                                className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-all border border-emerald-500/20"
                                title="Phê duyệt"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                              <button
                                onClick={() => handleReject(q._id)}
                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all border border-red-500/20"
                                title="Từ chối"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              if (window.confirm("Bạn có chắc muốn xóa bài viết này?")) {
                                handleDelete(q._id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Xóa vĩnh viễn"
                          >
                            <Trash2 size={16} />
                          </button>
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
