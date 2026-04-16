import { useState, useEffect, useCallback } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import Input from "../../components/ui/Input";
import { Search, Ban, Plus, Trash2, AlertTriangle, ShieldAlert } from "lucide-react";
import { toast } from "react-hot-toast";
import axiosClient from "../../services/axiosClient";

export default function AdminBannedWordList() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newWord, setNewWord] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchWords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/admin/banned-words");
      setWords(res.data.data);
    } catch {
      toast.error("Không thể tải danh sách từ cấm");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const handleAddWord = async () => {
    if (!newWord.trim()) return;
    setIsAdding(true);
    try {
      await axiosClient.post("/admin/banned-words", { word: newWord.trim() });
      toast.success("Đã thêm từ cấm mới");
      setNewWord("");
      fetchWords();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Không thể thêm từ");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setActionLoading(deleteModal);
    try {
      await axiosClient.delete(`/admin/banned-words/${deleteModal}`);
      toast.success("Đã xóa từ cấm");
      setDeleteModal(null);
      fetchWords();
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredWords = words.filter(w => 
    w.word.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Ban size={24} className="text-red-400" />
            Quản lý từ cấm
          </h1>
          <p className="text-sm text-slate-500 mt-1">Các bài viết chứa từ này sẽ cần Admin phê duyệt</p>
        </div>

        <div className="flex w-full sm:w-auto gap-2">
          <div className="relative flex-1 sm:w-64">
             <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
             <input
               type="text"
               placeholder="Tìm kiếm từ..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all"
             />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add New Word */}
        <div className="lg:col-span-1">
          <Card className="p-5 sticky top-24">
            <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Plus size={16} className="text-indigo-400" />
              Thêm từ mới
            </h3>
            <div className="space-y-4">
              <Input
                placeholder="Nhập từ cần chặn..."
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddWord()}
              />
              <Button 
                onClick={handleAddWord} 
                className="w-full" 
                loading={isAdding}
                disabled={!newWord.trim()}
              >
                Thêm vào danh sách
              </Button>
              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                 <p className="text-[10px] text-red-400 leading-relaxed">
                   <ShieldAlert size={12} className="inline mr-1 mb-0.5" />
                   Lưu ý: Mọi bài đăng mới chứa từ này sẽ bị tạm giữ để chờ bạn phê duyệt.
                 </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Words List */}
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            {loading ? (
              <div className="py-20 text-center"><Spinner size="lg" /></div>
            ) : filteredWords.length === 0 ? (
              <div className="py-20">
                <EmptyState
                  icon={<Ban size={32} className="text-slate-600" />}
                  title="Danh sách trống"
                  description="Chưa có từ nào bị hạn chế trong hệ thống."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-700/30">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Từ nhạy cảm</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày thêm</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/20">
                    {filteredWords.map((w) => (
                      <tr key={w._id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-slate-200 bg-slate-800 px-2 py-1 rounded border border-slate-700 group-hover:border-red-500/30 transition-colors">
                            {w.word}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {new Date(w.createdAt).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setDeleteModal(w._id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Xóa từ cấm">
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} className="text-red-400" />
          </div>
          <p className="text-slate-300">Gỡ bỏ từ này khỏi danh sách hạn chế?</p>
          <p className="text-xs text-slate-500 mt-1">Hệ thống sẽ không còn tự động chặn bài viết chứa từ này.</p>
        </div>
        <div className="flex gap-3 mt-4">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteModal(null)}>
            Hủy
          </Button>
          <Button variant="danger" className="flex-1" loading={!!actionLoading} onClick={handleDelete}>
            Xác nhận xóa
          </Button>
        </div>
      </Modal>
    </div>
  );
}
