import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const WS_URL = API_BASE + '/ws';

let stompClient = null;
let isConnected = false;
let subscriptions = new Map();
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

/**
 * Kết nối WebSocket
 */
export const connectWebSocket = (onConnected, onError) => {
    if (stompClient && isConnected) {
        if (onConnected) onConnected();
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No token found, cannot connect to WebSocket');
        if (onError) onError(new Error('No authentication token'));
        return;
    }

    // Use SockJS for compatibility
    const socketUrl = API_BASE + '/ws';
    const socket = new SockJS(socketUrl);
    stompClient = Stomp.over(socket);

    // Disable debug logging in production
    stompClient.debug = (str) => {
        if (import.meta.env.DEV) {
            // debug logging disabled
        }
    };

    stompClient.connect(
        { Authorization: `Bearer ${token}` },
        (frame) => {
            isConnected = true;
            reconnectAttempts = 0;
            if (onConnected) onConnected();
        },
        (error) => {
            console.error('WebSocket connection error:', error);
            isConnected = false;

            // Attempt to reconnect
            if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                reconnectAttempts++;
                setTimeout(() => {
                    connectWebSocket(onConnected, onError);
                }, RECONNECT_DELAY);
            } else if (onError) {
                onError(error);
            }
        }
    );
};

/**
 * Ngắt kết nối WebSocket
 */
export const disconnectWebSocket = () => {
    if (stompClient) {
        // Unsubscribe all
        subscriptions.forEach((sub) => {
            if (sub) sub.unsubscribe();
        });
        subscriptions.clear();

        stompClient.disconnect(() => {
            isConnected = false;
            stompClient = null;
        });
    }
};

/**
 * Subscribe vào conversation để nhận tin nhắn real-time
 */
export const subscribeToConversation = (conversationId, onMessage) => {
    if (!stompClient || !isConnected) {
        console.warn('WebSocket not connected, cannot subscribe');
        return null;
    }

    const destination = `/topic/conversation/${conversationId}`;

    // Check if already subscribed
    if (subscriptions.has(destination)) {
        return subscriptions.get(destination);
    }

    const subscription = stompClient.subscribe(destination, (frame) => {
        try {
            const message = JSON.parse(frame.body);

            // Always determine isCurrentUser from senderId (ignore backend value)
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const currentUser = JSON.parse(userStr);
                message.isCurrentUser = message.senderId === currentUser.id;
            }

            if (onMessage) onMessage(message);
        } catch (e) {
            console.error('Error parsing WebSocket message:', e);
        }
    });

    subscriptions.set(destination, subscription);

    return subscription;
};

/**
 * Unsubscribe khỏi conversation
 */
export const unsubscribeFromConversation = (conversationId) => {
    const destination = `/topic/conversation/${conversationId}`;
    const subscription = subscriptions.get(destination);

    if (subscription) {
        subscription.unsubscribe();
        subscriptions.delete(destination);
    }
};

/**
 * Subscribe vào user notifications
 */
export const subscribeToNotifications = (userId, onNotification) => {
    if (!stompClient || !isConnected) {
        console.warn('WebSocket not connected, cannot subscribe to notifications');
        return null;
    }

    const destination = `/user/${userId}/queue/notifications`;

    const subscription = stompClient.subscribe(destination, (frame) => {
        try {
            const notification = JSON.parse(frame.body);
            if (onNotification) onNotification(notification);
        } catch (e) {
            console.error('Error parsing notification:', e);
        }
    });

    subscriptions.set(destination, subscription);

    return subscription;
};

/**
 * Subscribe vào agent notifications via topic
 * Dùng cho realtime notifications khi có booking mới
 */
export const subscribeToAgentNotifications = (userId, onNotification) => {
    if (!stompClient || !isConnected) {
        console.warn('WebSocket not connected, cannot subscribe to agent notifications');
        return null;
    }

    const destination = `/topic/notifications/${userId}`;

    // Check if already subscribed
    if (subscriptions.has(destination)) {
        return subscriptions.get(destination);
    }

    const subscription = stompClient.subscribe(destination, (frame) => {
        try {
            const notification = JSON.parse(frame.body);
            if (onNotification) onNotification(notification);
        } catch (e) {
            console.error('Error parsing agent notification:', e);
        }
    });

    subscriptions.set(destination, subscription);

    return subscription;
};

/**
 * Gửi tin nhắn qua WebSocket
 */
export const sendMessageViaWebSocket = (conversationId, content, imageUrl = null) => {
    if (!stompClient || !isConnected) {
        console.warn('WebSocket not connected, cannot send message');
        return false;
    }

    const message = {
        conversationId,
        content,
        imageUrl
    };

    stompClient.send('/app/chat.send', {}, JSON.stringify(message));
    return true;
};

/**
 * Check if WebSocket is connected
 */
export const isWebSocketConnected = () => {
    return isConnected && stompClient !== null;
};

/**
 * Get current connection status
 */
export const getConnectionStatus = () => ({
    isConnected,
    reconnectAttempts,
    subscriptionCount: subscriptions.size
});
