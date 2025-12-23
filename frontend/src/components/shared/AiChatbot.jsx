import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Minimize2, Maximize2, ChevronUp, ChevronDown } from 'lucide-react';
import { api } from '../../utils/api';

const AiChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', content: 'Xin chào! Tôi là trợ lý Quanh xinh gái. Tôi có thể giúp gì cho bạn hôm nay?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Get user info and role to check permissions
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = userData?.roles?.[0]?.name || userData?.role;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Only show for USER role (not for AGENT or ADMIN)
    // If not logged in, userRole might be undefined, we might want to show it for guests too?
    // User requested "chỉ trong user", implying regular users.
    if (userRole && userRole !== 'USER') {
        return null;
    }

    // Extract image URLs from content
    const extractImages = (content) => {
        const imageRegex = /https?:\/\/[^\s]+?\.(jpg|jpeg|png|gif|webp|bmp|jfif)(\?[^\s]*)?/gi;
        const images = content.match(imageRegex) || [];
        const textWithoutImages = content.replace(imageRegex, '').trim();
        return { images, text: textWithoutImages };
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        // Add empty AI message that will be streamed into
        const aiMessageIndex = messages.length + 1;
        setMessages(prev => [...prev, { role: 'ai', content: '' }]);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/ai-chat/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ message: userMessage })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let streamedContent = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                streamedContent += chunk;

                // Update the AI message with streamed content
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[aiMessageIndex] = { role: 'ai', content: streamedContent };
                    return newMessages;
                });
            }

            // If no content was streamed, show error message
            if (!streamedContent.trim()) {
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[aiMessageIndex] = { role: 'ai', content: 'Xin lỗi, tôi không thể trả lời lúc này.' };
                    return newMessages;
                });
            }
        } catch (error) {
            console.error('AI Chat Error:', error);
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[aiMessageIndex] = { role: 'ai', content: 'Hiện tại hệ thống đang bận, bạn vui lòng thử lại sau nhé!' };
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50 group p-0 overflow-hidden border-2 border-white"
            >
                <img src="/Quanh.jpeg" alt="Quanh AI" className="w-full h-full object-cover group-hover:rotate-6 transition-transform" />
                <span className="absolute top-0 right-0 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border border-white"></span>
                </span>
            </button>
        );
    }

    return (
        <div className={`fixed transition-all z-50 overflow-hidden bg-white shadow-2xl border border-slate-200 flex flex-col
            ${isFullScreen
                ? 'inset-0 md:inset-6 md:left-80 z-[60]'
                : `bottom-24 right-6 w-[90vw] md:w-[450px] ${isMinimized ? 'h-14' : 'h-[600px] md:h-[650px]'} rounded-2xl`
            }`}
        >
            {/* Header */}
            <div className="bg-primary p-4 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden border border-white/30 shadow-inner">
                        <img src="/Quanh.jpeg" alt="Quanh" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Trợ lý Quanh xinh gái</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                            <span className="text-[10px] opacity-80 uppercase tracking-wider">Trực tuyến</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => {
                            setIsFullScreen(!isFullScreen);
                            setIsMinimized(false);
                        }}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        title={isFullScreen ? "Thu nhỏ" : "Toàn màn hình"}
                    >
                        {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                    {!isFullScreen && (
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                            title={isMinimized ? "Mở rộng" : "Thu gọn"}
                        >
                            {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            setIsFullScreen(false);
                        }}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Chat area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                        {messages.map((msg, index) => {
                            const { images, text } = extractImages(msg.content);
                            return (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                                    {msg.role === 'ai' && (
                                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-200 shadow-sm mb-1">
                                            <img src="/Quanh.jpeg" alt="Quanh" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className={`max-w-[90%] rounded-2xl text-sm shadow-sm ${msg.role === 'user'
                                        ? 'bg-primary text-white rounded-tr-none'
                                        : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                                        }`}>
                                        {text && (
                                            <div className="p-3">
                                                <p className="whitespace-pre-wrap">{text}</p>
                                            </div>
                                        )}
                                        {images.length > 0 && (
                                            <div className={`grid gap-2 p-3 ${text ? 'pt-0' : ''} ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                                {images.map((imgUrl, imgIndex) => (
                                                    <img
                                                        key={imgIndex}
                                                        src={imgUrl}
                                                        alt={`Tour image ${imgIndex + 1}`}
                                                        className="w-full h-32 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                                                        onClick={() => window.open(imgUrl, '_blank')}
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {isLoading && (
                            <div className="flex justify-start items-center gap-2">
                                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-200 shadow-sm">
                                    <img src="/Quanh.jpeg" alt="Quanh" className="w-full h-full object-cover" />
                                </div>
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce delay-150"></span>
                                        <span className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce delay-300"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Hỏi tôi về tour, địa điểm..."
                            className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                        >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </form>
                </>
            )}
        </div>
    );
};

export default AiChatbot;
