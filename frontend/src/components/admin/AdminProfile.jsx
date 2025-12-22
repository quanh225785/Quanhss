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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Hồ sơ Admin</h2>
        <p className="text-zinc-500">
          Quản lý thông tin tài khoản quản trị viên
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-zinc-200 rounded-xl p-6 space-y-6"
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
                className="w-20 h-20 rounded-full object-cover border-2 border-zinc-900"
              />
            ) : (
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                <Shield size={32} />
              </div>
            )}
            {isUploadingAvatar && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <Loader2 className="animate-spin text-white" size={24} />
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute bottom-0 right-0 p-1.5 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              <Upload size={12} />
            </button>
          </div>
          <div>
            <h3 className="text-lg font-medium">{user.name || "Admin"}</h3>
            <p className="text-zinc-500 text-sm">{user.email}</p>
            <div className="mt-1 px-2 py-0.5 bg-zinc-900 text-white text-xs font-medium rounded inline-block">
              ADMIN
            </div>
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

          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-700">
              Username
            </label>
            <input
              type="text"
              value={user.username}
              disabled
              className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-zinc-50 text-zinc-500"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Đang lưu...
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </button>
        </div>
      </form>

      {/* Security Section */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Bảo mật</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-900">Mật khẩu</p>
            <p className="text-xs text-zinc-500">Đổi mật khẩu của bạn</p>
          </div>
          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-zinc-300 rounded-md text-sm font-medium hover:bg-zinc-50"
          >
            <Lock size={16} />
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
      <div className="bg-white border border-zinc-200 rounded-xl p-6">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-all duration-200 group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          Đăng xuất tài khoản
        </button>
      </div>
    </div>
  );
};

export default AdminProfile;
