import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import { User, Mail, Phone, MapPin, Hash, FileText, Save, X, Camera, Shield, Users } from "lucide-react";
import { toast } from "react-hot-toast";
import axiosClient from "../services/axiosClient";
import * as followService from "../services/followService";
import FollowListModal from "../components/follow/FollowListModal";
export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [followModalConfig, setFollowModalConfig] = useState({ isOpen: false, type: "followers" });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);


  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const profileRes = await axiosClient.get("/user/me");
      const profileData = profileRes.data;
      
      const [followersRes, followingRes] = await Promise.all([
        followService.getFollowers(profileData._id, 1, 1),
        followService.getFollowing(profileData._id, 1, 1)
      ]);
      
      setProfile(profileData);
      setForm(profileData);
      setStats({
        followers: followersRes.pagination.total,
        following: followingRes.pagination.total
      });
    } catch (err) {
      toast.error("Không thể tải hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axiosClient.put("/user/update-profile", {
        username: form.username,
        bio: form.bio,
        address: form.address,
        phoneNumber: form.phoneNumber,
        identifier: form.identifier,
        avatar: form.avatar,
      });
      setProfile(res.data);
      setUser({ ...user, username: res.data.username, identifier: res.data.identifier, avatar: res.data.avatar });
      localStorage.setItem("user", JSON.stringify({ ...user, username: res.data.username, identifier: res.data.identifier, avatar: res.data.avatar }));
      toast.success("Cập nhật hồ sơ thành công!");
      setEditing(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setUploadingAvatar(true);
    try {
      const res = await axiosClient.put("/user/update-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const updatedUser = res.data.user;
      setProfile(updatedUser);
      setForm(updatedUser);
      
      // Update global context & local storage
      const newUserState = { ...user, avatar: updatedUser.avatar };
      setUser(newUserState);
      localStorage.setItem("user", JSON.stringify(newUserState));
      
      toast.success("Cập nhật ảnh đại diện thành công!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Không thể upload ảnh");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });


  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      {/* Profile Header */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5 pt-8">
          <div className="relative group">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleAvatarChange} 
            />
            <div 
              className={`relative rounded-full overflow-hidden ${uploadingAvatar ? 'opacity-50' : 'cursor-pointer'}`}
              onClick={!uploadingAvatar ? handleAvatarClick : undefined}
            >
              <Avatar src={profile?.avatar} name={profile?.username} size="xl" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingAvatar ? (
                  <Spinner size="sm" />
                ) : (
                  <Camera size={24} className="text-white" />
                )}
              </div>
            </div>
            {uploadingAvatar && (
               <div className="absolute inset-0 flex items-center justify-center">
                  <Spinner size="md" />
               </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-slate-100">{profile?.username}</h1>
            <p className="text-sm text-slate-500">@{profile?.identifier}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
              <Badge variant={profile?.role === "admin" ? "admin" : "user"}>
                {profile?.role === "admin" ? <><Shield size={12} /> Admin</> : <><User size={12} /> Thành viên</>}
              </Badge>
              <Badge variant={profile?.isDisabled ? "disabled" : "active"}>
                {profile?.isDisabled ? "Vô hiệu hóa" : "Hoạt động"}
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
          <div>
            {!editing ? (
              <Button variant="outline" onClick={() => setEditing(true)}>
                Chỉnh sửa
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => { setEditing(false); setForm(profile); }} icon={<X size={16} />}>
                  Hủy
                </Button>
                <Button onClick={handleSave} loading={saving} icon={<Save size={16} />}>
                  Lưu
                </Button>
              </div>
            )}
          </div>
        </div>

        {profile?.bio && !editing && (
          <p className="mt-4 text-slate-400 text-sm border-t border-slate-700/30 pt-4">{profile.bio}</p>
        )}
      </Card>

      {/* Profile Details */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-200 mb-5">Thông tin chi tiết</h2>
        <div className="space-y-4">
          {editing ? (
            <>
              <Input label="Tên hiển thị" icon={<User size={18} />} value={form.username || ""} onChange={update("username")} />
              <Input label="Mã định danh" icon={<Hash size={18} />} value={form.identifier || ""} onChange={update("identifier")} />
              <Input label="URL Avatar" icon={<Camera size={18} />} value={form.avatar || ""} onChange={update("avatar")} placeholder="https://..." />
              <Input label="Số điện thoại" icon={<Phone size={18} />} value={form.phoneNumber || ""} onChange={update("phoneNumber")} />
              <Input label="Địa chỉ" icon={<MapPin size={18} />} value={form.address || ""} onChange={update("address")} />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300 ml-1">Tiểu sử</label>
                <textarea
                  value={form.bio || ""}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 input-glow transition-all duration-300 hover:border-slate-600/50 resize-none"
                  placeholder="Giới thiệu đôi chút về bạn..."
                />
              </div>
            </>
          ) : (
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
          )}
        </div>
      </Card>

      <FollowListModal
        isOpen={followModalConfig.isOpen}
        onClose={() => setFollowModalConfig({ ...followModalConfig, isOpen: false })}
        userId={profile?._id}
        type={followModalConfig.type}
      />
    </div>
  );
}
