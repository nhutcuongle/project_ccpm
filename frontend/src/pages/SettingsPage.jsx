import { useState } from "react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Lock, Shield, Eye, KeyRound } from "lucide-react";
import { toast } from "react-hot-toast";
import axiosClient from "../services/axiosClient";

export default function SettingsPage() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!form.currentPassword || !form.newPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error("Mật khẩu mới ít nhất 6 ký tự");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Xác nhận mật khẩu không khớp");
      return;
    }

    setLoading(true);
    try {
      await axiosClient.put("/user/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Đổi mật khẩu thành công!");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Cài đặt</h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý bảo mật tài khoản</p>
      </div>

      {/* Change Password */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <KeyRound size={20} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-200">Đổi mật khẩu</h2>
            <p className="text-xs text-slate-500">Cập nhật mật khẩu để bảo vệ tài khoản</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label="Mật khẩu hiện tại"
            type="password"
            icon={<Lock size={18} />}
            placeholder="••••••••"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
          />
          <Input
            label="Mật khẩu mới"
            type="password"
            icon={<Shield size={18} />}
            placeholder="Ít nhất 6 ký tự"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          />
          <Input
            label="Xác nhận mật khẩu mới"
            type="password"
            icon={<Eye size={18} />}
            placeholder="Nhập lại mật khẩu mới"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />

          {/* Password strength hints */}
          {form.newPassword && (
            <div className="space-y-1.5 animate-fade-in">
              {[
                { check: form.newPassword.length >= 6, text: "Ít nhất 6 ký tự" },
                { check: /[A-Z]/.test(form.newPassword), text: "Có chữ hoa" },
                { check: /[0-9]/.test(form.newPassword), text: "Có số" },
              ].map((hint, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className={`w-1.5 h-1.5 rounded-full ${hint.check ? "bg-emerald-400" : "bg-slate-600"}`} />
                  <span className={hint.check ? "text-emerald-400" : "text-slate-500"}>{hint.text}</span>
                </div>
              ))}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full sm:w-auto" size="lg">
            Cập nhật mật khẩu
          </Button>
        </form>
      </Card>
    </div>
  );
}
