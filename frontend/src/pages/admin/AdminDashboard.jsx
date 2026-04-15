import { useState, useEffect } from "react";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";
import { Users, FileText, MessageSquare, BarChart3, Activity, ShieldCheck } from "lucide-react";
import axiosClient from "../../services/axiosClient";
import { toast } from "react-hot-toast";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosClient.get("/admin/stats");
        setStats(res.data.data);
      } catch (err) {
        toast.error("Không thể tải số liệu thống kê");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Tổng người dùng",
      value: stats?.users?.total || 0,
      subValue: `${stats?.users?.active || 0} đang hoạt động`,
      icon: <Users className="text-blue-400" />,
      color: "blue"
    },
    {
      title: "Tổng câu hỏi",
      value: stats?.content?.questions || 0,
      subValue: "Bài viết cộng đồng",
      icon: <FileText className="text-amber-400" />,
      color: "amber"
    },
    {
      title: "Tổng câu trả lời",
      value: stats?.content?.answers || 0,
      subValue: "Sự hỗ trợ hữu ích",
      icon: <MessageSquare className="text-emerald-400" />,
      color: "emerald"
    },
    {
      title: "Tài khoản bị khóa",
      value: stats?.users?.disabled || 0,
      subValue: "Vi phạm chính sách",
      icon: <Activity className="text-red-400" />,
      color: "red"
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <BarChart3 size={24} className="text-indigo-400" />
          Bảng điều khiển quản trị
        </h1>
        <p className="text-sm text-slate-500 mt-1">Tổng quan các chỉ số hoạt động của hệ thống CCPM</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Card key={index} className="p-6 border-l-4 border-l-transparent hover:border-l-indigo-500 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-slate-800/50 rounded-xl">
                {card.icon}
              </div>
              <ShieldCheck size={16} className="text-slate-600" />
            </div>
            <p className="text-sm font-medium text-slate-500">{card.title}</p>
            <h3 className="text-3xl font-bold text-slate-100 mt-1">{card.value}</h3>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
              {card.subValue}
            </p>
          </Card>
        ))}
      </div>

      {/* System Status Table (Placeholder for now) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Card className="lg:col-span-2 p-6">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Hoạt động gần đây</h3>
            <div className="space-y-4">
               {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center justify-between py-3 border-b border-slate-700/30 last:border-0">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                           <Activity size={14} className="text-indigo-400" />
                        </div>
                        <div>
                           <p className="text-sm text-slate-300">Hệ thống đang hoạt động ổn định</p>
                           <p className="text-xs text-slate-500">Vừa xong</p>
                        </div>
                     </div>
                     <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">OK</span>
                  </div>
               ))}
            </div>
         </Card>
         <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Thông tin máy chủ</h3>
            <div className="space-y-4">
               <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Database</span>
                  <span className="text-emerald-400 font-medium">Connected</span>
               </div>
               <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Storage</span>
                  <span className="text-slate-300">Cloudinary</span>
               </div>
               <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Socket server</span>
                  <span className="text-indigo-400 font-medium">Running</span>
               </div>
            </div>
         </Card>
      </div>
    </div>
  );
}
