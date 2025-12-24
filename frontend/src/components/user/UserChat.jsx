import React, { useState, useEffect } from "react";
import { MessageCircle, ArrowLeft, Search, Loader2 } from "lucide-react";
import ChatWindow from "../shared/ChatWindow";
import { getConversations, getMessages } from "../../utils/chatApi";
import { useChat } from "../../context/ChatContext";

const UserChat = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const { refreshUnreadCount } = useChat();

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        try {
            setLoading(true);
            const data = await getConversations();
            setConversations(data);
        } catch (error) {
            console.error("Failed to load conversations:", error);
        } finally {
            setLoading(false);
        }
    };

    const selectConversation = async (conv) => {
        setSelectedConversation(conv);
        setLoadingMessages(true);
        try {
            const data = await getMessages(conv.id);
            setMessages(data);
            // Update unread count locally
            setConversations(prev => prev.map(c =>
                c.id === conv.id ? { ...c, unreadCount: 0 } : c
            ));
            refreshUnreadCount();
        } catch (error) {
            console.error("Failed to load messages:", error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleMessageSent = (newMessage) => {
        // Check if message already exists (avoid duplicates with WebSocket)
        setMessages(prev => {
            if (prev.some(m => m.id === newMessage.id)) {
                return prev;
            }
            return [...prev, newMessage];
        });
        // Update last message in conversation list
        setConversations(prev => prev.map(c =>
            c.id === selectedConversation.id
                ? {
                    ...c,
                    lastMessage: newMessage.content || "[Hình ảnh]",
                    lastMessageAt: newMessage.createdAt
                }
                : c
        ));
        refreshUnreadCount();
    };

    // Handle new message from WebSocket
    const handleNewMessage = (newMessage) => {
        // Check if message already exists (avoid duplicates)
        setMessages(prev => {
            if (prev.some(m => m.id === newMessage.id)) {
                return prev;
            }
            return [...prev, newMessage];
        });
        // Update conversation list
        setConversations(prev => prev.map(c =>
            c.id === selectedConversation?.id
                ? {
                    ...c,
                    lastMessage: newMessage.content || "[Hình ảnh]",
                    lastMessageAt: newMessage.createdAt
                }
                : c
        ));
        refreshUnreadCount();
    };

    const formatTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Vừa xong";
        if (diffMins < 60) return `${diffMins} phút`;
        if (diffHours < 24) return `${diffHours} giờ`;
        if (diffDays < 7) return `${diffDays} ngày`;
        return date.toLocaleDateString('vi-VN');
    };

    const filteredConversations = conversations.filter(conv =>
        conv.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (conv.tourName && conv.tourName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Mobile: show either list or chat window
    if (selectedConversation) {
        return (
            <div className="h-[calc(100vh-180px)] md:h-[calc(100vh-120px)]">
                {/* Mobile back button */}
                <div className="md:hidden mb-4">
                    <button
                        onClick={() => setSelectedConversation(null)}
                        className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900"
                    >
                        <ArrowLeft size={20} />
                        <span>Quay lại</span>
                    </button>
                </div>

                {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <ChatWindow
                        messages={messages}
                        conversationId={selectedConversation.id}
                        onMessageSent={handleMessageSent}
                        onNewMessage={handleNewMessage}
                        partnerName={selectedConversation.partnerName}
                        partnerInitial={selectedConversation.partnerInitial}
                        onClose={() => setSelectedConversation(null)}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-zinc-900">Tin nhắn</h1>
                <p className="text-zinc-500 mt-1">Trò chuyện với các đại lý tour</p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input
                    type="text"
                    placeholder="Tìm kiếm cuộc trò chuyện..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-zinc-400 font-medium"
                />
            </div>

            {/* Conversation List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : filteredConversations.length === 0 ? (
                <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-zinc-900 mb-2">
                        {searchTerm ? "Không tìm thấy cuộc trò chuyện" : "Chưa có tin nhắn"}
                    </h3>
                    <p className="text-zinc-500">
                        {searchTerm
                            ? "Thử tìm kiếm với từ khóa khác"
                            : "Bắt đầu trò chuyện với đại lý từ trang chi tiết tour"}
                    </p>
                </div>
            ) : (
                <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white/40 divide-y divide-white/20 overflow-hidden shadow-2xl shadow-black/5">
                    {filteredConversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => selectConversation(conv)}
                            className="w-full flex items-center gap-5 p-6 hover:bg-white/50 transition-all text-left group"
                        >
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                    {conv.partnerInitial}
                                </div>
                                {conv.unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className={`font-semibold truncate ${conv.unreadCount > 0 ? 'text-zinc-900' : 'text-zinc-700'}`}>
                                        {conv.partnerName}
                                    </h3>
                                    <span className="text-xs text-zinc-400 ml-2 flex-shrink-0">
                                        {formatTime(conv.lastMessageAt)}
                                    </span>
                                </div>
                                {conv.tourName && (
                                    <p className="text-xs text-primary mb-1 truncate">Tour: {conv.tourName}</p>
                                )}
                                <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-zinc-900 font-medium' : 'text-zinc-500'}`}>
                                    {conv.lastMessage || "Bắt đầu cuộc trò chuyện"}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserChat;
