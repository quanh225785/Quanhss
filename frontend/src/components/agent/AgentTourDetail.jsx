import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    MapPin,
    Clock,
    Calendar,
    Route,
    Car,
    Users,
    Loader2,
    AlertCircle,
    CheckCircle,
    Phone,
    User,
    QrCode,
    Check,
} from 'lucide-react';
import { api } from '../../utils/api';
import { formatDistance, formatDuration } from '../../utils/polylineUtils';
import TourMap from './TourMap';

const AgentTourDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tour, setTour] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingsLoading, setBookingsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeDay, setActiveDay] = useState(1);
    const [checkingIn, setCheckingIn] = useState(null);

    useEffect(() => {
        fetchTourDetails();
        fetchBookings();
    }, [id]);

    const fetchTourDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/tours/${id}`);
            if (response.data.code === 1000) {
                setTour(response.data.result);
            }
        } catch (err) {
            console.error('Error fetching tour:', err);
            setError('Không thể tải thông tin tour');
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            setBookingsLoading(true);
            const response = await api.get(`/bookings/tour/${id}`);
            if (response.data.code === 1000) {
                setBookings(response.data.result || []);
            }
        } catch (err) {
            console.error('Error fetching bookings:', err);
        } finally {
            setBookingsLoading(false);
        }
    };

    const handleCheckIn = async (bookingCode) => {
        setCheckingIn(bookingCode);
        try {
            const response = await api.put(`/bookings/checkin/${bookingCode}`);
            if (response.data.code === 1000) {
                fetchBookings(); // Refresh bookings
            }
        } catch (err) {
            console.error('Error checking in:', err);
            alert(err.response?.data?.message || 'Không thể check-in');
        } finally {
            setCheckingIn(null);
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
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status) => {
        const config = {
            PENDING: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Chờ xác nhận' },
            CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Đã xác nhận' },
            COMPLETED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Đã check-in' },
            CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Đã hủy' },
        };
        const c = config[status] || config.PENDING;
        return <span className={`px-2 py-1 rounded-lg text-xs font-medium ${c.bg} ${c.text}`}>{c.label}</span>;
    };

    const getPaymentBadge = (status) => {
        const config = {
            PENDING: { bg: 'bg-slate-100', text: 'text-slate-600', label: '💰 Chờ TT' },
            PAID: { bg: 'bg-green-100', text: 'text-green-700', label: '✅ Đã TT' },
            REFUNDED: { bg: 'bg-orange-100', text: 'text-orange-700', label: '↩️ Hoàn tiền' },
        };
        const c = config[status] || config.PENDING;
        return <span className={`px-2 py-1 rounded-lg text-xs font-medium ${c.bg} ${c.text}`}>{c.label}</span>;
    };

    // Group points by day
    const getPointsByDay = () => {
        if (!tour?.points) return {};
        const grouped = {};
        tour.points.forEach((point) => {
            const day = point.dayNumber || 1;
            if (!grouped[day]) grouped[day] = [];
            grouped[day].push(point);
        });
        Object.keys(grouped).forEach((day) => {
            grouped[day].sort((a, b) => {
                if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
                return (a.orderIndex || 0) - (b.orderIndex || 0);
            });
        });
        return grouped;
    };

    const pointsByDay = getPointsByDay();
    const dayTabs = Array.from({ length: tour?.numberOfDays || 1 }, (_, i) => i + 1);

    // Stats
    const totalParticipants = bookings.reduce((sum, b) =>
        b.status !== 'CANCELLED' ? sum + (b.numberOfParticipants || 0) : sum, 0
    );
    const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED').length;
    const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-zinc-400" size={32} />
            </div>
        );
    }

    if (error || !tour) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-zinc-900 mb-2">{error || 'Tour không tồn tại'}</h3>
                <button
                    onClick={() => navigate(-1)}
                    className="text-primary hover:underline"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/agent/tours')}
                    className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{tour.name}</h1>
                    <p className="text-zinc-500">Chi tiết tour và quản lý đơn đặt</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Tour Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white border border-zinc-200 rounded-xl p-4 text-center">
                            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold">{totalParticipants}</p>
                            <p className="text-xs text-zinc-500">Tổng người đăng ký</p>
                        </div>
                        <div className="bg-white border border-zinc-200 rounded-xl p-4 text-center">
                            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold">{confirmedBookings}</p>
                            <p className="text-xs text-zinc-500">Đã xác nhận</p>
                        </div>
                        <div className="bg-white border border-zinc-200 rounded-xl p-4 text-center">
                            <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold">{pendingBookings}</p>
                            <p className="text-xs text-zinc-500">Chờ xác nhận</p>
                        </div>
                        <div className="bg-white border border-zinc-200 rounded-xl p-4 text-center">
                            <MapPin className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold">{tour.points?.length || 0}</p>
                            <p className="text-xs text-zinc-500">Điểm đến</p>
                        </div>
                    </div>

                    {/* Map */}
                    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                        <TourMap
                            points={tour.points?.map(p => ({
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

                    {/* Itinerary */}
                    <div className="bg-white border border-zinc-200 rounded-xl p-6">
                        <h3 className="font-bold text-lg mb-4">📅 Lịch trình</h3>

                        {dayTabs.length > 1 && (
                            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                {dayTabs.map(day => (
                                    <button
                                        key={day}
                                        onClick={() => setActiveDay(day)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeDay === day
                                                ? 'bg-zinc-900 text-white'
                                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                            }`}
                                    >
                                        Ngày {day}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="space-y-3">
                            {pointsByDay[activeDay]?.map((point, index) => (
                                <div key={point.id || index} className="flex gap-3 p-3 bg-zinc-50 rounded-lg">
                                    <div className="w-12 text-right text-sm font-medium text-blue-600">
                                        {point.startTime || '--:--'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-zinc-900">
                                            {point.activity || point.locationName}
                                        </p>
                                        {point.locationName && point.activity && (
                                            <p className="text-xs text-zinc-500">📍 {point.locationName}</p>
                                        )}
                                    </div>
                                </div>
                            )) || (
                                    <p className="text-zinc-400 text-center py-4">Chưa có lịch trình</p>
                                )}
                        </div>
                    </div>
                </div>

                {/* Right: Bookings List */}
                <div className="space-y-4">
                    <div className="bg-white border border-zinc-200 rounded-xl p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            📋 Danh sách đặt tour
                            <span className="text-sm font-normal text-zinc-500">
                                ({bookings.length} đơn)
                            </span>
                        </h3>

                        {bookingsLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="animate-spin text-zinc-400" size={24} />
                            </div>
                        ) : bookings.length === 0 ? (
                            <div className="text-center py-8 text-zinc-400">
                                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Chưa có ai đặt tour này</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                {bookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className={`p-4 rounded-xl border ${booking.status === 'CANCELLED'
                                                ? 'bg-red-50 border-red-200 opacity-60'
                                                : 'bg-zinc-50 border-zinc-200'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="text-xs font-mono text-primary">
                                                {booking.bookingCode}
                                            </span>
                                            <div className="flex gap-1">
                                                {getStatusBadge(booking.status)}
                                                {getPaymentBadge(booking.paymentStatus)}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm">
                                                <User size={14} className="text-zinc-400" />
                                                <span className="font-medium">{booking.userName}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-zinc-600">
                                                <Phone size={14} className="text-zinc-400" />
                                                <span>{booking.contactPhone || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-zinc-600">
                                                <Users size={14} className="text-zinc-400" />
                                                <span>{booking.numberOfParticipants} người</span>
                                            </div>
                                        </div>

                                        {booking.participantNames?.length > 0 && (
                                            <div className="mt-2 text-xs text-zinc-500">
                                                <span className="font-medium">Người tham gia: </span>
                                                {booking.participantNames.join(', ')}
                                            </div>
                                        )}

                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-sm font-bold text-primary">
                                                {formatPrice(booking.totalPrice)}
                                            </span>

                                            {booking.status === 'CONFIRMED' && (
                                                <button
                                                    onClick={() => handleCheckIn(booking.bookingCode)}
                                                    disabled={checkingIn === booking.bookingCode}
                                                    className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                                                >
                                                    {checkingIn === booking.bookingCode ? (
                                                        <Loader2 size={12} className="animate-spin" />
                                                    ) : (
                                                        <Check size={12} />
                                                    )}
                                                    Check-in
                                                </button>
                                            )}

                                            {booking.status === 'COMPLETED' && (
                                                <span className="text-xs text-green-600 font-medium">
                                                    ✓ Đã check-in
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-2 text-xs text-zinc-400">
                                            Đặt lúc: {formatDate(booking.createdAt)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentTourDetail;
