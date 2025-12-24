import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  Lock,
  Unlock,
  Shield,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { api } from "../../utils/api";
import { useToast } from "../../context/ToastContext";
import ConfirmModal from "../shared/ConfirmModal";

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showLockModal, setShowLockModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [lockReason, setLockReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showUnlockConfirm, setShowUnlockConfirm] = useState(false);
  const [userToUnlock, setUserToUnlock] = useState(null);
  const { showToast } = useToast();

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on active tab and search term
  useEffect(() => {
    let filtered = users;

    // Filter by role
    if (activeTab === "agent") {
      filtered = filtered.filter(user =>
        user.roles.some(role => role.name === "AGENT")
      );
    } else if (activeTab === "customer") {
      filtered = filtered.filter(user =>
        user.roles.some(role => role.name === "USER")
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [users, activeTab, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/users");
      setUsers(response.data?.result || []);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải danh sách người dùng");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLockUser = (user) => {
    setSelectedUser(user);
    setLockReason("");
    setShowLockModal(true);
  };

  const handleUnlockUser = (user) => {
    setUserToUnlock(user);
    setShowUnlockConfirm(true);
  };

  const confirmUnlockUser = async () => {
    if (!userToUnlock) return;

    setActionLoading(true);
    try {
      await api.post(`/users/${userToUnlock.id}/unlock`);
      showToast({
        type: 'success',
        message: 'Thành công',
        description: 'Mở khóa tài khoản thành công!'
      });
      setShowUnlockConfirm(false);
      setUserToUnlock(null);
      fetchUsers(); // Refresh the list
    } catch (err) {
      showToast({
        type: 'error',
        message: 'Lỗi',
        description: err.response?.data?.message || "Không thể mở khóa tài khoản"
      });
      console.error("Error unlocking user:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const submitLockUser = async () => {
    if (!lockReason.trim()) {
      showToast({
        type: 'warning',
        message: 'Chú ý',
        description: 'Vui lòng nhập lý do khóa tài khoản'
      });
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/users/${selectedUser.id}/lock`, {
        lockReason: lockReason.trim()
      });
      showToast({
        type: 'success',
        message: 'Thành công',
        description: 'Khóa tài khoản thành công!'
      });
      setShowLockModal(false);
      fetchUsers(); // Refresh the list
    } catch (err) {
      showToast({
        type: 'error',
        message: 'Lỗi',
        description: err.response?.data?.message || "Không thể khóa tài khoản"
      });
      console.error("Error locking user:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const getUserRole = (user) => {
    if (user.roles?.some(role => role.name === "ADMIN")) return "ADMIN";
    if (user.roles?.some(role => role.name === "AGENT")) return "AGENT";
    if (user.roles?.some(role => role.name === "USER")) return "USER";
    return "UNKNOWN";
  };

  const getFullName = (user) => {
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    return fullName || user.username;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/70 backdrop-blur-2xl border border-white/40 p-10 rounded-[3rem] shadow-2xl shadow-black/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-primary rounded-full"></div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">
              Quản lý người dùng
            </h2>
          </div>
          <p className="text-slate-500 font-medium ml-5">
            Quản lý tài khoản khách hàng và đại lý trên toàn hệ thống.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50/50 backdrop-blur-md border border-red-100 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <span className="font-bold">{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-6 items-center bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40 shadow-xl shadow-black/5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white/50 border border-white/40 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400"
          />
        </div>
        <div className="flex p-2 bg-slate-100/50 backdrop-blur-sm rounded-2xl border border-white/40 w-full lg:w-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 lg:flex-none px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === "all"
              ? "bg-white text-primary shadow-sm"
              : "text-slate-500 hover:text-slate-900"
              }`}
          >
            Tất cả ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("agent")}
            className={`flex-1 lg:flex-none px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === "agent"
              ? "bg-white text-primary shadow-sm"
              : "text-slate-500 hover:text-slate-900"
              }`}
          >
            Agents ({users.filter(u => u.roles?.some(r => r.name === "AGENT")).length})
          </button>
          <button
            onClick={() => setActiveTab("customer")}
            className={`flex-1 lg:flex-none px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === "customer"
              ? "bg-white text-primary shadow-sm"
              : "text-slate-500 hover:text-slate-900"
              }`}
          >
            Guests ({users.filter(u => u.roles?.some(r => r.name === "USER")).length})
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white/70 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] p-16 text-center shadow-2xl shadow-black/5">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-900 font-black text-xl">Đang tải danh sách người dùng...</p>
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-white/50 border-b border-white/40">
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500">Người dùng</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500">Vai trò</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500">Trạng thái</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500">Lý do khóa</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-zinc-500">
                      Không tìm thấy người dùng nào
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="group hover:bg-white/80 transition-all border-b border-white/20 last:border-0">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-black text-lg border border-primary/10 shadow-sm transition-transform group-hover:scale-110">
                            {user.firstName?.charAt(0) || user.username?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-black text-slate-900 text-base mb-0.5">
                              {getFullName(user)}
                            </div>
                            <div className="text-slate-500 text-xs font-bold">{user.email}</div>
                            <div className="text-primary text-[10px] font-black uppercase tracking-tight">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider
                          ${getUserRole(user) === "ADMIN"
                              ? "bg-red-500/10 text-red-600 border border-red-100"
                              : getUserRole(user) === "AGENT"
                                ? "bg-purple-500/10 text-purple-600 border border-purple-100"
                                : "bg-blue-500/10 text-blue-600 border border-blue-100"
                            }`}
                        >
                          {getUserRole(user) === "AGENT" && <Shield className="w-3.5 h-3.5" />}
                          {getUserRole(user)}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        {user.isLocked ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-100">
                            <Lock className="w-3.5 h-3.5" />
                            LOCKED
                          </span>
                        ) : user.isVerified ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                            <CheckCircle className="w-3.5 h-3.5" />
                            ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-100">
                            <AlertCircle className="w-3.5 h-3.5" />
                            PENDING
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        {user.isLocked && user.lockReason ? (
                          <div className="text-xs font-bold text-slate-600 max-w-xs truncate bg-slate-100/50 px-3 py-2 rounded-xl border border-slate-200" title={user.lockReason}>
                            {user.lockReason}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-bold ml-4">-</span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          {user.isLocked ? (
                            <button
                              onClick={() => handleUnlockUser(user)}
                              disabled={actionLoading}
                              className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 p-3 rounded-2xl transition-all shadow-sm disabled:opacity-50"
                              title="Mở khóa tài khoản"
                            >
                              <Unlock className="w-5 h-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleLockUser(user)}
                              disabled={actionLoading}
                              className="bg-red-50 text-red-600 hover:bg-red-100 p-3 rounded-2xl transition-all shadow-sm disabled:opacity-50"
                              title="Khóa tài khoản"
                            >
                              <Lock className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lock User Modal */}
      {showLockModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-300">
          <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] border border-white/40 p-10 w-full max-w-lg shadow-2xl transform animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">
                  Khóa tài khoản
                </h3>
                <p className="text-sm font-bold text-slate-500 mt-1">
                  Người dùng: <span className="text-primary uppercase tracking-tight">@{selectedUser?.username}</span>
                </p>
              </div>
              <button
                onClick={() => setShowLockModal(false)}
                className="p-3 bg-white/50 border border-white/40 hover:bg-white rounded-2xl text-slate-500 transition-all shadow-sm"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-8">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-3">
                Lý do khóa tài khoản <span className="text-red-500">*</span>
              </label>
              <textarea
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                placeholder="Nhập lý do khóa tài khoản (VD: Vi phạm điều khoản, spam...)"
                className="w-full px-5 py-4 bg-white/50 border border-white/40 rounded-[1.5rem] text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400 resize-none"
                rows="4"
                disabled={actionLoading}
              />
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-2">
                Thông tin này sẽ hiển thị khi người dùng đăng nhập
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowLockModal(false)}
                disabled={actionLoading}
                className="flex-1 py-4 text-sm font-black text-slate-700 bg-white/50 border border-white/40 hover:bg-white rounded-2xl transition-all shadow-sm shadow-black/5"
              >
                Hủy bỏ
              </button>
              <button
                onClick={submitLockUser}
                disabled={actionLoading || !lockReason.trim()}
                className="flex-1 py-4 text-sm font-black text-white bg-red-600 rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    <span>Đang xử lý</span>
                  </div>
                ) : "Khóa tài khoản"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Unlock User Confirmation */}
      <ConfirmModal
        isOpen={showUnlockConfirm}
        onClose={() => {
          setShowUnlockConfirm(false);
          setUserToUnlock(null);
        }}
        onConfirm={confirmUnlockUser}
        title="Xác nhận mở khóa"
        message={`Bạn có chắc muốn mở khóa tài khoản của ${userToUnlock?.username}?`}
        confirmText="Mở khóa"
        cancelText="Hủy"
        variant="success"
        isLoading={actionLoading}
      />
    </div>
  );
};

export default UserManagement;
