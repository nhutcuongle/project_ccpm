import { useState, useEffect, useCallback } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Avatar from "../../components/ui/Avatar";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { Search, Lock, Unlock, Trash2, Users, Shield, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import axiosClient from "../../services/axiosClient";

export default function AdminUserList() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = useCallback(async (p = 1, search = query) => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/admin/users", {
        params: { page: p, limit: 10, identifier: search },
      });
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch {
      toast.error("Không thể tải danh sách");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchUsers(1, query);
  }, [query]);

  const handleToggle = async (userId) => {
    setActionLoading(userId);
    try {
      const res = await axiosClient.put(`/admin/users/${userId}/toggle-disable`);
      toast.success(res.data.message);
      fetchUsers(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Thao tác thất bại");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setActionLoading(deleteModal);
    try {
      await axiosClient.delete(`/admin/users/${deleteModal}`);
      toast.success("Đã xóa tài khoản");
      setDeleteModal(null);
      fetchUsers(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Xóa thất bại");
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Shield size={24} className="text-amber-400" />
            Quản lý người dùng
          </h1>
          <p className="text-sm text-slate-500 mt-1">Tổng cộng {total} tài khoản trong hệ thống</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo mã định danh..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 input-glow transition-all"
          />
        </div>
      </div>

      {/* Users Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="py-16"><Spinner size="lg" /></div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={<Users size={28} className="text-indigo-400" />}
            title="Không tìm thấy người dùng"
            description="Thử tìm kiếm với từ khóa khác"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/30">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Người dùng</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Email</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Vai trò</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Trạng thái</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr
                      key={u._id}
                      className={`border-b border-slate-700/20 hover:bg-white/[0.02] transition-colors animate-fade-in-up stagger-${Math.min(i + 1, 5)}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={u.avatar} name={u.username} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-slate-200">{u.username}</p>
                            <p className="text-xs text-slate-500">@{u.identifier}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">{u.email}</td>
                      <td className="px-6 py-4">
                        <Badge variant={u.role === "admin" ? "admin" : "user"}>
                          {u.role === "admin" ? "Admin" : "User"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={u.isDisabled ? "disabled" : "active"}>
                          {u.isDisabled ? "Vô hiệu hóa" : "Hoạt động"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {u.role !== "admin" && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant={u.isDisabled ? "success" : "secondary"}
                              size="sm"
                              loading={actionLoading === u._id}
                              onClick={() => handleToggle(u._id)}
                              icon={u.isDisabled ? <Unlock size={14} /> : <Lock size={14} />}
                            >
                              {u.isDisabled ? "Mở" : "Khóa"}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => setDeleteModal(u._id)}
                              icon={<Trash2 size={14} />}
                            >
                              Xóa
                            </Button>
                          </div>
                        )}
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
                    onClick={() => { setPage(page - 1); fetchUsers(page - 1); }}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => { setPage(page + 1); fetchUsers(page + 1); }}
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
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Xác nhận xóa">
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} className="text-red-400" />
          </div>
          <p className="text-slate-300 mb-1">Bạn có chắc chắn muốn xóa tài khoản này?</p>
          <p className="text-xs text-slate-500">Hành động này không thể hoàn tác</p>
        </div>
        <div className="flex gap-3 mt-4">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteModal(null)}>
            Hủy
          </Button>
          <Button variant="danger" className="flex-1" loading={!!actionLoading} onClick={handleDelete}>
            Xóa tài khoản
          </Button>
        </div>
      </Modal>
    </div>
  );
}
