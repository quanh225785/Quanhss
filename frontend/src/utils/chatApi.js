import { api } from './api';

// Chat API functions

/**
 * Lấy danh sách cuộc hội thoại
 */
export const getConversations = async () => {
    const response = await api.get('/chat/conversations');
    return response.data.result;
};

/**
 * Lấy tin nhắn trong cuộc hội thoại
 */
export const getMessages = async (conversationId) => {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`);
    return response.data.result;
};

/**
 * Bắt đầu cuộc hội thoại mới
 * @param {string|null} agentId - ID của agent (optional nếu có tourId)
 * @param {number|null} tourId - ID của tour (optional, nhưng cần 1 trong 2)
 * @param {string|null} initialMessage - Tin nhắn đầu tiên
 */
export const startConversation = async (agentId = null, tourId = null, initialMessage = null) => {
    const payload = {};
    if (agentId) payload.agentId = agentId;
    if (tourId) payload.tourId = tourId;
    if (initialMessage) payload.initialMessage = initialMessage;

    const response = await api.post('/chat/conversations', payload);
    return response.data.result;
};

/**
 * Gửi tin nhắn
 */
export const sendMessage = async (conversationId, content = null, imageUrl = null) => {
    const response = await api.post('/chat/messages', {
        conversationId,
        content,
        imageUrl
    });
    return response.data.result;
};

/**
 * Đánh dấu tin nhắn đã đọc
 */
export const markAsRead = async (conversationId) => {
    await api.post(`/chat/conversations/${conversationId}/read`);
};

/**
 * Upload ảnh cho chat
 */
export const uploadChatImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'chat');

    const response = await api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data.result;
};
