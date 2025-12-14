import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Map,
    MapPin,
    Calendar,
    User,
    LogOut,
    Home,
} from 'lucide-react';
import NavItem from '../shared/NavItem';

const MainLayout = ({ children, onLogout }) => {
    const navigate = useNavigate();
    const [user] = useState(
        JSON.parse(
            localStorage.getItem('user') ||
            '{"name": "Khách hàng", "email": "user@example.com"}'
        )
    );

    const userRole = user?.roles?.[0]?.name || user?.role;

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        }
        navigate('/login');
    };

    // Navigation items based on role
    const getNavItems = () => {
        if (userRole === 'ADMIN') {
            return [
                { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
                { icon: <User size={20} />, label: 'Quản lý người dùng', path: '/dashboard' },
                { icon: <MapPin size={20} />, label: 'Quản lý địa điểm', path: '/dashboard' },
                { icon: <Map size={20} />, label: 'Quản lý tour', path: '/dashboard' },
            ];
        } else if (userRole === 'AGENT') {
            return [
                { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
                { icon: <Map size={20} />, label: 'Tour của tôi', path: '/dashboard' },
                { icon: <MapPin size={20} />, label: 'Địa điểm đề xuất', path: '/dashboard' },
            ];
        } else {
            return [
                { icon: <LayoutDashboard size={20} />, label: 'Khám phá', path: '/dashboard' },
                { icon: <Calendar size={20} />, label: 'Chuyến đi của tôi', path: '/dashboard' },
                { icon: <Map size={20} />, label: 'Lập kế hoạch', path: '/dashboard' },
                { icon: <MapPin size={20} />, label: 'Đề xuất địa điểm', path: '/dashboard' },
                { icon: <User size={20} />, label: 'Hồ sơ cá nhân', path: '/dashboard' },
            ];
        }
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
                        Jadoo.
                    </Link>
                    <p className="text-xs text-slate-500 mt-2 font-medium tracking-wide uppercase">
                        {userRole === 'ADMIN' ? 'Admin Dashboard' : userRole === 'AGENT' ? 'Agent Dashboard' : 'User Dashboard'}
                    </p>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
                    {getNavItems().map((item, index) => (
                        <div key={index} onClick={() => navigate(item.path)}>
                            <NavItem
                                icon={item.icon}
                                label={item.label}
                                active={false}
                            />
                        </div>
                    ))}
                </nav>

                <div className="p-4 m-4 bg-white/50 rounded-2xl border border-white/50">
                    <div className="flex items-center gap-3 mb-4 rounded-xl p-2 transition-colors hover:bg-white/60 cursor-default">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-sm font-bold shadow-md">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 group"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
