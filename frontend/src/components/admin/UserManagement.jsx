import React, { useState } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  Lock,
  Unlock,
  Shield,
} from "lucide-react";

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("all");

  const users = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "a@example.com",
      role: "CUSTOMER",
      status: "ACTIVE",
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "b@agent.com",
      role: "AGENT",
      status: "PENDING",
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "c@example.com",
      role: "CUSTOMER",
      status: "LOCKED",
    },
  ];

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
        <button className="bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800">
          Thêm người dùng
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-lg border border-zinc-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email..."
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
            Tất cả
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
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-zinc-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-zinc-900">{user.name}</div>
                    <div className="text-zinc-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${
                                          user.role === "AGENT"
                                            ? "bg-purple-100 text-purple-700"
                                            : "bg-blue-100 text-blue-700"
                                        }`}
                  >
                    {user.role === "AGENT" && <Shield className="w-3 h-3" />}
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${
                                          user.status === "ACTIVE"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : user.status === "PENDING"
                                            ? "bg-amber-100 text-amber-700"
                                            : "bg-red-100 text-red-700"
                                        }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-zinc-400 hover:text-zinc-900">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
