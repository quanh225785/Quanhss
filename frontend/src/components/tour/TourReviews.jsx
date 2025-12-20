import React, { useState, useEffect } from 'react';
import { Star, Loader2, MessageCircle, User } from 'lucide-react';
import { api } from '../../utils/api';

const TourReviews = ({ tourId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (tourId) {
            fetchReviews();
        }
    }, [tourId]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/reviews/tour/${tourId}`);
            if (response.data.code === 1000) {
                setReviews(response.data.result || []);
            }
        } catch (err) {
            console.error('Error fetching reviews:', err);
        } finally {
            setLoading(false);
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

    const getAverageRating = () => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        return (sum / reviews.length).toFixed(1);
    };

    if (loading) {
        return (
            <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-[2rem] p-6">
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-slate-400" size={24} />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-[2rem] p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-display font-bold text-slate-900 flex items-center gap-2">
                    <MessageCircle size={20} className="text-primary" />
                    Đánh giá từ khách hàng
                </h3>
                {reviews.length > 0 && (
                    <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl">
                        <Star size={16} className="text-amber-400 fill-amber-400" />
                        <span className="font-bold text-amber-700">{getAverageRating()}</span>
                        <span className="text-sm text-amber-600">({reviews.length} đánh giá)</span>
                    </div>
                )}
            </div>

            {reviews.length === 0 ? (
                <div className="text-center py-8">
                    <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Chưa có đánh giá nào cho tour này</p>
                    <p className="text-sm text-slate-400 mt-1">Hãy là người đầu tiên đánh giá!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white/80 rounded-2xl p-4 border border-slate-100">
                            {/* Review Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-bold text-sm overflow-hidden">
                                        {review.userAvatar ? (
                                            <img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" />
                                        ) : (
                                            review.userName?.charAt(0)?.toUpperCase() || 'K'
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{review.userName}</p>
                                        {renderStars(review.rating)}
                                    </div>
                                </div>
                                <span className="text-xs text-slate-400">{formatDate(review.createdAt)}</span>
                            </div>

                            {/* Review Content */}
                            <p className="text-slate-600 text-sm leading-relaxed">{review.content}</p>

                            {/* Agent Reply */}
                            {review.agentReply && (
                                <div className="mt-4 bg-primary/5 rounded-xl p-4 border border-primary/30">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                                            <User size={12} />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-700">Phản hồi từ đại lý</span>
                                        <span className="text-xs text-slate-400">• {formatDate(review.agentRepliedAt)}</span>
                                    </div>
                                    <p className="text-sm text-slate-600">{review.agentReply}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TourReviews;
