import React, { useState } from "react";
import { Loader2, Check, AlertCircle, Shield, Lock, Upload, LogOut } from "lucide-react";
import { api } from "../../utils/api";
import ChangePasswordModal from "../shared/ChangePasswordModal";

const AdminProfile = ({ user, onLogout }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    dob: user.dob || "",
    avatar: user.avatar || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Chỉ chấp nhận file ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File phải nhỏ hơn 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    setError(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'avatars');

      const response = await api.post('/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.code === 1000) {
        const avatarUrl = response.data.result;
        setFormData((prev) => ({ ...prev, avatar: avatarUrl }));

        const updateResponse = await api.put(`/users/${user.id}`, {
          ...formData,
          avatar: avatarUrl,
          roles: user.roles?.map((r) => r.name) || ["ADMIN"],
        });

        if (updateResponse.data.code === 1000) {
          const updatedUser = { ...user, ...updateResponse.data.result };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        }
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      setError(err.response?.data?.message || 'Không thể upload ảnh đại diện');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      console.log("[AdminProfile] Updating user:", user.id, formData);
      const response = await api.put(`/users/${user.id}`, {
        ...formData,
        roles: user.roles?.map((r) => r.name) || ["ADMIN"],
      });

      console.log("[AdminProfile] Update successful:", response.data);

      if (response.data.code === 1000) {
        // Update localStorage
        const updatedUser = { ...user, ...response.data.result };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("[AdminProfile] Update error:", err);
      setError(
        err.response?.data?.message ||
        "Không thể cập nhật thông tin. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="bg-white/70 backdrop-blur-2xl border border-white/40 p-10 rounded-[3rem] shadow-2xl shadow-black/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-primary rounded-full"></div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">
              Hồ sơ Admin
            </h2>
          </div>
          <p className="text-slate-500 font-medium ml-5">Quản lý thông tin tài khoản và bảo mật hệ thống.</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-10 space-y-10 shadow-xl shadow-black/5"
      >
        <div className="flex flex-col md:flex-row items-center gap-10 bg-white/50 p-8 rounded-[2rem] border border-white/40">
          <div className="relative group">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <div className="relative">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt="Avatar"
                  className="w-32 h-32 rounded-[2rem] object-cover border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-32 h-32 bg-slate-200 rounded-[2rem] flex items-center justify-center text-4xl font-black text-slate-400 border-4 border-white shadow-xl">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
              )}
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-[2rem] flex items-center justify-center">
                  <Loader2 className="animate-spin text-white" size={32} />
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute -bottom-2 -right-2 p-3 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
              >
                <Upload size={16} />
              </button>
            </div>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight mb-1">
              {user.firstName ? `${user.firstName} ${user.lastName}` : user.username}
            </h3>
            <p className="text-slate-500 font-bold mb-4">@{user.username}</p>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/10">
              <Shield size={12} />
              Hệ thống Admin
            </div>
          </div>
        </div>

        {success && (
          <div className="bg-emerald-50/50 backdrop-blur-md border border-emerald-100 rounded-[1.5rem] p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Check size={20} />
            </div>
            <p className="text-sm font-black text-emerald-800 uppercase tracking-tight">
              Cập nhật thông tin thành công!
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50/50 backdrop-blur-md border border-red-100 rounded-[1.5rem] p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600">
              <AlertCircle size={20} />
            </div>
            <p className="text-sm font-black text-red-800 uppercase tracking-tight">
              {error}
            </p>
          </div>
        )}

        <div className="grid gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Họ</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Nhập họ của bạn"
                className="w-full px-6 py-4 bg-white/50 border border-white/40 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Tên</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Nhập tên của bạn"
                className="w-full px-6 py-4 bg-white/50 border border-white/40 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Ngày sinh</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="w-full px-6 py-4 bg-white/50 border border-white/40 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Email <span className="text-[10px] text-slate-400 font-medium">(Bắt buộc)</span></label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-6 py-4 bg-white/30 border border-white/40 rounded-2xl text-sm font-bold text-slate-500 cursor-not-allowed"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Username</label>
              <input
                type="text"
                value={user.username}
                disabled
                className="w-full px-6 py-4 bg-white/30 border border-white/40 rounded-2xl text-sm font-bold text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/40 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-10 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Đang lưu...</span>
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </button>
        </div>
      </form>

      {/* Security Section */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-10 shadow-xl shadow-black/5">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-6 bg-primary rounded-full"></div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Cài đặt bảo mật</h3>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/50 p-8 rounded-2xl border border-white/40">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-100">
              <Lock size={24} />
            </div>
            <div>
              <p className="text-base font-black text-slate-900 tracking-tight">Khóa bảo mật</p>
              <p className="text-sm font-medium text-slate-500">Thường xuyên thay đổi mật khẩu để bảo vệ tài khoản</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="w-full md:w-auto px-8 py-4 bg-white/50 border border-white/40 hover:bg-white text-slate-900 font-black rounded-2xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
          >
            <Lock size={18} />
            Đổi mật khẩu
          </button>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        userId={user.id}
      />

      {/* Logout Section */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-10 shadow-xl shadow-red-900/5">
        <div className="bg-red-50/50 p-2 rounded-[2rem] border border-red-100/50">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-3 px-8 py-5 text-red-600 hover:text-white bg-transparent hover:bg-red-600 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs transition-all duration-300 group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Đăng xuất hệ thống</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
