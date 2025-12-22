import React, { useState, useEffect } from 'react';
import { Star, Loader2, MessageCircle, Send, AlertCircle } from 'lucide-react';
import { api } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [replyingId, setReplyingId] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await api.get('/reviews/agent');
            if (response.data.code === 1000) {
                setReviews(response.data.result || []);
            }
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setError('Không thể tải danh sách đánh giá');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (reviewId) => {
        if (!replyContent.trim()) return;

        setSubmittingReply(true);
        try {
            const response = await api.put(`/reviews/${reviewId}/reply`, {
                replyContent: replyContent.trim()
            });
            if (response.data.code === 1000) {
                // Update the review in local state
                setReviews(reviews.map(r =>
                    r.id === reviewId
                        ? { ...r, agentReply: replyContent.trim(), agentRepliedAt: new Date().toISOString() }
                        : r
                ));
                setReplyingId(null);
                setReplyContent('');
            }
        } catch (err) {
            console.error('Error submitting reply:', err);
            showToast({
                type: 'error',
                message: 'Lỗi phản hồi',
                description: err.response?.data?.message || 'Không thể gửi phản hồi'
            });
        } finally {
            setSubmittingReply(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hôm nay';
        if (diffDays === 1) return 'Hôm qua';
        if (diffDays < 7) return `${diffDays} ngày trước`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
        return date.toLocaleDateString('vi-VN');
    };

    const renderStars = (rating) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={14}
                        className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-zinc-400" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Đánh giá & Phản hồi</h2>
                <p className="text-zinc-500">Xem và phản hồi các đánh giá từ khách hàng.</p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {reviews.length === 0 ? (
                <div className="text-center py-12 bg-white p-6 rounded-xl border border-zinc-200">
                    <MessageCircle className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-zinc-900 mb-2">Chưa có đánh giá nào</h3>
                    <p className="text-zinc-500">Các đánh giá từ khách hàng sẽ hiển thị ở đây.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white p-6 rounded-xl border border-zinc-200">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {/* User Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-medium text-zinc-600 overflow-hidden">
                                        {review.userAvatar ? (
                                            <img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" />
                                        ) : (
                                            review.userName?.charAt(0)?.toUpperCase() || 'K'
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-zinc-900">{review.userName}</h4>
                                        {renderStars(review.rating)}
                                    </div>
                                </div>
                                <span className="text-xs text-zinc-400">{formatDate(review.createdAt)}</span>
                            </div>

                            {/* Tour Info */}
                            <div className="flex items-center gap-3 mb-3 p-3 bg-zinc-50 rounded-lg">
                                {review.tourImageUrl ? (
                                    <img
                                        src={review.tourImageUrl}
                                        alt={review.tourName}
                                        className="w-12 h-12 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-lg bg-zinc-200 flex items-center justify-center">
                                        <Star size={16} className="text-zinc-400" />
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium text-zinc-900">{review.tourName}</p>
                                    <p className="text-xs text-zinc-500">Mã: {review.bookingCode}</p>
                                </div>
                            </div>

                            {/* Review Content */}
                            <p className="text-zinc-600 text-sm mb-4">{review.content}</p>

                            {/* Agent Reply Section */}
                            {review.agentReply ? (
                                // Show existing reply
                                <div className="bg-zinc-50 p-4 rounded-lg border-l-4 border-zinc-900">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-medium text-zinc-900">Phản hồi của bạn</span>
                                        <span className="text-xs text-zinc-400">• {formatDate(review.agentRepliedAt)}</span>
                                    </div>
                                    <p className="text-sm text-zinc-600">{review.agentReply}</p>
                                </div>
                            ) : replyingId === review.id ? (
                                // Show reply form
                                <div className="bg-zinc-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-medium text-zinc-900">Phản hồi của bạn</span>
                                    </div>
                                    <textarea
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        className="w-full bg-white border border-zinc-200 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                        placeholder="Viết câu trả lời..."
                                        rows={3}
                                    />
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button
                                            onClick={() => {
                                                setReplyingId(null);
                                                setReplyContent('');
                                            }}
                                            className="text-xs font-medium text-zinc-600 px-3 py-1.5 rounded-md hover:bg-zinc-100"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={() => handleReply(review.id)}
                                            disabled={submittingReply || !replyContent.trim()}
                                            className="text-xs font-medium text-white bg-zinc-900 px-3 py-1.5 rounded-md hover:bg-zinc-800 disabled:opacity-50 flex items-center gap-1"
                                        >
                                            {submittingReply ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <>
                                                    <Send size={14} />
                                                    Gửi phản hồi
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Show reply button
                                <button
                                    onClick={() => setReplyingId(review.id)}
                                    className="text-sm font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-2"
                                >
                                    <MessageCircle size={16} />
                                    Phản hồi đánh giá này
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Reviews;
