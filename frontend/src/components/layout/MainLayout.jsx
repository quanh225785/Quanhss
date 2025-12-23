import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import NavItem from '../shared/NavItem';
import NotificationBell from '../shared/NotificationBell';
import { userNavItems, agentNavItems, adminNavItems } from '../../utils/navConfig';
import { useChat } from '../../context/ChatContext';

const MainLayout = ({ children, onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { unreadCount } = useChat();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [user] = useState(
        JSON.parse(
            localStorage.getItem('user') ||
            '{"firstName": "Khách", "lastName": "hàng", "email": "user@example.com"}'
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
            <aside className={`${isCollapsed ? 'w-24' : 'w-72'} bg-white/70 backdrop-blur-xl border-r border-white/40 hidden md:flex flex-col shadow-2xl shadow-slate-200/50 z-20 m-4 rounded-[2rem] transition-all duration-300 relative group`}>
                {/* Collapse Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-10 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-md hover:bg-slate-50 transition-colors z-30"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                <div className={`${isCollapsed ? 'p-4 items-center' : 'p-8'} pb-4 flex flex-col`}>
                    <Link to="/dashboard" className="text-2xl font-display font-bold tracking-tighter flex items-center gap-1 text-slate-900 hover:text-primary transition-all duration-300 overflow-hidden">
                        <span className="shrink-0 text-primary">Q</span>
                        {!isCollapsed && <span className="transition-opacity duration-300">uanh.</span>}
                    </Link>
                    {!isCollapsed && (
                        <p className="text-xs text-slate-500 mt-2 font-medium tracking-wide uppercase whitespace-nowrap overflow-hidden">
                            {userRole === 'ADMIN' ? 'Admin Dashboard' : userRole === 'AGENT' ? 'Agent Dashboard' : ''}
                        </p>
                    )}
                </div>

                <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-4'} space-y-2 mt-4 overflow-y-auto custom-scrollbar overflow-x-hidden`}>
                    {navItems.map((item, index) => (
                        <div key={index} onClick={() => navigate(`${prefix}${item.path}`)}>
                            <NavItem
                                icon={item.icon}
                                label={item.label}
                                active={isNavItemActive(item)}
                                isCollapsed={isCollapsed}
                                unreadCount={item.label === 'Tin nhắn' ? unreadCount : 0}
                            />
                        </div>
                    ))}
                </nav>

                <div className={`${isCollapsed ? 'p-2' : 'p-4'} m-2 bg-white/50 rounded-2xl border border-white/50 transition-all duration-300`}>
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} mb-4 rounded-xl p-2 transition-colors hover:bg-white/60 cursor-default relative`}>
                        <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-sm font-bold shadow-md overflow-hidden">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'
                            )}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0 transition-opacity duration-300">
                                <p className="text-sm font-bold text-slate-900 truncate">
                                    {user.firstName && user.lastName
                                        ? `${user.firstName} ${user.lastName}`
                                        : user.firstName || user.lastName || 'User'}
                                </p>
                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            </div>
                        )}
                        {/* Notification Bell for AGENT and ADMIN */}
                        {(userRole === 'AGENT' || userRole === 'ADMIN') && !isCollapsed && (
                            <NotificationBell />
                        )}

                        {/* Notification indicator for collapsed mode if there are notifications? 
                            For now, maybe just show the bell if it's visible, but in collapsed mode we might want to hide it or place it differently.
                            Actually, let's keep it simple.
                        */}
                    </div>
                    <button
                        onClick={handleLogout}
                        className={`flex items-center justify-center ${isCollapsed ? 'w-10 h-10 mx-auto rounded-full' : 'w-full gap-2 px-4 py-2.5 rounded-xl'} text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-all duration-200 group`}
                    >
                        <LogOut size={18} className={`${!isCollapsed ? 'group-hover:-translate-x-1' : ''} transition-transform`} />
                        {!isCollapsed && <span>Đăng xuất</span>}
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
                            <div className="relative">
                                <span className={`transition-transform duration-200 ${isNavItemActive(item) ? 'scale-110' : ''}`}>
                                    {React.cloneElement(item.icon, { size: 22 })}
                                </span>
                                {item.label === 'Tin nhắn' && unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white z-20" />
                                )}
                            </div>
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
