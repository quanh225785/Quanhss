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
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLockModal, setShowLockModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [lockReason, setLockReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, activeTab, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users");
      const usersData = response.data?.result || [];
      setUsers(usersData);
      setError("");
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by tab
    if (activeTab === "agent") {
      filtered = filtered.filter((user) =>
        user.roles?.some((role) => role.name === "AGENT")
      );
    } else if (activeTab === "customer") {
      filtered = filtered.filter(
        (user) => !user.roles?.some((role) => role.name === "AGENT")
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `${user.firstName || ""} ${user.lastName || ""}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleLockClick = (user) => {
    setSelectedUser(user);
    setLockReason("");
    setShowLockModal(true);
  };

  const handleUnlockClick = async (user) => {
    if (!window.confirm(`Bạn có chắc muốn mở khóa tài khoản của ${user.username}?`)) {
      return;
    }

    try {
      setActionLoading(true);
      await api.post(`/users/${user.id}/unlock`);
      await fetchUsers();
      alert("Đã mở khóa tài khoản thành công!");
    } catch (err) {
      console.error("Error unlocking user:", err);
      alert("Không thể mở khóa tài khoản: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleLockSubmit = async (e) => {
    e.preventDefault();
    if (!lockReason.trim()) {
      alert("Vui lòng nhập lý do khóa tài khoản");
      return;
    }

    try {
      setActionLoading(true);
      await api.post(`/users/${selectedUser.id}/lock`, { lockReason: lockReason.trim() });
      await fetchUsers();
      setShowLockModal(false);
      setSelectedUser(null);
      setLockReason("");
      alert("Đã khóa tài khoản thành công!");
    } catch (err) {
      console.error("Error locking user:", err);
      alert("Không thể khóa tài khoản: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const getUserStatus = (user) => {
    if (user.isLocked) return "LOCKED";
    if (!user.isVerified) return "PENDING";
    return "ACTIVE";
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-700";
      case "PENDING":
        return "bg-amber-100 text-amber-700";
      case "LOCKED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getUserRole = (user) => {
    const hasAgentRole = user.roles?.some((role) => role.name === "AGENT");
    return hasAgentRole ? "AGENT" : "CUSTOMER";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto"></div>
          <p className="mt-4 text-zinc-500">Đang tải...</p>
        </div>
      </div>
    );
  }

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
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
            Agents
          </button>
          <button
            onClick={() => setActiveTab("customer")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === "customer"
                ? "bg-zinc-100 text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            Khách hàng
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 text-zinc-500 font-medium border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4">Người dùng</th>
              <th className="px-6 py-4">Vai trò</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-zinc-500">
                  Không tìm thấy người dùng
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const status = getUserStatus(user);
                const role = getUserRole(user);
                return (
                  <tr key={user.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-zinc-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-zinc-500 text-xs">
                          {user.username} • {user.email}
                        </div>
                        {user.isLocked && user.lockReason && (
                          <div className="text-xs text-red-600 mt-1">
                            🔒 {user.lockReason}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          role === "AGENT"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {role === "AGENT" && <Shield className="w-3 h-3" />}
                        {role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {user.isLocked ? (
                          <button
                            onClick={() => handleUnlockClick(user)}
                            disabled={actionLoading}
                            className="text-emerald-600 hover:text-emerald-700 p-2 hover:bg-emerald-50 rounded disabled:opacity-50"
                            title="Mở khóa tài khoản"
                          >
                            <Unlock className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleLockClick(user)}
                            disabled={actionLoading}
                            className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded disabled:opacity-50"
                            title="Khóa tài khoản"
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Lock Modal */}
      {showLockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200">
              <h3 className="text-lg font-semibold text-zinc-900">
                Khóa tài khoản
              </h3>
              <button
                onClick={() => setShowLockModal(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleLockSubmit}>
              <div className="p-6">
                <p className="text-sm text-zinc-600 mb-4">
                  Bạn đang khóa tài khoản: <strong>{selectedUser?.username}</strong>
                </p>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Lý do khóa tài khoản <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                  placeholder="Nhập lý do khóa tài khoản..."
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
                  rows="4"
                  required
                  disabled={actionLoading}
                />
              </div>
              <div className="flex gap-3 p-6 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setShowLockModal(false)}
                  className="flex-1 px-4 py-2 border border-zinc-300 text-zinc-700 rounded-md text-sm font-medium hover:bg-zinc-50"
                  disabled={actionLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Đang xử lý..." : "Khóa tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
