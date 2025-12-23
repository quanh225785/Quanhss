import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { connectWebSocket, isWebSocketConnected, subscribeToChatUpdates } from '../utils/websocket';

const ChatContext = createContext();

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await api.get('/chat/unread-count');
            if (response.data?.code === 1000) {
                setUnreadCount(response.data.result);
            }
        } catch (error) {
            console.debug('Failed to fetch chat unread count:', error);
        }
    }, []);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.id) return;

        fetchUnreadCount();

        // WebSocket setup for realtime updates
        const setupWebSocket = () => {
            connectWebSocket(() => {
                subscribeToChatUpdates(user.id, () => {
                    fetchUnreadCount();
                });
            });
        };

        setupWebSocket();

        const interval = setInterval(fetchUnreadCount, 10000);

        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    // Function to manually refresh or update count
    const refreshUnreadCount = () => fetchUnreadCount();

    const value = {
        unreadCount,
        refreshUnreadCount,
        loading
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
