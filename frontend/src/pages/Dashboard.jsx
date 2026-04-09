import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import {
  PenSquare,
  MessageCircle,
  Users,
  TrendingUp,
  Clock,
  Shield,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user, isAdmin } = useAuth();

  const quickActions = [
    {
      icon: <PenSquare size={22} />,
      label: "Đăng bài mới",
      desc: "Chia sẻ kiến thức với cộng đồng",
      to: "/posts",
      color: "from-indigo-500 to-purple-500",
      shadow: "shadow-indigo-500/20",
    },
    {
      icon: <MessageCircle size={22} />,
      label: "Nhắn tin",
      desc: "Trò chuyện với bạn bè",
      to: "/messages",
      color: "from-cyan-500 to-blue-500",
      shadow: "shadow-cyan-500/20",
    },
    {
      icon: <Users size={22} />,
      label: "Hồ sơ cá nhân",
      desc: "Xem và chỉnh sửa thông tin",
      to: "/profile",
      color: "from-emerald-500 to-teal-500",
      shadow: "shadow-emerald-500/20",
    },
  ];

  const stats = [
    { icon: <PenSquare size={18} />, label: "Bài viết", value: "—", hint: "Chưa có dữ liệu" },
    { icon: <MessageCircle size={18} />, label: "Tin nhắn", value: "—", hint: "Chưa có dữ liệu" },
    { icon: <TrendingUp size={18} />, label: "Lượt xem", value: "—", hint: "Chưa có dữ liệu" },
    { icon: <Clock size={18} />, label: "Ngày tham gia", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "—" },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl gradient-mesh p-8 glass">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar src={user?.avatar} name={user?.username} size="xl" />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
                Xin chào, {user?.username}! 
              </h1>
              <Sparkles size={24} className="text-amber-400 animate-float" />
            </div>
            <p className="text-slate-400 text-sm sm:text-base">
              Chào mừng bạn quay trở lại nền tảng. Hãy bắt đầu một ngày mới tuyệt vời!
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant={user?.role === "admin" ? "admin" : "user"}>
                {user?.role === "admin" ? (
                  <><Shield size={12} /> Admin</>
                ) : (
                  <><Users size={12} /> Thành viên</>
                )}
              </Badge>
              <span className="text-xs text-slate-500">@{user?.identifier}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-slate-200 mb-4">Truy cập nhanh</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="group glass rounded-2xl p-5 hover-glow transition-all duration-300 block"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} ${action.shadow} shadow-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                  {action.icon}
                </div>
                <ArrowUpRight size={18} className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <h3 className="font-semibold text-slate-200 mb-1">{action.label}</h3>
              <p className="text-xs text-slate-500">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-200 mb-4">Thống kê</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Card key={i} className={`animate-fade-in-up stagger-${i + 1}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  {stat.icon}
                </div>
                <span className="text-xs text-slate-500 font-medium">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-slate-200">{stat.value}</p>
              {stat.hint && <p className="text-[10px] text-slate-600 mt-1">{stat.hint}</p>}
            </Card>
          ))}
        </div>
      </div>

      {/* Admin Quick Access */}
      {isAdmin && (
        <Card className="border-amber-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Shield size={22} className="text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-200">Bảng quản trị</h3>
              <p className="text-xs text-slate-500">Quản lý tài khoản người dùng trong hệ thống</p>
            </div>
            <Link
              to="/admin/users"
              className="gradient-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
            >
              Mở quản lý
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
