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
    Pencil,
} from 'lucide-react';
import { api } from '../../utils/api';
import { formatDistance, formatDuration } from '../../utils/polylineUtils';
import TourMap from './TourMap';
import QrScanner from './QrScanner';
import Toast from '../shared/Toast';
import ImageCarousel from '../common/ImageCarousel';
import EditTourModal from './EditTourModal';

const AgentTourDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tour, setTour] = useState(null);
    const [tripStats, setTripStats] = useState({ activeTrips: 0, totalTrips: 0, totalParticipants: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeDay, setActiveDay] = useState(1);
    const [showQrScanner, setShowQrScanner] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
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
            }
        } catch (err) {
            console.error('Check-in error:', err);
            setCheckInStatus({
                type: 'error',
                message: err.response?.data?.message || 'Có lỗi xảy ra khi check-in. Vui lòng thử lại.'
            });
        }
    };

    const handleScanError = (error) => {
        console.error('QR Scan error:', error);
        setCheckInStatus({
            type: 'error',
            message: 'Có lỗi xảy ra khi quét mã QR. Vui lòng thử lại.'
        });
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
            {/* Check-in Status Toast */}
            {checkInStatus && (
                <Toast
                    type={checkInStatus.type}
                    message={checkInStatus.message}
                    onClose={() => setCheckInStatus(null)}
                    duration={checkInStatus.type === 'loading' ? null : 5000}
                >
                    {checkInStatus.data && (
                        <div className="mt-2 text-sm opacity-90">
                            <p>Người đặt: <span className="font-semibold">{checkInStatus.data.userName}</span></p>
                            <p>Số người: <span className="font-semibold">{checkInStatus.data.numberOfParticipants || 1}</span></p>
                        </div>
                    )}
                </Toast>
            )}

            {/* QR Scanner Modal */}
            <QrScanner
                isOpen={showQrScanner}
                onClose={() => setShowQrScanner(false)}
                onScanSuccess={handleScanSuccess}
                onScanError={handleScanError}
            />

            {/* Header - Stacked in 2 rows with background for Title */}
            <div className="space-y-6">
                {/* Row 1: Back Button + Title with Background */}
                <div className="bg-white/70 backdrop-blur-2xl border border-white/40 p-8 rounded-[3rem] shadow-sm flex items-center gap-6">
                    <button
                        onClick={() => navigate('/agent/tours')}
                        className="p-4 rounded-2xl bg-white/50 border border-white/40 hover:bg-white transition-all text-slate-600 hover:text-primary"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-2 h-8 bg-primary rounded-full"></div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">
                                {tour.name}
                            </h1>
                        </div>
                        <p className="text-slate-500 font-bold ml-5 uppercase tracking-[0.2em] text-[10px]">
                            Quản lý chi tiết hành trình
                        </p>
                    </div>
                </div>

                {/* Row 2: Action Buttons */}
                {tour.status === 'APPROVED' && (
                    <div className="flex flex-wrap items-center gap-4 px-2">
                        <button
                            onClick={() => setShowQrScanner(true)}
                            className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/10 hover:-translate-y-0.5"
                        >
                            <QrCode size={20} />
                            Quét QR Check-in
                        </button>
                        <button
                            onClick={() => navigate(`/agent/tours/${id}/trips`)}
                            className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/10 hover:-translate-y-0.5"
                        >
                            <Calendar size={20} />
                            Quản lý chuyến
                        </button>
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="flex items-center gap-3 px-8 py-4 bg-white/50 border border-white/40 text-slate-700 font-black rounded-2xl hover:bg-white hover:border-slate-300 transition-all hover:-translate-y-0.5"
                        >
                            <Pencil size={20} />
                            Sửa Tour
                        </button>
                    </div>
                )}
            </div>

            {/* Tour Images */}
            {(tour.imageUrls?.length > 0 || tour.imageUrl) && (
                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-6 shadow-xl shadow-black/5">
                    <h3 className="font-bold text-lg mb-4">Ảnh Tour</h3>
                    <ImageCarousel
                        images={tour.imageUrls?.length > 0 ? tour.imageUrls : [tour.imageUrl]}
                        alt={tour.name}
                        autoSlide={false}
                    />
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl p-6 text-center shadow-xl shadow-black/5">
                    <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold font-sans">{tripStats.totalParticipants}</p>
                    <p className="text-xs text-zinc-500">Tổng người đăng ký</p>
                </div>
                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl p-6 text-center shadow-xl shadow-black/5">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold font-sans">{tripStats.activeTrips}</p>
                    <p className="text-xs text-zinc-500">Chuyến đang mở</p>
                </div>
                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl p-6 text-center shadow-xl shadow-black/5">
                    <Calendar className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold font-sans">{tripStats.totalTrips}</p>
                    <p className="text-xs text-zinc-500">Tổng số chuyến</p>
                </div>
                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl p-6 text-center shadow-xl shadow-black/5">
                    <MapPin className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold font-sans">{tour.points?.length || 0}</p>
                    <p className="text-xs text-zinc-500">Điểm đến</p>
                </div>
            </div>

            {/* Map */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5">
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
            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-10 shadow-xl shadow-black/5">
                <h3 className="font-bold text-xl mb-6">Lịch trình chi tiết</h3>

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
                                    <p className="text-xs text-zinc-500"> {point.locationName}</p>
                                )}
                            </div>
                        </div>
                    )) || (
                            <p className="text-zinc-400 text-center py-4">Chưa có lịch trình</p>
                        )}
                </div>
            </div>

            {/* Edit Tour Modal */}
            {showEditModal && (
                <EditTourModal
                    tour={tour}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={() => {
                        setShowEditModal(false);
                        fetchTourDetails();
                    }}
                />
            )}
        </div>
    );
};

export default AgentTourDetail;
