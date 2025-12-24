import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Heart,
    MapPin,
    Calendar,
    Route,
    Car,
    Bike,
    Loader2,
    ChevronRight,
    Star,
    HeartOff,
} from 'lucide-react';
import { api } from '../../utils/api';
import { formatDistance } from '../../utils/polylineUtils';

const MyFavorites = () => {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const response = await api.get('/favorites');
            if (response.data && response.data.code === 1000) {
                setFavorites(response.data.result || []);
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
            setFavorites([]);
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (e, tourId) => {
        e.stopPropagation();
        try {
            await api.delete(`/favorites/${tourId}`);
            setFavorites(prev => prev.filter(tour => tour.id !== tourId));
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    };

    const formatPrice = (price) => {
        if (!price) return 'Liên hệ';
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    const getTourImage = (tour) => {
        if (tour.imageUrl) return tour.imageUrl;
        const defaultImages = [
            "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
            "https://daivietourist.vn/wp-content/uploads/2025/05/gioi-thieu-ve-pho-co-hoi-an-8.jpg",
            "https://www.dalattrip.com/dulich/media/2017/12/thanh-pho-da-lat.jpg",
        ];
        return defaultImages[tour.id % defaultImages.length] || defaultImages[0];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-slate-500">Đang tải tour yêu thích...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Heart className="text-red-500" size={28} />
                    Tour Yêu Thích
                </h2>
                <p className="text-slate-500 mt-1">
                    Danh sách các tour bạn đã đánh dấu yêu thích
                </p>
            </div>

            {/* Favorites List */}
            {favorites.length === 0 ? (
                <div className="text-center py-20 bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-xl shadow-black/5">
                    <HeartOff className="w-20 h-20 text-slate-300 mx-auto mb-6" />
                    <h4 className="text-xl font-bold text-slate-700 mb-2">Chưa có tour yêu thích</h4>
                    <p className="text-slate-500 mb-8">
                        Khám phá và thêm các tour bạn thích vào danh sách này.
                    </p>
                    <button
                        onClick={() => navigate('/tours')}
                        className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                        Khám phá Tour
                    </button>
                </div>
            ) : (
                <>
                    <div className="text-sm text-slate-600">
                        Bạn có <span className="font-bold text-slate-900">{favorites.length}</span> tour yêu thích
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {favorites.map((tour) => (
                            <div
                                key={tour.id}
                                onClick={() => navigate(`/tour/${tour.id}`)}
                                className="group bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2.5rem] overflow-hidden cursor-pointer hover:bg-white/80 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-black/5"
                            >
                                {/* Tour Image */}
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={getTourImage(tour)}
                                        alt={tour.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>

                                    {/* Tags */}
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold rounded-full">
                                            {tour.numberOfDays || 1} ngày
                                        </span>
                                        {tour.isOptimized && (
                                            <span className="px-3 py-1 bg-primary/80 backdrop-blur-md border border-white/20 text-white text-xs font-bold rounded-full">
                                                Tối ưu
                                            </span>
                                        )}
                                    </div>

                                    {/* Remove Favorite Button */}
                                    <button
                                        onClick={(e) => removeFavorite(e, tour.id)}
                                        className="absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center bg-red-500 text-white hover:bg-red-600 transition-colors"
                                        title="Xóa khỏi yêu thích"
                                    >
                                        <Heart size={18} className="fill-current" />
                                    </button>
                                </div>

                                {/* Tour Info */}
                                <div className="p-5">
                                    <h3 className="text-lg font-display font-bold text-slate-900 mb-2 line-clamp-1">
                                        {tour.name}
                                    </h3>

                                    {/* Rating Display */}
                                    {tour.reviewCount > 0 && (
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <Star size={14} className="text-amber-400 fill-amber-400" />
                                            <span className="text-sm font-medium text-slate-900">
                                                {tour.averageRating?.toFixed(1) || '0'}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                ({tour.reviewCount} đánh giá)
                                            </span>
                                        </div>
                                    )}

                                    {tour.description && (
                                        <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                                            {tour.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-3 text-sm text-slate-500 mb-4 flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <MapPin size={14} className="text-secondary" />
                                            {tour.points?.length || 0} điểm
                                        </span>
                                        {tour.totalDistance && (
                                            <span className="flex items-center gap-1">
                                                <Route size={14} className="text-primary" />
                                                {formatDistance(tour.totalDistance)}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {tour.numberOfDays || 1} ngày
                                        </span>
                                        <span className="flex items-center gap-1 capitalize">
                                            {tour.vehicle === 'car' ? <Car size={14} /> : <Bike size={14} />}
                                            {tour.vehicle || 'N/A'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/60">
                                        <div>
                                            <span className="block text-xs text-slate-400 font-medium mb-1">bắt đầu từ</span>
                                            <span className="text-xl font-bold text-slate-900">
                                                {formatPrice(tour.price)}đ
                                            </span>
                                        </div>
                                        <button className="flex items-center gap-1 text-primary font-medium group-hover:text-secondary transition-colors">
                                            Xem chi tiết
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default MyFavorites;
