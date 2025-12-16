import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import NavItem from '../shared/NavItem';
import { userNavItems, agentNavItems, adminNavItems } from '../../utils/navConfig';

const MainLayout = ({ children, onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
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

    // Get nav items based on role
    const getNavItems = () => {
        if (userRole === 'ADMIN') {
            return { items: adminNavItems, prefix: '/admin' };
        } else if (userRole === 'AGENT') {
            return { items: agentNavItems, prefix: '/agent' };
        } else {
            return { items: userNavItems, prefix: '/user' };
        }
    };

    const { items: navItems, prefix } = getNavItems();

    // Check if a path is active
    const isActive = (path) => {
        const fullPath = `${prefix}${path}`;
        if (path === '/dashboard') {
            // Khám phá is active for dashboard, /tours, and /tour/:id
            return location.pathname === fullPath ||
                location.pathname === '/tours' ||
                location.pathname.startsWith('/tour/');
        }
        return location.pathname === fullPath;
    };

    const isNavItemActive = (item) => {
        if (item.checkPaths) {
            return item.checkPaths.some(p => isActive(p));
        }
        return isActive(item.path);
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-surface font-sans overflow-hidden relative">
            {/* Ambient Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/5 blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Sidebar - Glassmorphism (Hidden on mobile, visible on md+) */}
            <aside className="w-72 bg-white/70 backdrop-blur-xl border-r border-white/40 hidden md:flex flex-col shadow-2xl shadow-slate-200/50 z-20 m-4 rounded-[2rem]">
                <div className="p-8 pb-4">
                    <Link to="/" className="text-2xl font-display font-bold tracking-tighter flex items-center gap-2 text-slate-900 hover:text-primary transition-colors">
                        Quanh.
                    </Link>
                    <p className="text-xs text-slate-500 mt-2 font-medium tracking-wide uppercase">
                        {userRole === 'ADMIN' ? 'Admin Dashboard' : userRole === 'AGENT' ? 'Agent Dashboard' : ''}
                    </p>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
                    {navItems.map((item, index) => (
                        <div key={index} onClick={() => navigate(`${prefix}${item.path}`)}>
                            <NavItem
                                icon={item.icon}
                                label={item.label}
                                active={isNavItemActive(item)}
                            />
                        </div>
                    ))}
                </nav>

                <div className="p-4 m-4 bg-white/50 rounded-2xl border border-white/50">
                    <div className="flex items-center gap-3 mb-4 rounded-xl p-2 transition-colors hover:bg-white/60 cursor-default">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-sm font-bold shadow-md">
                            {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">
                                {user.firstName && user.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : user.firstName || user.lastName || 'User'}
                            </p>
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
            <main className="flex-1 overflow-y-auto relative pb-20 md:pb-0">
                {children}
            </main>

            {/* Mobile Bottom Navigation Bar (Visible on mobile, hidden on md+) */}
            <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white/80 backdrop-blur-xl border-t border-white/40 shadow-lg shadow-slate-200/50 z-50">
                <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
                    {navItems.slice(0, 6).map((item, index) => (
                        <button
                            key={index}
                            onClick={() => navigate(`${prefix}${item.path}`)}
                            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px] ${isNavItemActive(item)
                                ? 'bg-primary/10 text-primary'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <span className={`transition-transform duration-200 ${isNavItemActive(item) ? 'scale-110' : ''}`}>
                                {React.cloneElement(item.icon, { size: 22 })}
                            </span>
                            <span className="text-[10px] font-medium truncate max-w-[60px]">
                                {item.shortLabel}
                            </span>
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
};

export default MainLayout;
