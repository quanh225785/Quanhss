import React, { useState, useRef, useEffect } from "react";
import { Send, Image, X, Loader2, Wifi, WifiOff } from "lucide-react";
import { sendMessage, uploadChatImage } from "../../utils/chatApi";
import {
    connectWebSocket,
    subscribeToConversation,
    unsubscribeFromConversation,
    isWebSocketConnected
} from "../../utils/websocket";
import { useToast } from "../../context/ToastContext";

const ChatWindow = ({
    messages,
    conversationId,
    onMessageSent,
    onNewMessage,
    partnerName,
    partnerInitial,
    onClose
}) => {
    const [newMessage, setNewMessage] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [sending, setSending] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [wsConnected, setWsConnected] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const { showToast } = useToast();

    // Use ref to store the latest callback without causing re-subscription
    const onNewMessageRef = useRef(onNewMessage);

    // Keep the ref updated with the latest callback
    useEffect(() => {
        onNewMessageRef.current = onNewMessage;
    }, [onNewMessage]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };


    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // WebSocket connection and subscription - only depend on conversationId
    useEffect(() => {
        if (!conversationId) return;

        let isSubscribed = false;

        const setupWebSocket = () => {
            connectWebSocket(
                () => {
                    setWsConnected(true);
                    // Subscribe to conversation
                    if (!isSubscribed) {
                        isSubscribed = true;
                        subscribeToConversation(conversationId, (message) => {
                            // Use ref to get the latest callback
                            // This prevents re-subscription when callback changes
                            if (onNewMessageRef.current) {
                                onNewMessageRef.current(message);
                            }
                        });
                    }
                },
                (error) => {
                    console.error('WebSocket connection failed:', error);
                    setWsConnected(false);
                }
            );
        };

        setupWebSocket();

        // Cleanup on unmount or conversation change ONLY
        return () => {
            isSubscribed = false;
            if (conversationId) {
                unsubscribeFromConversation(conversationId);
            }
        };
    }, [conversationId]); // Remove onNewMessage from dependencies

    // POLLING FALLBACK: Sync messages every 3 seconds to handle load balancer issues
    // This ensures messages are received even when WebSocket broadcasts to wrong instance
    useEffect(() => {
        if (!conversationId || !onNewMessageRef.current) return;

        const pollMessages = async () => {
            try {
                const { getMessages } = await import("../../utils/chatApi");
                const allMessages = await getMessages(conversationId);

                // Find messages that we don't have yet
                if (allMessages && allMessages.length > 0) {
                    allMessages.forEach(msg => {
                        if (onNewMessageRef.current) {
                            onNewMessageRef.current(msg);
                        }
                    });
                }
            } catch (error) {
                // Silent fail - WebSocket should handle most cases
                console.debug('Polling fallback error:', error);
            }
        };

        // Poll every 3 seconds
        const interval = setInterval(pollMessages, 3000);

        return () => clearInterval(interval);
    }, [conversationId]);

    // Update wsConnected status periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setWsConnected(isWebSocketConnected());
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                showToast({
                    type: 'error',
                    message: 'Ảnh quá lớn',
                    description: 'Ảnh phải nhỏ hơn 10MB'
                });
                return;
            }
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSend = async () => {
        if (!newMessage.trim() && !selectedImage) return;

        setSending(true);
        try {
            let imageUrl = null;

            // Upload ảnh nếu có
            if (selectedImage) {
                setUploading(true);
                imageUrl = await uploadChatImage(selectedImage);
                setUploading(false);
            }

            // Gửi tin nhắn qua REST API
            // WebSocket sẽ broadcast tin nhắn này tới tất cả subscribers
            const message = await sendMessage(
                conversationId,
                newMessage.trim() || null,
                imageUrl
            );

            // Add message locally (optimistic update)
            if (onMessageSent) {
                onMessageSent(message);
            }

            setNewMessage("");
            removeImage();
        } catch (error) {
            console.error("Failed to send message:", error);
            showToast({
                type: 'error',
                message: 'Lỗi gửi tin nhắn',
                description: 'Không thể gửi tin nhắn. Vui lòng thử lại.'
            });
        } finally {
            setSending(false);
            setUploading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Hôm nay";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Hôm qua";
        }
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups, message) => {
        const date = formatDate(message.createdAt);
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(message);
        return groups;
    }, {});

    return (
        <div className="flex flex-col h-full max-h-full bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-black/5 border border-white/40 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white/40 border-b border-white/20 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {partnerInitial}
                    </div>
                    <div>
                        <h3 className="font-semibold text-zinc-900">{partnerName}</h3>
                        <div className="flex items-center gap-1">
                            {wsConnected ? (
                                <>
                                    <Wifi size={12} className="text-green-500" />
                                    <span className="text-xs text-green-500">Trực tuyến</span>
                                </>
                            ) : (
                                <>
                                    <WifiOff size={12} className="text-zinc-400" />
                                    <span className="text-xs text-zinc-400">Đang kết nối...</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-200 rounded-full transition-colors"
                    >
                        <X size={20} className="text-zinc-500" />
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                    <div key={date}>
                        <div className="flex justify-center mb-4">
                            <span className="px-3 py-1 bg-zinc-100 text-zinc-500 text-xs rounded-full">
                                {date}
                            </span>
                        </div>
                        <div className="space-y-2">
                            {dateMessages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[70%] ${msg.isCurrentUser ? 'order-2' : 'order-1'}`}>
                                        {!msg.isCurrentUser && (
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-medium">
                                                    {msg.senderInitial}
                                                </div>
                                                <span className="text-xs text-zinc-500">{msg.senderName}</span>
                                            </div>
                                        )}
                                        <div
                                            className={`rounded-2xl px-4 py-2 ${msg.isCurrentUser
                                                ? 'bg-primary text-white rounded-br-md shadow-lg shadow-primary/20'
                                                : 'bg-white/60 backdrop-blur-md text-zinc-900 rounded-bl-md border border-white/40'
                                                }`}
                                        >
                                            {msg.imageUrl && (
                                                <img
                                                    src={msg.imageUrl}
                                                    alt="Chat image"
                                                    className="max-w-full rounded-lg mb-2 cursor-pointer hover:opacity-90"
                                                    onClick={() => window.open(msg.imageUrl, '_blank')}
                                                />
                                            )}
                                            {msg.content && (
                                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                            )}
                                        </div>
                                        <div className={`text-xs text-zinc-400 mt-1 ${msg.isCurrentUser ? 'text-right' : ''}`}>
                                            {formatTime(msg.createdAt)}
                                            {msg.isCurrentUser && msg.isRead && (
                                                <span className="ml-2">✓✓</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Image Preview */}
            {imagePreview && (
                <div className="px-4 py-2 border-t border-zinc-100 flex-shrink-0">
                    <div className="relative inline-block">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-20 rounded-lg object-cover"
                        />
                        <button
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="p-4 bg-white/40 border-t border-white/20 flex-shrink-0">
                <div className="flex items-end gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-zinc-500 hover:text-primary hover:bg-zinc-100 rounded-full transition-colors"
                        disabled={sending}
                    >
                        <Image size={20} />
                    </button>
                    <div className="flex-1">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Nhập tin nhắn..."
                            className="w-full resize-none border border-zinc-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary max-h-32"
                            rows={1}
                            disabled={sending}
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={sending || (!newMessage.trim() && !selectedImage)}
                        className="p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <Send size={20} />
                        )}
                    </button>
                </div>
                {uploading && (
                    <p className="text-xs text-zinc-500 mt-2">Đang tải ảnh lên...</p>
                )}
            </div>
        </div>
    );
};

export default ChatWindow;
