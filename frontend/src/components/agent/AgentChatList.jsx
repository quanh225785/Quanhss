import React, { useState, useEffect } from "react";
import { MessageCircle, ArrowLeft, Search, Loader2 } from "lucide-react";
import ChatWindow from "../shared/ChatWindow";
import { getConversations, getMessages } from "../../utils/chatApi";

const AgentChatList = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadConversations();
        // Poll for new messages every 30 seconds
        const interval = setInterval(loadConversations, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadConversations = async () => {
        try {
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

    const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

    const filteredConversations = conversations.filter(conv =>
        conv.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (conv.tourName && conv.tourName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Desktop: side by side layout
    // Mobile: show either list or chat window
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                        Tin nhắn
                        {totalUnread > 0 && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-sm rounded-full">
                                {totalUnread}
                            </span>
                        )}
                    </h1>
                    <p className="text-zinc-500 mt-1">Trò chuyện với khách hàng</p>
                </div>
            </div>

            {/* Mobile: Single view */}
            <div className="md:hidden">
                {selectedConversation ? (
                    <div className="h-[calc(100vh-180px)]">
                        <button
                            onClick={() => setSelectedConversation(null)}
                            className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 mb-4"
                        >
                            <ArrowLeft size={20} />
                            <span>Quay lại</span>
                        </button>

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
                ) : (
                    <ConversationList
                        conversations={filteredConversations}
                        loading={loading}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        onSelectConversation={selectConversation}
                        formatTime={formatTime}
                    />
                )}
            </div>

            {/* Desktop: Split view */}
            <div className="hidden md:grid md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                {/* Conversation List */}
                <div className="col-span-1 overflow-hidden flex flex-col">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-zinc-200">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="text-center py-12 px-4">
                                <MessageCircle className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                                <p className="text-sm text-zinc-500">
                                    {searchTerm ? "Không tìm thấy" : "Chưa có tin nhắn"}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-100">
                                {filteredConversations.map((conv) => (
                                    <button
                                        key={conv.id}
                                        onClick={() => selectConversation(conv)}
                                        className={`w-full flex items-center gap-3 p-3 hover:bg-zinc-50 transition-colors text-left ${selectedConversation?.id === conv.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                                            }`}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                                                {conv.partnerInitial}
                                            </div>
                                            {conv.unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                                    {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <h3 className={`text-sm font-semibold truncate ${conv.unreadCount > 0 ? 'text-zinc-900' : 'text-zinc-700'}`}>
                                                    {conv.partnerName}
                                                </h3>
                                                <span className="text-xs text-zinc-400 ml-2">
                                                    {formatTime(conv.lastMessageAt)}
                                                </span>
                                            </div>
                                            <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-zinc-900 font-medium' : 'text-zinc-500'}`}>
                                                {conv.lastMessage || "Bắt đầu trò chuyện"}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="col-span-2 h-full overflow-hidden">
                    {selectedConversation ? (
                        loadingMessages ? (
                            <div className="flex items-center justify-center h-full bg-white rounded-xl border border-zinc-200">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="h-full">
                                <ChatWindow
                                    messages={messages}
                                    conversationId={selectedConversation.id}
                                    onMessageSent={handleMessageSent}
                                    onNewMessage={handleNewMessage}
                                    partnerName={selectedConversation.partnerName}
                                    partnerInitial={selectedConversation.partnerInitial}
                                />
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl border border-zinc-200 text-zinc-400">
                            <MessageCircle className="w-16 h-16 mb-4" />
                            <p className="text-lg font-medium">Chọn một cuộc trò chuyện</p>
                            <p className="text-sm">để bắt đầu nhắn tin</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Conversation List Component for mobile
const ConversationList = ({ conversations, loading, searchTerm, onSearchChange, onSelectConversation, formatTime }) => (
    <>
        {/* Search */}
        <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input
                type="text"
                placeholder="Tìm kiếm cuộc trò chuyện..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
        </div>

        {/* List */}
        {loading ? (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        ) : conversations.length === 0 ? (
            <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-zinc-900 mb-2">
                    {searchTerm ? "Không tìm thấy" : "Chưa có tin nhắn"}
                </h3>
                <p className="text-zinc-500">
                    {searchTerm ? "Thử tìm kiếm với từ khóa khác" : "Khách hàng sẽ liên hệ với bạn qua đây"}
                </p>
            </div>
        ) : (
            <div className="bg-white rounded-xl border border-zinc-200 divide-y divide-zinc-100 overflow-hidden">
                {conversations.map((conv) => (
                    <button
                        key={conv.id}
                        onClick={() => onSelectConversation(conv)}
                        className="w-full flex items-center gap-4 p-4 hover:bg-zinc-50 transition-colors text-left"
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
    </>
);

export default AgentChatList;
