import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Mail, Lock, User, Hash, ArrowRight, Sparkles, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import axiosClient from "../services/axiosClient";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    identifier: "",
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const validateStep1 = () => {
    if (!form.username.trim() || !form.identifier.trim()) {
      toast.error("Vui lòng nhập tên và mã định danh.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!form.email.trim() || !form.password.trim()) {
      toast.error("Vui lòng nhập email và mật khẩu.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      toast.error("Email không hợp lệ.");
      return false;
    }
    if (form.password.length < 6) {
      toast.error("Mật khẩu ít nhất 6 ký tự.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    try {
      await axiosClient.post("/auth/register", form);
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || "Đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex gradient-mesh">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        
        <div className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl gradient-accent flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-purple-500/30 animate-pulse-glow">
            <Sparkles size={36} className="text-white" />
          </div>
          <h1 className="text-5xl font-black gradient-text mb-4">Tham gia ngay</h1>
          <p className="text-xl text-slate-400 leading-relaxed">
            Tạo tài khoản miễn phí và bắt đầu kết nối với cộng đồng
          </p>

          {/* Steps */}
          <div className="mt-12 flex flex-col gap-4 text-left max-w-xs mx-auto">
            {[
              { num: 1, text: "Thông tin cá nhân" },
              { num: 2, text: "Tài khoản & bảo mật" },
              { num: 3, text: "Hoàn tất đăng ký" },
            ].map((s) => (
              <div key={s.num} className={`flex items-center gap-3 transition-all duration-300 ${step >= s.num ? "opacity-100" : "opacity-30"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step > s.num ? "bg-emerald-500 text-white" : step === s.num ? "gradient-primary text-white" : "bg-slate-700 text-slate-400"
                }`}>
                  {step > s.num ? <CheckCircle size={16} /> : s.num}
                </div>
                <span className="text-sm text-slate-300">{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-xl gradient-accent flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/25">
              <Sparkles size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-black gradient-text">BITISMS</h2>
          </div>

          <div className="glass rounded-2xl p-8">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                {/* Step indicator */}
                <div className="flex gap-2">
                  <div className={`h-1 w-12 rounded-full transition-all duration-500 ${step >= 1 ? "gradient-primary" : "bg-slate-700"}`} />
                  <div className={`h-1 w-12 rounded-full transition-all duration-500 ${step >= 2 ? "gradient-primary" : "bg-slate-700"}`} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-100">
                {step === 1 ? "Thông tin của bạn" : "Tạo tài khoản"} ✨
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                {step === 1 ? "Cho chúng tôi biết đôi chút về bạn" : "Thiết lập email và mật khẩu"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {step === 1 ? (
                <div className="space-y-5 animate-slide-left">
                  <Input
                    label="Tên hiển thị"
                    placeholder="Nguyễn Văn A"
                    icon={<User size={18} />}
                    value={form.username}
                    onChange={update("username")}
                  />
                  <Input
                    label="Mã định danh"
                    placeholder="nguyenvana_123"
                    icon={<Hash size={18} />}
                    value={form.identifier}
                    onChange={update("identifier")}
                  />
                  <Button type="button" onClick={handleNext} className="w-full" size="lg">
                    Tiếp tục
                    <ArrowRight size={18} />
                  </Button>
                </div>
              ) : (
                <div className="space-y-5 animate-slide-right">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="email@example.com"
                    icon={<Mail size={18} />}
                    value={form.email}
                    onChange={update("email")}
                  />
                  <Input
                    label="Mật khẩu"
                    type="password"
                    placeholder="Ít nhất 6 ký tự"
                    icon={<Lock size={18} />}
                    value={form.password}
                    onChange={update("password")}
                  />
                  <div className="flex gap-3">
                    <Button type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1" size="lg">
                      Quay lại
                    </Button>
                    <Button type="submit" loading={loading} className="flex-1" size="lg">
                      Đăng ký
                    </Button>
                  </div>
                </div>
              )}
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
