import React, { useState } from "react";
import {
  LayoutDashboard,
  Map,
  MapPin,
  Calendar,
  User,
  LogOut,
  Compass,
} from "lucide-react";

import NavItem from "../components/shared/NavItem";
import UserOverview from "../components/user/UserOverview";
import MyBookings from "../components/user/MyBookings";
import MyLocationProposals from "../components/user/MyLocationProposals";
import TripPlanner from "../components/user/TripPlanner";
import UserProfile from "../components/user/UserProfile";

const UserDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user] = useState(
    JSON.parse(
      localStorage.getItem("user") ||
        '{"name": "Khách hàng", "email": "user@example.com"}'
    )
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <UserOverview />;
      case "bookings":
        return <MyBookings />;
      case "locations":
        return <MyLocationProposals />;
      case "planner":
        return <TripPlanner />;
      case "profile":
        return <UserProfile user={user} />;
      default:
        return <UserOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-zinc-100">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-zinc-900" />
            <span>Travel App</span>
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Khám phá"
            active={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
          />
          <NavItem
            icon={<Calendar size={20} />}
            label="Chuyến đi của tôi"
            active={activeTab === "bookings"}
            onClick={() => setActiveTab("bookings")}
          />
          <NavItem
            icon={<Map size={20} />}
            label="Lập kế hoạch"
            active={activeTab === "planner"}
            onClick={() => setActiveTab("planner")}
          />
          <NavItem
            icon={<MapPin size={20} />}
            label="Đề xuất địa điểm"
            active={activeTab === "locations"}
            onClick={() => setActiveTab("locations")}
          />
          <NavItem
            icon={<User size={20} />}
            label="Hồ sơ cá nhân"
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          />
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-medium">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
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
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
};

export default UserDashboard;
