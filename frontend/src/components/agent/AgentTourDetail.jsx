import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import {
    ArrowLeft,
    MapPin,
    Clock,
    Calendar,
    Users,
    Loader2,
    AlertCircle,
    CheckCircle,
    QrCode,
    X,
} from 'lucide-react';
import { api } from '../../utils/api';
import { formatDistance, formatDuration } from '../../utils/polylineUtils';
import TourMap from './TourMap';
import QrScanner from './QrScanner';

const AgentTourDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tour, setTour] = useState(null);
    const [tripStats, setTripStats] = useState({ activeTrips: 0, totalTrips: 0, totalParticipants: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeDay, setActiveDay] = useState(1);
    const [showQrScanner, setShowQrScanner] = useState(false);
    const [checkInStatus, setCheckInStatus] = useState(null);

    useEffect(() => {
        fetchTourDetails();
        fetchTripStats();
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

    const fetchTripStats = async () => {
        try {
            const response = await api.get(`/trips/tour/${id}`);
            if (response.data.code === 1000) {
                const trips = response.data.result || [];
                const activeTrips = trips.filter(t => t.isActive).length;
                const totalParticipants = trips.reduce((sum, t) => sum + (t.currentParticipants || 0), 0);
                setTripStats({
                    activeTrips,
                    totalTrips: trips.length,
                    totalParticipants,
                });
            }
        } catch (err) {
            console.error('Error fetching trip stats:', err);
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

    const handleScanSuccess = async (scannedCode) => {
        try {
            setShowQrScanner(false);
            setCheckInStatus({ type: 'loading', message: 'Đang xử lý check-in...' });

            // Remove "BOOKING:" prefix if exists
            const bookingCode = scannedCode.replace(/^BOOKING:/i, '');

            const response = await api.put(`/bookings/checkin/${bookingCode}`);

            if (response.data.code === 1000) {
                setCheckInStatus({
                    type: 'success',
                    message: `Check-in thành công! Mã đặt chỗ: ${bookingCode}`,
                    data: response.data.result
                });
                // Auto hide success message after 5 seconds
                setTimeout(() => setCheckInStatus(null), 5000);
            }
        } catch (err) {
            console.error('Check-in error:', err);
            setCheckInStatus({
                type: 'error',
                message: err.response?.data?.message || 'Có lỗi xảy ra khi check-in. Vui lòng thử lại.'
            });
            // Auto hide error message after 5 seconds
            setTimeout(() => setCheckInStatus(null), 5000);
        }
    };

    const handleScanError = (error) => {
        console.error('QR Scan error:', error);
        setCheckInStatus({
            type: 'error',
            message: 'Có lỗi xảy ra khi quét mã QR. Vui lòng thử lại.'
        });
        setTimeout(() => setCheckInStatus(null), 3000);
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
            {/* Check-in Status Alert */}
            {checkInStatus && (
                <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg border ${checkInStatus.type === 'success' ? 'bg-green-50 border-green-200' :
                        checkInStatus.type === 'error' ? 'bg-red-50 border-red-200' :
                            'bg-blue-50 border-blue-200'
                    }`}>
                    <div className="flex items-start gap-3">
                        {checkInStatus.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />}
                        {checkInStatus.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
                        {checkInStatus.type === 'loading' && <Loader2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 animate-spin" />}
                        <div className="flex-1">
                            <p className={`font-medium ${checkInStatus.type === 'success' ? 'text-green-900' :
                                    checkInStatus.type === 'error' ? 'text-red-900' :
                                        'text-blue-900'
                                }`}>
                                {checkInStatus.message}
                            </p>
                            {checkInStatus.data && (
                                <div className="mt-2 text-sm text-green-700">
                                    <p>Người đặt: {checkInStatus.data.userName}</p>
                                    <p>Số người: {checkInStatus.data.numberOfParticipants || 1}</p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setCheckInStatus(null)}
                            className="text-zinc-400 hover:text-zinc-600"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* QR Scanner Modal */}
            <QrScanner
                isOpen={showQrScanner}
                onClose={() => setShowQrScanner(false)}
                onScanSuccess={handleScanSuccess}
                onScanError={handleScanError}
            />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/agent/tours')}
                        className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{tour.name}</h1>
                        <p className="text-zinc-500">Chi tiết tour</p>
                    </div>
                </div>
                {tour.status === 'APPROVED' && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowQrScanner(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <QrCode size={16} />
                            Quét QR Check-in
                        </button>
                        <button
                            onClick={() => navigate(`/agent/tours/${id}/trips`)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            <Calendar size={16} />
                            Quản lý chuyến
                        </button>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-zinc-200 rounded-xl p-4 text-center">
                    <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{tripStats.totalParticipants}</p>
                    <p className="text-xs text-zinc-500">Tổng người đăng ký</p>
                </div>
                <div className="bg-white border border-zinc-200 rounded-xl p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{tripStats.activeTrips}</p>
                    <p className="text-xs text-zinc-500">Chuyến đang mở</p>
                </div>
                <div className="bg-white border border-zinc-200 rounded-xl p-4 text-center">
                    <Calendar className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{tripStats.totalTrips}</p>
                    <p className="text-xs text-zinc-500">Tổng số chuyến</p>
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
    );
};

export default AgentTourDetail;
