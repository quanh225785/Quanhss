import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '../components/layout/MainLayout';
import DashboardOverview from '../components/agent/DashboardOverview';
import MyTours from '../components/agent/MyTours';
import AgentTourDetail from '../components/agent/AgentTourDetail';
import TripManagementPage from '../components/agent/TripManagementPage';
import LocationProposals from '../components/agent/LocationProposals';
import Reviews from '../components/agent/Reviews';
import AgentProfile from '../components/agent/AgentProfile';
import AgentChatList from '../components/agent/AgentChatList';

const AgentDashboard = ({ onLogout }) => {
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
        // Check if current pathname matches the dashboard route + nested path
        const fullPath = `/dashboard${path}`;
        const isExactMatch = location.pathname === fullPath || location.pathname === `${fullPath}/`;
        // Also check if it's the root dashboard path (for index route)
        const isRootDashboard = (path === '' || path === '/dashboard') && (location.pathname === '/dashboard' || location.pathname === '/dashboard/');
        return isExactMatch || isRootDashboard;
    };

    const isNavItemActive = (item) => {
        if (item.checkPaths) {
            return item.checkPaths.some(p => {
                if (p === '' || p === '/dashboard') {
                    return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
                }
                const fullPath = `/dashboard${p}`;
                return location.pathname === fullPath || location.pathname === `${fullPath}/`;
            });
        }
        // For dashboard path, check if we're at root dashboard
        if (item.path === '/dashboard') {
            return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
        }
        return isActive(item.path);
    };

    return (
        <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans">
            {/* Sidebar (Hidden on mobile) */}
            <aside className="w-64 bg-white border-r border-zinc-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-zinc-100">
                    <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <Map className="w-6 h-6 text-zinc-900" />
                        <span>Agent Portal</span>
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {agentNavItems.map((item, index) => {
                        // Handle navigation: dashboard item goes to /dashboard, others go to /dashboard/{path}
                        const navPath = item.path === '/dashboard' ? '/dashboard' : `/dashboard${item.path}`;
                        return (
                            <NavItem
                                key={index}
                                icon={item.icon}
                                label={item.label}
                                active={isNavItemActive(item)}
                                onClick={() => navigate(navPath)}
                            />
                        );
                    })}
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
            <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
                <header className="bg-white border-b border-zinc-200 p-4 md:hidden flex items-center justify-between">
                    <h1 className="font-bold">Agent Portal</h1>
                </header>
                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    <Routes>
                        <Route index element={<DashboardOverview />} />
                        <Route path="tours" element={<MyTours />} />
                        <Route path="tours/:id" element={<AgentTourDetail />} />
                        <Route path="tours/:id/trips" element={<TripManagementPage />} />
                        <Route path="locations" element={<LocationProposals />} />
                        <Route path="reviews" element={<Reviews />} />
                        <Route path="chat" element={<AgentChatList />} />
                        <Route path="profile" element={<AgentProfile user={user} />} />
                    </Routes>
                </div>
            </main>

            {/* Mobile Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-zinc-200 shadow-lg z-50">
                <div className="flex items-center justify-around px-1 py-2">
                    {agentNavItems.map((item, index) => {
                        // Handle navigation: dashboard item goes to /dashboard, others go to /dashboard/{path}
                        const navPath = item.path === '/dashboard' ? '/dashboard' : `/dashboard${item.path}`;
                        return (
                            <button
                                key={index}
                                onClick={() => navigate(navPath)}
                                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[56px] ${isNavItemActive(item)
                                    ? 'bg-zinc-100 text-zinc-900'
                                    : 'text-zinc-500'
                                    }`}
                            >
                                {item.icon}
                                <span className="text-[9px] font-medium">{item.shortLabel}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default AgentDashboard;
