import React from 'react';
import {
    LayoutDashboard,
    Map,
    MapPin,
    Calendar,
    User,
    MessageCircle,
    MessageSquare,
    Heart,
    Flag,
} from 'lucide-react';

// User navigation items
export const userNavItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Khám phá', shortLabel: 'Khám phá', path: '/dashboard', checkPaths: ['', '/dashboard'] },
    { icon: <Heart size={20} />, label: 'Yêu thích', shortLabel: 'Yêu thích', path: '/favorites' },
    { icon: <Calendar size={20} />, label: 'Chuyến đi của tôi', shortLabel: 'Chuyến đi', path: '/bookings' },
    // { icon: <Map size={20} />, label: 'Lập kế hoạch', shortLabel: 'Kế hoạch', path: '/planner' },
    // { icon: <MapPin size={20} />, label: 'Đề xuất địa điểm', shortLabel: 'Đề xuất', path: '/locations' },
    { icon: <MessageCircle size={20} />, label: 'Tin nhắn', shortLabel: 'Tin nhắn', path: '/chat' },
    { icon: <User size={20} />, label: 'Hồ sơ', shortLabel: 'Hồ sơ', path: '/profile' },

];

// Agent navigation items
export const agentNavItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Tổng quan', shortLabel: 'Tổng quan', path: '/dashboard', checkPaths: ['', '/dashboard'] },
    { icon: <Map size={20} />, label: 'Quản lý Tour', shortLabel: 'Tour', path: '/tours' },
    { icon: <MapPin size={20} />, label: 'Đề xuất địa điểm', shortLabel: 'Địa điểm', path: '/locations' },
    { icon: <MessageSquare size={20} />, label: 'Đánh giá & Phản hồi', shortLabel: 'Đánh giá', path: '/reviews' },
    { icon: <MessageCircle size={20} />, label: 'Tin nhắn', shortLabel: 'Chat', path: '/chat' },
    { icon: <User size={20} />, label: 'Hồ sơ Agent', shortLabel: 'Hồ sơ', path: '/profile' },
];

// Admin navigation items
export const adminNavItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', shortLabel: 'Dashboard', path: '/dashboard' },
    { icon: <User size={20} />, label: 'Quản lý người dùng', shortLabel: 'Users', path: '/users' },
    { icon: <MapPin size={20} />, label: 'Quản lý địa điểm', shortLabel: 'Địa điểm', path: '/locations' },
    { icon: <Map size={20} />, label: 'Quản lý tour', shortLabel: 'Tour', path: '/tours' },
    { icon: <Flag size={20} />, label: 'Quản lý báo cáo', shortLabel: 'Báo cáo', path: '/reports' },
];

// Get nav items by role with prefix
export const getNavItemsWithPrefix = (role, prefix = '') => {
    let items;
    switch (role) {
        case 'ADMIN':
            items = adminNavItems;
            break;
        case 'AGENT':
            items = agentNavItems;
            break;
        default:
            items = userNavItems;
    }

    return items.map(item => ({
        ...item,
        fullPath: `${prefix}${item.path}`,
        checkPaths: item.checkPaths?.map(p => `${prefix}${p}`)
    }));
};
