import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  Lock,
  Unlock,
  Shield,
  X,
} from "lucide-react";
import { api } from "../../utils/api";

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

  const handleUnlockUser = async (user) => {
    if (!confirm(`Bạn có chắc muốn mở khóa tài khoản của ${user.username}?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/users/${user.id}/unlock`);
      alert("Mở khóa tài khoản thành công!");
      fetchUsers(); // Refresh the list
    } catch (err) {
      alert(err.response?.data?.message || "Không thể mở khóa tài khoản");
      console.error("Error unlocking user:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const submitLockUser = async () => {
    if (!lockReason.trim()) {
      alert("Vui lòng nhập lý do khóa tài khoản");
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/users/${selectedUser.id}/lock`, {
        lockReason: lockReason.trim()
      });
      alert("Khóa tài khoản thành công!");
      setShowLockModal(false);
      fetchUsers(); // Refresh the list
    } catch (err) {
      alert(err.response?.data?.message || "Không thể khóa tài khoản");
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Quản lý người dùng
          </h2>
          <p className="text-zinc-500">
            Quản lý tài khoản khách hàng và đại lý.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-lg border border-zinc-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === "all"
                ? "bg-zinc-100 text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            Tất cả ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("agent")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === "agent"
                ? "bg-zinc-100 text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            Agents ({users.filter(u => u.roles?.some(r => r.name === "AGENT")).length})
          </button>
          <button
            onClick={() => setActiveTab("customer")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === "customer"
                ? "bg-zinc-100 text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            Khách hàng ({users.filter(u => u.roles?.some(r => r.name === "USER")).length})
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center">
          <p className="text-zinc-500">Đang tải...</p>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 text-zinc-500 font-medium border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Lý do khóa</th>
                <th className="px-6 py-4 text-right">Hành động</th>
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
                  <tr key={user.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-zinc-900">
                          {getFullName(user)}
                        </div>
                        <div className="text-zinc-500 text-xs">{user.email}</div>
                        <div className="text-zinc-400 text-xs">@{user.username}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${
                            getUserRole(user) === "ADMIN"
                              ? "bg-red-100 text-red-700"
                              : getUserRole(user) === "AGENT"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                      >
                        {getUserRole(user) === "AGENT" && <Shield className="w-3 h-3" />}
                        {getUserRole(user)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isLocked ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 inline-flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          LOCKED
                        </span>
                      ) : user.isVerified ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          PENDING
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.isLocked && user.lockReason ? (
                        <div className="text-xs text-zinc-600 max-w-xs truncate" title={user.lockReason}>
                          {user.lockReason}
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {user.isLocked ? (
                          <button
                            onClick={() => handleUnlockUser(user)}
                            disabled={actionLoading}
                            className="text-emerald-600 hover:text-emerald-700 p-2 hover:bg-emerald-50 rounded-md transition-colors disabled:opacity-50"
                            title="Mở khóa tài khoản"
                          >
                            <Unlock className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleLockUser(user)}
                            disabled={actionLoading}
                            className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                            title="Khóa tài khoản"
                          >
                            <Lock className="w-4 h-4" />
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
      )}

      {/* Lock User Modal */}
      {showLockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">
                  Khóa tài khoản
                </h3>
                <p className="text-sm text-zinc-500 mt-1">
                  Người dùng: <span className="font-medium">{selectedUser?.username}</span>
                </p>
              </div>
              <button
                onClick={() => setShowLockModal(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Lý do khóa tài khoản <span className="text-red-500">*</span>
              </label>
              <textarea
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                placeholder="Nhập lý do khóa tài khoản..."
                className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
                rows="4"
                disabled={actionLoading}
              />
              <p className="text-xs text-zinc-500 mt-1">
                Lý do này sẽ được hiển thị cho người dùng khi đăng nhập
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLockModal(false)}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={submitLockUser}
                disabled={actionLoading || !lockReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? "Đang xử lý..." : "Khóa tài khoản"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
