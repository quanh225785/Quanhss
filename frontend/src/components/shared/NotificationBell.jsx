import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Package, Star, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { createPortal } from "react-dom";
import { api } from "../../utils/api";
import { connectWebSocket, subscribeToAgentNotifications } from "../../utils/websocket";

const NotificationBell = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasNewNotification, setHasNewNotification] = useState(false);
    const dropdownRef = useRef(null);
    const bellRef = useRef(null);
    const lastFetchedCountRef = useRef(0);

    // Fetch unread count
    const fetchUnreadCount = async () => {
        try {
            const response = await api.get("/notifications/unread-count");
            if (response.data?.code === 1000) {
                const newCount = response.data.result;
                // Trigger animation if count increased
                if (newCount > lastFetchedCountRef.current) {
                    setHasNewNotification(true);
                    setTimeout(() => setHasNewNotification(false), 2000);
                }
                lastFetchedCountRef.current = newCount;
                setUnreadCount(newCount);
            }
        } catch (error) {
            console.debug("Failed to fetch unread count:", error);
        }
    };

    // Fetch notifications list
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get("/notifications");
            if (response.data?.code === 1000) {
                setNotifications(response.data.result || []);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    // WebSocket subscription for realtime notifications
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user.id) return;

        let isSubscribed = false;

        const setupWebSocket = () => {
            connectWebSocket(
                () => {
                    // Subscribe to agent notifications topic
                    if (!isSubscribed) {
                        isSubscribed = true;
                        subscribeToAgentNotifications(user.id, (notification) => {
                            // Add new notification to the top of the list
                            setNotifications(prev => [notification, ...prev.slice(0, 19)]);
                            setUnreadCount(prev => prev + 1);
                            setHasNewNotification(true);
                            setTimeout(() => setHasNewNotification(false), 2000);
                        });
                    }
                },
                (error) => {
                    console.error("WebSocket connection failed:", error);
                }
            );
        };

        setupWebSocket();

        return () => {
            isSubscribed = false;
        };
    }, []);

    // POLLING FALLBACK: Poll every 5 seconds to handle load balancer issues
    // This ensures notifications are received even when WebSocket broadcasts to wrong instance
    useEffect(() => {
        fetchUnreadCount();

        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Fetch full list when dropdown opens
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                bellRef.current &&
                !bellRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Mark notification as read
    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            await api.put("/notifications/read-all");
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    // Handle notification click - mark as read and navigate
    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
        setIsOpen(false); // Close dropdown

        // Navigate based on notification type and referenceType
        if (notification.referenceId && notification.referenceType) {
            switch (notification.referenceType) {
                case "TOUR":
                    // Navigate to tour trips management page
                    navigate(`/agent/tours/${notification.referenceId}/trips`);
                    break;
                case "BOOKING":
                    // Navigate to tour detail page
                    navigate(`/agent/tours/${notification.referenceId}`);
                    break;
                case "REVIEW":
                    // Navigate to reviews page
                    navigate("/agent/reviews");
                    break;
                default:
                    // Navigate to dashboard
                    navigate("/agent/dashboard");
            }
        }
    };

    // Get icon based on notification type
    const getNotificationIcon = (type) => {
        switch (type) {
            case "NEW_BOOKING":
                return <Package className="text-blue-500" size={18} />;
            case "NEW_REVIEW":
                return <Star className="text-yellow-500" size={18} />;
            case "TOUR_APPROVED":
                return <CheckCircle className="text-green-500" size={18} />;
            case "TOUR_REJECTED":
                return <XCircle className="text-red-500" size={18} />;
            case "BOOKING_CANCELLED":
                return <XCircle className="text-orange-500" size={18} />;
            default:
                return <Bell className="text-zinc-500" size={18} />;
        }
    };

    // Format time ago
    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Vừa xong";
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return date.toLocaleDateString("vi-VN");
    };

    // Calculate dropdown position - opens above and to the right
    const getDropdownPosition = () => {
        if (!bellRef.current) return { bottom: 0, left: 0 };
        const rect = bellRef.current.getBoundingClientRect();
        const dropdownHeight = 400; // Approximate max height
        const dropdownWidth = 384; // w-96 = 24rem = 384px

        return {
            bottom: window.innerHeight - rect.top + 8,
            left: rect.left,
        };
    };

    const dropdownPosition = getDropdownPosition();

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                ref={bellRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-full transition-all duration-200 ${isOpen
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900"
                    } ${hasNewNotification ? "animate-bounce" : ""}`}
            >
                <Bell size={22} />

                {/* Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center px-1.5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown - using Portal, opens above and to the right */}
            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    className="fixed w-80 md:w-96 bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden z-[9999]"
                    style={{
                        bottom: dropdownPosition.bottom,
                        left: dropdownPosition.left,
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-zinc-50">
                        <h3 className="font-semibold text-zinc-900">Thông báo</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium"
                            >
                                <CheckCheck size={14} />
                                Đánh dấu đã đọc
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[60vh] overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="animate-spin text-zinc-400" size={24} />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                                <Bell size={40} strokeWidth={1.5} />
                                <p className="mt-2 text-sm">Chưa có thông báo nào</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-zinc-50 last:border-0 ${notification.isRead
                                        ? "bg-white hover:bg-zinc-50"
                                        : "bg-blue-50/50 hover:bg-blue-50"
                                        }`}
                                >
                                    {/* Icon */}
                                    <div className="flex-shrink-0 mt-0.5">
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${notification.isRead ? "text-zinc-700" : "text-zinc-900 font-medium"}`}>
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-zinc-400 mt-1">
                                            {formatTimeAgo(notification.createdAt)}
                                        </p>
                                    </div>

                                    {/* Unread indicator */}
                                    {!notification.isRead && (
                                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default NotificationBell;
