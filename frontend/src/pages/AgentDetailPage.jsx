import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    MapPin,
    Calendar,
    Star,
    Heart,
    Loader2,
    AlertCircle,
    MessageCircle,
    User,
    Award,
    TrendingUp,
    Clock,
    Flag,
} from 'lucide-react';
import { api } from '../utils/api';
import { startConversation } from '../utils/chatApi';
import { useToast } from '../context/ToastContext';
import ReportModal from '../components/shared/ReportModal';

const AgentDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [agent, setAgent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [contactingAgent, setContactingAgent] = useState(false);
    const [favorites, setFavorites] = useState(new Set());
    const [showReportModal, setShowReportModal] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        fetchAgentDetails();
        fetchFavorites();
    }, [id]);

    const fetchAgentDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/agent/profile/${id}`);
            setAgent(response.data.result);
            setError(null);
        } catch (err) {
            console.error('Error fetching agent details:', err);
            setError('Không thể tải thông tin đại lý. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const fetchFavorites = async () => {
        try {
            const response = await api.get('/favorites/ids');
            if (response.data.result) {
                setFavorites(new Set(response.data.result));
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
        }
    };

    const toggleFavorite = async (e, tourId) => {
        e.stopPropagation();
        e.preventDefault();

        const isFav = favorites.has(tourId);

        // Optimistic update
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (isFav) {
                newFavorites.delete(tourId);
            } else {
                newFavorites.add(tourId);
            }
            return newFavorites;
        });

        try {
            if (isFav) {
                await api.delete(`/favorites/${tourId}`);
            } else {
                await api.post(`/favorites/${tourId}`);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            // Revert on error
            setFavorites(prev => {
                const newFavorites = new Set(prev);
                if (isFav) {
                    newFavorites.add(tourId);
                } else {
                    newFavorites.delete(tourId);
                }
                return newFavorites;
            });
        }
    };

    const formatPrice = (price) => {
        if (!price) return 'Liên hệ';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const getAgentName = () => {
        if (agent?.firstName && agent?.lastName) {
            return `${agent.firstName} ${agent.lastName}`;
        }
        return agent?.username || 'Đại lý';
    };

    const handleContactAgent = async () => {
        try {
            setContactingAgent(true);
            // Start a generic conversation with the agent
            await startConversation(id, null, `Xin chào, tôi muốn tư vấn về các tour du lịch của bạn.`);
            navigate('/user/chat');
        } catch (error) {
            console.error('Failed to start conversation:', error);
            showToast({
                type: 'error',
                message: 'Lỗi liên hệ',
                description: 'Không thể liên hệ đại lý. Vui lòng thử lại.'
            });
        } finally {
            setContactingAgent(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-slate-600">Đang tải thông tin đại lý...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <div className="text-center bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/60 shadow-lg max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Có lỗi xảy ra</h2>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <div className="text-center bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/60 shadow-lg max-w-md">
                    <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy đại lý</h2>
                    <p className="text-slate-600 mb-6">Đại lý này không tồn tại.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-surface font-sans p-4 md:p-8">
            {/* Header */}
            <header className="sticky top-0 bg-white/70 backdrop-blur-xl border-b border-white/40 z-50 rounded-2xl mb-6">
                <div className="px-4 md:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-xl hover:bg-white/80 transition-colors"
                        >
                            <ArrowLeft size={24} className="text-slate-700" />
                        </button>
                        <div>
                            <h1 className="text-xl font-display font-bold text-slate-900">
                                Thông tin đại lý
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto">
                {/* Agent Profile Card */}
                <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-xl rounded-[2rem] p-8 mb-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-4xl font-bold shadow-lg overflow-hidden">
                                {agent.avatar ? (
                                    <img
                                        src={agent.avatar}
                                        alt={getAgentName()}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User size={48} />
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">
                                {getAgentName()}
                            </h2>
                            <p className="text-slate-500 mb-6 flex items-center gap-2">
                                <Award size={18} className="text-primary" />
                                Đại lý du lịch chuyên nghiệp
                            </p>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-primary/5 rounded-2xl p-4 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <TrendingUp size={20} className="text-primary" />
                                        <span className="text-2xl font-bold text-slate-900">
                                            {agent.totalTours || 0}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500">Tour đang hoạt động</p>
                                </div>
                                <div className="bg-yellow-50 rounded-2xl p-4 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <Star size={20} className="text-yellow-500 fill-yellow-400" />
                                        <span className="text-2xl font-bold text-slate-900">
                                            {agent.averageRating ? agent.averageRating.toFixed(1) : '--'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500">Đánh giá trung bình</p>
                                </div>
                                <div className="bg-green-50 rounded-2xl p-4 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <MessageCircle size={20} className="text-green-600" />
                                        <span className="text-2xl font-bold text-slate-900">
                                            {agent.totalReviews || 0}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500">Lượt đánh giá</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleContactAgent}
                                    disabled={contactingAgent}
                                    className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {contactingAgent ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <MessageCircle size={18} />
                                    )}
                                    Liên hệ đại lý
                                </button>
                                <button
                                    onClick={() => setShowReportModal(true)}
                                    className="px-4 py-3 border border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors flex items-center gap-2"
                                    title="Báo cáo đại lý"
                                >
                                    <Flag size={18} />
                                    Báo cáo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tours Section */}
                <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-[2rem] p-6">
                    <h3 className="text-xl font-display font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <MapPin size={24} className="text-primary" />
                        Tours của đại lý ({agent.tours?.length || 0})
                    </h3>

                    {agent.tours && agent.tours.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {agent.tours.map((tour) => (
                                <Link
                                    key={tour.id}
                                    to={`/tour/${tour.id}`}
                                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100"
                                >
                                    {/* Tour Image */}
                                    <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200">
                                        {(tour.imageUrls?.[0] || tour.imageUrl) ? (
                                            <img
                                                src={tour.imageUrls?.[0] || tour.imageUrl}
                                                alt={tour.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <MapPin size={48} className="text-slate-300" />
                                            </div>
                                        )}
                                        {/* Favorite Button */}
                                        <button
                                            onClick={(e) => toggleFavorite(e, tour.id)}
                                            className={`absolute top-3 right-3 p-2 rounded-full transition-all ${favorites.has(tour.id)
                                                ? 'bg-red-500 text-white'
                                                : 'bg-white/90 text-slate-600 hover:text-red-500'
                                                }`}
                                        >
                                            <Heart
                                                size={18}
                                                className={favorites.has(tour.id) ? 'fill-current' : ''}
                                            />
                                        </button>
                                        {/* Price Badge */}
                                        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md">
                                            <span className="text-primary font-bold">
                                                {formatPrice(tour.price)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Tour Info */}
                                    <div className="p-4">
                                        <h4 className="font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                            {tour.name}
                                        </h4>

                                        {/* Tour Meta */}
                                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {tour.numberOfDays} ngày
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin size={14} />
                                                {tour.points?.length || 0} điểm
                                            </span>
                                        </div>

                                        {/* Rating */}
                                        {tour.averageRating && (
                                            <div className="flex items-center gap-1 text-sm">
                                                <Star size={14} className="text-yellow-500 fill-yellow-400" />
                                                <span className="font-medium text-slate-900">
                                                    {tour.averageRating.toFixed(1)}
                                                </span>
                                                <span className="text-slate-400">
                                                    ({tour.reviewCount || 0} đánh giá)
                                                </span>
                                            </div>
                                        )}

                                        {/* Cities */}
                                        {tour.cities && tour.cities.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-1">
                                                {tour.cities.slice(0, 2).map((city, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600"
                                                    >
                                                        {city}
                                                    </span>
                                                ))}
                                                {tour.cities.length > 2 && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                        +{tour.cities.length - 2}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            <MapPin size={48} className="mx-auto mb-4 text-slate-300" />
                            <p>Đại lý này chưa có tour nào.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Report Modal */}
            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                targetType="AGENT"
                targetId={id}
                targetName={getAgentName()}
            />
        </div>
    );
};

export default AgentDetailPage;
