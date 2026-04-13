import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Modal from "../ui/Modal";
import Avatar from "../ui/Avatar";
import Spinner from "../ui/Spinner";
import EmptyState from "../ui/EmptyState";
import { Users } from "lucide-react";
import * as followService from "../../services/followService";
import { toast } from "react-hot-toast";

export default function FollowListModal({ isOpen, onClose, userId, type }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setUsers([]);
      setPage(1);
      setHasMore(true);
      fetchUsers(1);
    }
  }, [isOpen, userId, type]);

  const fetchUsers = async (pageNum) => {
    try {
      setLoading(true);
      const limit = 20;
      let data;
      if (type === "followers") {
        data = await followService.getFollowers(userId, pageNum, limit);
        setUsers((prev) => (pageNum === 1 ? data.followers : [...prev, ...data.followers]));
      } else {
        data = await followService.getFollowing(userId, pageNum, limit);
        setUsers((prev) => (pageNum === 1 ? data.following : [...prev, ...data.following]));
      }

      if (pageNum >= data.pagination.totalPages) {
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchUsers(nextPage);
    }
  };

  const title = type === "followers" ? "Người theo dõi" : "Đang theo dõi";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {users.length === 0 && !loading ? (
          <EmptyState
            icon={<Users size={40} className="text-slate-500" />}
            title={`Chưa có ${type === "followers" ? "người theo dõi" : "đang theo dõi ai"}`}
            description="Danh sách này hiện tại đang trống."
          />
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <Link
                key={u._id}
                to={`/profile/${u._id}`}
                onClick={onClose}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition-colors"
              >
                <Avatar src={u.avatar} name={u.username} size="md" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-200">{u.username}</p>
                  <p className="text-xs text-slate-500">@{u.identifier}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-4">
            <Spinner size="md" />
          </div>
        )}

        {hasMore && !loading && users.length > 0 && (
          <button
            onClick={loadMore}
            className="w-full py-2 mt-4 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Tải thêm
          </button>
        )}
      </div>
    </Modal>
  );
}
