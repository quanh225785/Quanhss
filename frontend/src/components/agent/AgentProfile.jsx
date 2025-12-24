import React, { useState } from "react";
import { Loader2, Check, AlertCircle, Lock, Upload, LogOut } from "lucide-react";
import { api } from "../../utils/api";
import ChangePasswordModal from "../shared/ChangePasswordModal";

const AgentProfile = ({ user, onLogout }) => {
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Chỉ chấp nhận file ảnh');
      return;
    }

    // Validate file size (max 5MB)
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

        // Update user immediately
        const updateResponse = await api.put(`/users/${user.id}`, {
          ...formData,
          avatar: avatarUrl,
          roles: user.roles?.map((r) => r.name) || ["AGENT"],
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
      const response = await api.put(`/users/${user.id}`, {
        ...formData,
        roles: user.roles?.map((r) => r.name) || ["AGENT"],
      });

      if (response.data.code === 1000) {
        // Update localStorage
        const updatedUser = { ...user, ...response.data.result };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("[AgentProfile] Update error:", err);
      setError(
        err.response?.data?.message ||
        "Không thể cập nhật thông tin. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold tracking-tight mb-6">Hồ sơ Agent</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 space-y-8 shadow-xl shadow-black/5"
      >
        <div className="flex items-center gap-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
          <div className="relative group">
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-zinc-200"
              />
            ) : (
              <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center text-2xl font-bold text-zinc-400">
                {user.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
            )}
            {isUploadingAvatar && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <Loader2 className="animate-spin text-white" size={24} />
              </div>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="text-sm font-medium text-zinc-900 border border-zinc-300 px-3 py-1.5 rounded-md hover:bg-zinc-50 disabled:opacity-50 flex items-center gap-2"
            >
              <Upload size={14} />
              {isUploadingAvatar ? 'Đang upload...' : 'Thay đổi ảnh đại diện'}
            </button>
            <p className="text-xs text-zinc-500 mt-1">PNG, JPG tối đa 5MB</p>
          </div>
        </div>

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2">
            <Check className="text-emerald-600" size={18} />
            <p className="text-sm text-emerald-800">
              Cập nhật thông tin thành công!
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="text-red-600" size={18} />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-zinc-700">Họ</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Nhập họ"
                className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-zinc-700">Tên</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Nhập tên"
                className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-700">
              Ngày sinh
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-700">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-zinc-50 text-zinc-500"
            />
            <p className="text-xs text-zinc-500">Email không thể thay đổi</p>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-white px-8 py-3 rounded-xl text-base font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Đang lưu...
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </button>
        </div>
      </form>

      {/* Security Section */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2rem] p-8 mt-6 shadow-xl shadow-black/5">
        <h3 className="text-lg font-bold mb-6">Bảo mật tài khoản</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600">
              <Lock size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900">Mật khẩu</p>
              <p className="text-xs text-zinc-500 font-medium">Đổi mật khẩu để bảo mật tài khoản</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition-all shadow-sm"
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

      {/* Logout Section */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2rem] p-8 mt-6 shadow-xl shadow-black/5">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 text-red-600 bg-red-500/10 hover:bg-red-500/20 rounded-2xl font-bold transition-all duration-300 group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          Đăng xuất tài khoản
        </button>
      </div>
    </div>
  );
};

export default AgentProfile;
