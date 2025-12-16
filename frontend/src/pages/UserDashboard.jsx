import React, { useState } from "react";
import { LogOut } from "lucide-react";
import { Link, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

import NavItem from "../components/shared/NavItem";
import UserOverview from "../components/user/UserOverview";
import MyBookings from "../components/user/MyBookings";
import MyLocationProposals from "../components/user/MyLocationProposals";
import TripPlanner from "../components/user/TripPlanner";
import UserProfile from "../components/user/UserProfile";
import UserChat from "../components/user/UserChat";
import { userNavItems } from "../utils/navConfig";

const UserDashboard = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user] = useState(
    JSON.parse(
      localStorage.getItem("user") ||
      '{"firstName": "Khách", "lastName": "hàng", "email": "user@example.com"}'
    )
  );

  const getFullName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.firstName || user.lastName || "Khách hàng";
  };

  const getInitials = () => {
    if (user.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    return "U";
  };

  const isActive = (path) => {
    return location.pathname === `/user${path}` || location.pathname === `/user${path}/`;
  };

  const isNavItemActive = (item) => {
    if (item.checkPaths) {
      return item.checkPaths.some(p => isActive(p));
    }
    return isActive(item.path);
  };

  return (
    <div className="flex h-screen bg-surface font-sans overflow-hidden relative">
      {/* Ambient Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/5 blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Sidebar - Glassmorphism */}
      <aside className="w-72 bg-white/70 backdrop-blur-xl border-r border-white/40 hidden md:flex flex-col shadow-2xl shadow-slate-200/50 z-20 m-4 rounded-[2rem]">
        <div className="p-8 pb-4">
          <Link to="/" className="text-2xl font-display font-bold tracking-tighter flex items-center gap-2 text-slate-900 hover:text-primary transition-colors">
            Quanh.
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          {userNavItems.map((item, index) => (
            <NavItem
              key={index}
              icon={item.icon}
              label={item.label}
              active={isNavItemActive(item)}
              onClick={() => navigate(`/user${item.path}`)}
            />
          ))}
        </nav>

        <div className="p-4 m-4 bg-white/50 rounded-2xl border border-white/50">
          <div className="flex items-center gap-3 mb-4 rounded-xl p-2 transition-colors hover:bg-white/60 cursor-default">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-sm font-bold shadow-md">
              {getInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{getFullName()}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto h-full rounded-[2.5rem] bg-white/40 backdrop-blur-sm border border-white/40 shadow-sm overflow-y-auto p-8 no-scrollbar">
          <Routes>
            <Route path="/" element={<Navigate to="/user/dashboard" replace />} />
            <Route path="/dashboard" element={<UserOverview />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/locations" element={<MyLocationProposals />} />
            <Route path="/planner" element={<TripPlanner />} />
            <Route path="/profile" element={<UserProfile user={user} onLogout={onLogout} />} />
            <Route path="/chat" element={<UserChat />} />
          </Routes>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white/80 backdrop-blur-xl border-t border-white/40 shadow-lg shadow-slate-200/50 z-50">
        <div className="flex items-center justify-around px-1 py-2">
          {userNavItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(`/user${item.path}`)}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[56px] ${isNavItemActive(item)
                ? 'bg-primary/10 text-primary'
                : 'text-slate-500'
                }`}
            >
              {item.icon}
              <span className="text-[9px] font-medium">{item.shortLabel}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default UserDashboard;
