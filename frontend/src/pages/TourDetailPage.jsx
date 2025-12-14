import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    MapPin,
    Clock,
    Calendar,
    Route,
    Car,
    User,
    Star,
    Heart,
    Share2,
    ChevronRight,
    Loader2,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';
import { api } from '../utils/api';
import { formatDistance, formatDuration } from '../utils/polylineUtils';
import TourMap from '../components/agent/TourMap';

const TourDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [activeDay, setActiveDay] = useState(1);

    useEffect(() => {
        fetchTourDetails();
    }, [id]);

    const fetchTourDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/tours/${id}`);
            setTour(response.data.result);
            setError(null);
        } catch (err) {
            console.error('Error fetching tour details:', err);
            setError('Không thể tải thông tin tour. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        if (!price) return 'Liên hệ';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    // Group points by day
    const getPointsByDay = () => {
        if (!tour?.points) return {};
        const grouped = {};
        tour.points.forEach((point) => {
            const day = point.dayNumber || 1;
            if (!grouped[day]) {
                grouped[day] = [];
            }
            grouped[day].push(point);
        });
        // Sort points within each day by startTime or orderIndex
        Object.keys(grouped).forEach((day) => {
            grouped[day].sort((a, b) => {
                if (a.startTime && b.startTime) {
                    return a.startTime.localeCompare(b.startTime);
                }
                return (a.orderIndex || 0) - (b.orderIndex || 0);
            });
        });
        return grouped;
    };

    const getDayTabs = () => {
        const numberOfDays = tour?.numberOfDays || 1;
        return Array.from({ length: numberOfDays }, (_, i) => i + 1);
    };

    const pointsByDay = getPointsByDay();
    const dayTabs = getDayTabs();

    if (loading) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-slate-600">Đang tải thông tin tour...</p>
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

    if (!tour) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <div className="text-center bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/60 shadow-lg max-w-md">
                    <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy tour</h2>
                    <p className="text-slate-600 mb-6">Tour này không tồn tại hoặc đã bị xóa.</p>
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
        <div className="min-h-screen bg-surface font-sans">
            {/* Ambient Background */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/5 blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Header */}
            <header className="sticky top-0 bg-white/70 backdrop-blur-xl border-b border-white/40 z-50">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-xl hover:bg-white/80 transition-colors"
                        >
                            <ArrowLeft size={24} className="text-slate-700" />
                        </button>
                        <div>
                            <h1 className="text-xl font-display font-bold text-slate-900 line-clamp-1">
                                {tour.name}
                            </h1>
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                                <User size={14} />
                                Tạo bởi: {tour.createdByUsername}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsFavorite(!isFavorite)}
                            className={`p-3 rounded-xl border transition-all ${isFavorite
                                ? 'bg-red-50 border-red-200 text-red-500'
                                : 'bg-white/60 border-white/60 text-slate-600 hover:text-red-500'
                                }`}
                        >
                            <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
                        </button>
                        <button className="p-3 rounded-xl bg-white/60 border border-white/60 text-slate-600 hover:bg-white/80 transition-colors">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Map Section */}
                        <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-[2rem] overflow-hidden">
                            <TourMap
                                points={tour.points?.map((p) => ({
                                    latitude: p.latitude,
                                    longitude: p.longitude,
                                    name: p.locationName || p.activity,
                                    orderIndex: p.orderIndex,
                                })) || []}
                                routePolyline={tour.routePolyline}
                                totalDistance={tour.totalDistance}
                                totalTime={tour.totalTime}
                            />
                        </div>

                        {/* Tour Info Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl p-4 text-center">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Calendar className="text-primary" size={24} />
                                </div>
                                <p className="text-2xl font-bold text-slate-900">{tour.numberOfDays || 1}</p>
                                <p className="text-sm text-slate-500">Ngày</p>
                            </div>
                            <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl p-4 text-center">
                                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <MapPin className="text-secondary" size={24} />
                                </div>
                                <p className="text-2xl font-bold text-slate-900">{tour.points?.length || 0}</p>
                                <p className="text-sm text-slate-500">Điểm đến</p>
                            </div>
                            <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl p-4 text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Route className="text-green-600" size={24} />
                                </div>
                                <p className="text-2xl font-bold text-slate-900">
                                    {tour.totalDistance ? formatDistance(tour.totalDistance) : '--'}
                                </p>
                                <p className="text-sm text-slate-500">Khoảng cách</p>
                            </div>
                            <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl p-4 text-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Car className="text-purple-600" size={24} />
                                </div>
                                <p className="text-2xl font-bold text-slate-900 capitalize">{tour.vehicle || 'N/A'}</p>
                                <p className="text-sm text-slate-500">Phương tiện</p>
                            </div>
                        </div>

                        {/* Description */}
                        {tour.description && (
                            <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-[2rem] p-6">
                                <h3 className="text-lg font-display font-bold text-slate-900 mb-4">Mô tả tour</h3>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                                    {tour.description}
                                </p>
                            </div>
                        )}

                        {/* Itinerary */}
                        <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-[2rem] p-6">
                            <h3 className="text-lg font-display font-bold text-slate-900 mb-4">Lịch trình chi tiết</h3>

                            {/* Day Tabs */}
                            {dayTabs.length > 1 && (
                                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                                    {dayTabs.map((day) => (
                                        <button
                                            key={day}
                                            onClick={() => setActiveDay(day)}
                                            className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${activeDay === day
                                                ? 'bg-primary text-white shadow-md'
                                                : 'bg-white/80 text-slate-600 hover:bg-white border border-slate-200'
                                                }`}
                                        >
                                            Ngày {day}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Day Content */}
                            <div className="space-y-4">
                                {pointsByDay[activeDay]?.length > 0 ? (
                                    pointsByDay[activeDay].map((point, index) => (
                                        <div
                                            key={point.id || index}
                                            className="relative flex gap-4 group"
                                        >
                                            {/* Timeline */}
                                            <div className="flex flex-col items-center">
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md ${index === 0
                                                        ? 'bg-green-500'
                                                        : index === pointsByDay[activeDay].length - 1
                                                            ? 'bg-red-500'
                                                            : 'bg-primary'
                                                        }`}
                                                >
                                                    {index + 1}
                                                </div>
                                                {index < pointsByDay[activeDay].length - 1 && (
                                                    <div className="w-0.5 flex-1 bg-slate-200 my-2"></div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 pb-6">
                                                <div className="bg-white/80 rounded-2xl p-4 border border-slate-100 hover:shadow-md transition-shadow">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            {point.startTime && (
                                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full mb-2">
                                                                    <Clock size={12} />
                                                                    {point.startTime}
                                                                </span>
                                                            )}
                                                            <h4 className="font-bold text-slate-900">
                                                                {point.locationName || point.activity || `Điểm ${index + 1}`}
                                                            </h4>
                                                        </div>
                                                        {point.stayDurationMinutes && (
                                                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                                                                {point.stayDurationMinutes} phút
                                                            </span>
                                                        )}
                                                    </div>

                                                    {point.locationAddress && (
                                                        <p className="text-sm text-slate-500 flex items-start gap-1 mb-2">
                                                            <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                                                            {point.locationAddress}
                                                        </p>
                                                    )}

                                                    {point.activity && point.locationName && (
                                                        <p className="text-sm text-slate-600 mb-2">
                                                            <strong>Hoạt động:</strong> {point.activity}
                                                        </p>
                                                    )}

                                                    {point.note && (
                                                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">
                                                            {point.note}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-slate-500">
                                        <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                        <p>Chưa có lịch trình cho ngày này</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
                        {/* Booking Card */}
                        <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-xl rounded-[2rem] p-6">
                            <div className="mb-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-display font-bold text-slate-900">
                                        {formatPrice(tour.price)}
                                    </span>
                                    <span className="text-slate-500">/người</span>
                                </div>
                                {tour.isOptimized && (
                                    <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                        <CheckCircle size={12} />
                                        Tuyến đường tối ưu
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                                    <span className="text-slate-600">Thời gian</span>
                                    <span className="font-medium text-slate-900">{tour.numberOfDays || 1} ngày</span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                                    <span className="text-slate-600">Số điểm đến</span>
                                    <span className="font-medium text-slate-900">{tour.points?.length || 0} điểm</span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                                    <span className="text-slate-600">Phương tiện</span>
                                    <span className="font-medium text-slate-900 capitalize">{tour.vehicle || 'N/A'}</span>
                                </div>
                                {tour.totalTime && (
                                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                                        <span className="text-slate-600">Thời gian di chuyển</span>
                                        <span className="font-medium text-slate-900">{formatDuration(tour.totalTime)}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between py-3">
                                    <span className="text-slate-600">Ngày tạo</span>
                                    <span className="font-medium text-slate-900">{formatDate(tour.createdAt)}</span>
                                </div>
                            </div>

                            <button className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2">
                                Đặt tour ngay
                                <ChevronRight size={20} />
                            </button>

                            <p className="text-center text-xs text-slate-500 mt-4">
                                Miễn phí hủy trước 7 ngày
                            </p>
                        </div>

                        {/* Agent Info */}
                        <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-[2rem] p-6">
                            <h3 className="text-lg font-display font-bold text-slate-900 mb-4">Thông tin đại lý</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-xl font-bold shadow-md">
                                    {tour.createdByUsername?.charAt(0)?.toUpperCase() || 'A'}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{tour.createdByUsername}</p>
                                    <p className="text-sm text-slate-500">Đại lý du lịch</p>
                                </div>
                            </div>
                            <button className="w-full mt-4 py-3 border border-primary text-primary font-medium rounded-xl hover:bg-primary/5 transition-colors">
                                Liên hệ đại lý
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TourDetailPage;
