import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import { User, Mail, Phone, MapPin, Hash, FileText, Shield, Users } from "lucide-react";
import { toast } from "react-hot-toast";
import * as userService from "../services/userService";
import * as followService from "../services/followService";
import FollowButton from "../components/follow/FollowButton";
import FollowListModal from "../components/follow/FollowListModal";

export default function PublicProfile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [followModalConfig, setFollowModalConfig] = useState({ isOpen: false, type: "followers" });

  useEffect(() => {
    if (userId === currentUser?.id) {
      navigate("/profile");
      return;
    }
    fetchData();
  }, [userId, currentUser]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userRes, followersCount, followingCount] = await Promise.all([
        userService.getUserProfile(userId),
        followService.getFollowers(userId, 1, 1),
        followService.getFollowing(userId, 1, 1)
      ]);
      setProfile(userRes);
      setStats({
        followers: followersCount.pagination.total,
        following: followingCount.pagination.total
      });
    } catch (err) {
      toast.error("Không thể tải hồ sơ người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowChange = async () => {
    // Refresh stats when follow status changes
    try {
      const followersCount = await followService.getFollowers(userId, 1, 1);
      setStats(prev => ({ ...prev, followers: followersCount.pagination.total }));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      {/* Profile Header */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5 pt-8">
          <Avatar src={profile?.avatar} name={profile?.username} size="xl" />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-slate-100">{profile?.username}</h1>
            <p className="text-sm text-slate-500">@{profile?.identifier}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
              <Badge variant={profile?.role === "admin" ? "admin" : "user"}>
                {profile?.role === "admin" ? <><Shield size={12} /> Admin</> : <><User size={12} /> Thành viên</>}
              </Badge>
              <div className="flex items-center gap-4 ml-2 text-xs text-slate-400">
                <button 
                  onClick={() => setFollowModalConfig({ isOpen: true, type: "followers" })}
                  className="flex items-center gap-1 hover:text-indigo-400 transition-colors"
                >
                  <Users size={14}/> <strong>{stats.followers}</strong> người theo dõi
                </button>
                <button 
                  onClick={() => setFollowModalConfig({ isOpen: true, type: "following" })}
                  className="flex items-center gap-1 hover:text-indigo-400 transition-colors"
                >
                  <strong>{stats.following}</strong> đang theo dõi
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <FollowButton userId={userId} onStatusChange={handleFollowChange} />
          </div>
        </div>

        {profile?.bio && (
          <p className="mt-4 text-slate-400 text-sm border-t border-slate-700/30 pt-4">{profile.bio}</p>
        )}
      </Card>

      {/* Profile Details */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-200 mb-5">Thông tin chi tiết</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: <User size={16} />, label: "Tên hiển thị", value: profile?.username },
            { icon: <Mail size={16} />, label: "Email", value: profile?.email },
            { icon: <Hash size={16} />, label: "Mã định danh", value: profile?.identifier },
            { icon: <Phone size={16} />, label: "Số điện thoại", value: profile?.phoneNumber || "Chưa cập nhật" },
            { icon: <MapPin size={16} />, label: "Địa chỉ", value: profile?.address || "Chưa cập nhật" },
            { icon: <FileText size={16} />, label: "Tiểu sử", value: profile?.bio || "Chưa cập nhật" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                {item.icon}
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{item.label}</p>
                <p className="text-sm text-slate-300 mt-0.5">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <FollowListModal
        isOpen={followModalConfig.isOpen}
        onClose={() => setFollowModalConfig({ ...followModalConfig, isOpen: false })}
        userId={userId}
        type={followModalConfig.type}
      />
    </div>
  );
}
