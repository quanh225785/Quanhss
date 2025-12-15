import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Map,
    MapPin,
    LogOut,
    User,
    MessageSquare,
} from 'lucide-react';

import NavItem from '../components/shared/NavItem';
import DashboardOverview from '../components/agent/DashboardOverview';
import MyTours from '../components/agent/MyTours';
import LocationProposals from '../components/agent/LocationProposals';
import Reviews from '../components/agent/Reviews';
import AgentProfile from '../components/agent/AgentProfile';

const AgentDashboard = ({ onLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user] = useState(JSON.parse(localStorage.getItem('user') || '{"firstName": "Agent", "email": "agent@example.com"}'));

    const getFullName = () => {
        if (user.firstName && user.lastName) {
            return `${user.firstName} ${user.lastName}`;
        }
        return user.firstName || user.lastName || 'Agent Name';
    };

    const getInitials = () => {
        if (user.firstName) {
            return user.firstName.charAt(0).toUpperCase();
        }
        return 'A';
    };

    const isActive = (path) => {
        return location.pathname === `/agent${path}` || location.pathname === `/agent${path}/`;
    };

    return (
        <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-zinc-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-zinc-100">
                    <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <Map className="w-6 h-6 text-zinc-900" />
                        <span>Agent Portal</span>
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <NavItem
                        icon={<LayoutDashboard size={20} />}
                        label="Tổng quan"
                        active={isActive("") || isActive("/dashboard")}
                        onClick={() => navigate('/agent/dashboard')}
                    />
                    <NavItem
                        icon={<Map size={20} />}
                        label="Quản lý Tour"
                        active={isActive('/tours')}
                        onClick={() => navigate('/agent/tours')}
                    />
                    <NavItem
                        icon={<MapPin size={20} />}
                        label="Đề xuất địa điểm"
                        active={isActive('/locations')}
                        onClick={() => navigate('/agent/locations')}
                    />
                    <NavItem
                        icon={<MessageSquare size={20} />}
                        label="Đánh giá & Phản hồi"
                        active={isActive('/reviews')}
                        onClick={() => navigate('/agent/reviews')}
                    />
                    <NavItem
                        icon={<User size={20} />}
                        label="Hồ sơ Agent"
                        active={isActive('/profile')}
                        onClick={() => navigate('/agent/profile')}
                    />
                </nav>

                <div className="p-4 border-t border-zinc-100">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-medium">
                            {getInitials()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{getFullName()}</p>
                            <p className="text-xs text-zinc-500 truncate">{user.email || 'agent@example.com'}</p>
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
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white border-b border-zinc-200 p-4 md:hidden flex items-center justify-between">
                    <h1 className="font-bold">Agent Portal</h1>
                    <button onClick={onLogout}><LogOut size={20} /></button>
                </header>
                <div className="p-8 max-w-7xl mx-auto">
                    <Routes>
                        <Route path="/" element={<Navigate to="/agent/dashboard" replace />} />
                        <Route path="/dashboard" element={<DashboardOverview />} />
                        <Route path="/tours" element={<MyTours />} />
                        <Route path="/locations" element={<LocationProposals />} />
                        <Route path="/reviews" element={<Reviews />} />
                        <Route path="/profile" element={<AgentProfile user={user} />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default AgentDashboard;
