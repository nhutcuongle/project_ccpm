import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import axiosClient from "../services/axiosClient";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosClient.post("/auth/login", { email, password });
      login(res.data.user, res.data.token);
      toast.success("Đăng nhập thành công!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex gradient-mesh">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        
        <div className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/30 animate-pulse-glow">
            <Sparkles size={36} className="text-white" />
          </div>
          <h1 className="text-5xl font-black gradient-text mb-4">BITISMS</h1>
          <p className="text-xl text-slate-400 leading-relaxed">
            Nền tảng kết nối và chia sẻ kiến thức dành cho cộng đồng sinh viên
          </p>
          <div className="mt-12 flex gap-4 justify-center">
            <div className="glass-light rounded-2xl px-6 py-4 text-center">
              <p className="text-2xl font-bold text-indigo-400">100+</p>
              <p className="text-xs text-slate-500 mt-1">Thành viên</p>
            </div>
            <div className="glass-light rounded-2xl px-6 py-4 text-center">
              <p className="text-2xl font-bold text-purple-400">500+</p>
              <p className="text-xs text-slate-500 mt-1">Bài viết</p>
            </div>
            <div className="glass-light rounded-2xl px-6 py-4 text-center">
              <p className="text-2xl font-bold text-pink-400">1K+</p>
              <p className="text-xs text-slate-500 mt-1">Tin nhắn</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/25">
              <Sparkles size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-black gradient-text">BITISMS</h2>
          </div>

          <div className="glass rounded-2xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-100">Chào mừng trở lại! 👋</h2>
              <p className="text-sm text-slate-500 mt-2">Đăng nhập để tiếp tục khám phá</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email"
                type="email"
                placeholder="email@example.com"
                icon={<Mail size={18} />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Mật khẩu"
                type="password"
                placeholder="••••••••"
                icon={<Lock size={18} />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button
                type="submit"
                loading={loading}
                className="w-full mt-2"
                size="lg"
              >
                Đăng nhập
                <ArrowRight size={18} />
              </Button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
