import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Map,
  MapPin,
  Calendar,
  FileText,
  LogOut,
  Shield,
  User,
} from "lucide-react";

import NavItem from "../components/shared/NavItem";
import AdminOverview from "../components/admin/AdminOverview";
import UserManagement from "../components/admin/UserManagement";
import TourManagement from "../components/admin/TourManagement";
import LocationManagement from "../components/admin/LocationManagement";
import BookingManagement from "../components/admin/BookingManagement";
import ContentManagement from "../components/admin/ContentManagement";
import AdminProfile from "../components/admin/AdminProfile";

const AdminDashboard = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user] = useState(
    JSON.parse(
      localStorage.getItem("user") ||
      '{"firstName": "Admin", "lastName": "User", "email": "admin@example.com"}'
    )
  );

  const getFullName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.firstName || user.lastName || "Admin User";
  };

  const getInitials = () => {
    if (user.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    return "A";
  };

  const isActive = (path) => {
    return location.pathname === `/admin${path}` || location.pathname === `/admin${path}/`;
  };

  // Navigation items for mobile bottom bar
  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: "Tổng quan", shortLabel: "Tổng quan", path: "/dashboard", checkPaths: ["", "/dashboard"] },
    { icon: <Users size={20} />, label: "Người dùng", shortLabel: "Users", path: "/users" },
    { icon: <Map size={20} />, label: "Quản lý Tour", shortLabel: "Tour", path: "/tours" },
    { icon: <MapPin size={20} />, label: "Địa điểm", shortLabel: "Địa điểm", path: "/locations" },
    { icon: <Calendar size={20} />, label: "Đơn đặt tour", shortLabel: "Booking", path: "/bookings" },
    { icon: <User size={20} />, label: "Hồ sơ", shortLabel: "Hồ sơ", path: "/profile" },
  ];

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans">
      {/* Sidebar (Hidden on mobile) */}
      <aside className="w-64 bg-white border-r border-zinc-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-zinc-100">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-zinc-900" />
            <span>Admin Portal</span>
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Tổng quan"
            active={isActive("") || isActive("/dashboard")}
            onClick={() => navigate("/admin/dashboard")}
          />
          <NavItem
            icon={<Users size={20} />}
            label="Người dùng"
            active={isActive("/users")}
            onClick={() => navigate("/admin/users")}
          />
          <NavItem
            icon={<Map size={20} />}
            label="Quản lý Tour"
            active={isActive("/tours")}
            onClick={() => navigate("/admin/tours")}
          />
          <NavItem
            icon={<MapPin size={20} />}
            label="Địa điểm"
            active={isActive("/locations")}
            onClick={() => navigate("/admin/locations")}
          />
          <NavItem
            icon={<Calendar size={20} />}
            label="Đơn đặt tour"
            active={isActive("/bookings")}
            onClick={() => navigate("/admin/bookings")}
          />
          <NavItem
            icon={<FileText size={20} />}
            label="Nội dung"
            active={isActive("/content")}
            onClick={() => navigate("/admin/content")}
          />
          <NavItem
            icon={<User size={20} />}
            label="Hồ sơ"
            active={isActive("/profile")}
            onClick={() => navigate("/admin/profile")}
          />
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-medium">
              {getInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{getFullName()}</p>
              <p className="text-xs text-zinc-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
        {/* Mobile Header */}
        <header className="bg-white border-b border-zinc-200 p-4 md:hidden flex items-center justify-between mb-4 -mx-4 -mt-4">
          <h1 className="font-bold flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Admin Portal
          </h1>
        </header>
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/dashboard" element={<AdminOverview />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/tours" element={<TourManagement />} />
            <Route path="/locations" element={<LocationManagement />} />
            <Route path="/bookings" element={<BookingManagement />} />
            <Route path="/content" element={<ContentManagement />} />
            <Route path="/profile" element={<AdminProfile user={user} />} />
          </Routes>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-zinc-200 shadow-lg z-50">
        <div className="flex items-center justify-around px-1 py-2">
          {navItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(`/admin${item.path}`)}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[48px] ${item.checkPaths ? item.checkPaths.some(p => isActive(p)) : isActive(item.path)
                  ? 'bg-zinc-100 text-zinc-900'
                  : 'text-zinc-500'
                }`}
            >
              {item.icon}
              <span className="text-[8px] font-medium">{item.shortLabel}</span>
            </button>
          ))}
          <button
            onClick={onLogout}
            className="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[48px] text-red-500"
          >
            <LogOut size={20} />
            <span className="text-[8px] font-medium">Thoát</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default AdminDashboard;
