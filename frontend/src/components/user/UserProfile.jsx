import React, { useState } from "react";
import {
  User,
  Mail,
  Camera,
  Loader2,
  Check,
  AlertCircle,
  Lock,
} from "lucide-react";
import { api } from "../../utils/api";
import ChangePasswordModal from "../shared/ChangePasswordModal";

const UserProfile = ({ user }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    dob: user.dob || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      console.log("[UserProfile] Updating user:", user.id, formData);
      const response = await api.put(`/users/${user.id}`, {
        ...formData,
        roles: user.roles?.map((r) => r.name) || ["USER"],
      });

      console.log("[UserProfile] Update successful:", response.data);

      if (response.data.code === 1000) {
        // Update localStorage
        const updatedUser = { ...user, ...response.data.result };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("[UserProfile] Update error:", err);
      setError(
        err.response?.data?.message ||
        "Không thể cập nhật thông tin. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Hồ sơ cá nhân</h2>
        <p className="text-slate-500 mt-2">Quản lý thông tin cá nhân và cài đặt bảo mật.</p>
      </div>

      <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/60 shadow-xl">
        <div className="flex flex-col items-center mb-10">
          <div className="relative group cursor-pointer">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border-4 border-white shadow-lg flex items-center justify-center text-4xl font-bold text-slate-400 mb-2 overflow-hidden">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <button className="absolute bottom-2 right-2 p-2.5 bg-slate-900 text-white rounded-full hover:bg-primary transition-colors shadow-lg group-hover:scale-110">
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-4">{user.name}</h3>
          <p className="text-slate-500 font-medium">{user.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 animate-fade-in-up">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Check size={16} strokeWidth={3} />
              </div>
              <div>
                <h4 className="font-bold text-emerald-800 text-sm">Thành công</h4>
                <p className="text-sm text-emerald-700">Thông tin đã được cập nhật.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 animate-fade-in-up">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <AlertCircle size={16} strokeWidth={3} />
              </div>
              <div>
                <h4 className="font-bold text-red-800 text-sm">Lỗi</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ml-1">
                Họ
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors w-5 h-5" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Nhập họ"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ml-1">
                Tên
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors w-5 h-5" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Nhập tên"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 font-medium"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 ml-1">
              Ngày sinh
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 ml-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-slate-400 ml-1 font-medium">
              * Email không thể thay đổi
            </p>
          </div>

          <div className="pt-6 flex justify-end border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-primary transition-all shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Security Section */}
      <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900">
              <Lock size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Mật khẩu & Bảo mật</h3>
              <p className="text-sm text-slate-500">Quản lý mật khẩu và bảo mật tài khoản</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="px-5 py-2.5 border border-slate-200 bg-white rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            Đổi mật khẩu
          </button>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        userId={user.id}
      />
    </div>
  );
};

export default UserProfile;
