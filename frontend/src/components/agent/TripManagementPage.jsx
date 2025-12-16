import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Plus,
    Calendar,
    Users,
    Loader2,
    Trash2,
    Edit,
    Check,
    AlertCircle,
    Phone,
    User,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { FaMoneyBillAlt, FaRegCheckCircle } from "react-icons/fa";
import { PiKeyReturnBold } from "react-icons/pi";
import { api } from '../../utils/api';

const TripManagementPage = () => {
    const { id: tourId } = useParams();
    const navigate = useNavigate();

    const [tour, setTour] = useState(null);
    const [trips, setTrips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form for new/edit trip
    const [showForm, setShowForm] = useState(false);
    const [editingTrip, setEditingTrip] = useState(null);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        maxParticipants: '',
    });

    // Expanded trips for showing bookings
    const [expandedTrips, setExpandedTrips] = useState({});
    const [tripBookings, setTripBookings] = useState({});
    const [loadingBookings, setLoadingBookings] = useState({});
    const [checkingIn, setCheckingIn] = useState(null);

    useEffect(() => {
        fetchTourAndTrips();
    }, [tourId]);

    const fetchTourAndTrips = async () => {
        setIsLoading(true);
        try {
            const [tourResponse, tripsResponse] = await Promise.all([
                api.get(`/tours/${tourId}`),
                api.get(`/trips/tour/${tourId}`),
            ]);

            if (tourResponse.data.code === 1000) {
                setTour(tourResponse.data.result);
            }
            if (tripsResponse.data.code === 1000) {
                setTrips(tripsResponse.data.result || []);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Không thể tải thông tin');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTrips = async () => {
        try {
            const response = await api.get(`/trips/tour/${tourId}`);
            if (response.data.code === 1000) {
                setTrips(response.data.result || []);
            }
        } catch (err) {
            console.error('Error fetching trips:', err);
        }
    };

    const fetchBookingsForTrip = async (tripId) => {
        setLoadingBookings(prev => ({ ...prev, [tripId]: true }));
        try {
            const response = await api.get(`/bookings/trip/${tripId}`);
            if (response.data.code === 1000) {
                setTripBookings(prev => ({
                    ...prev,
                    [tripId]: response.data.result || [],
                }));
            }
        } catch (err) {
            console.error('Error fetching bookings:', err);
        } finally {
            setLoadingBookings(prev => ({ ...prev, [tripId]: false }));
        }
    };

    const toggleTripExpand = (tripId) => {
        const newExpanded = !expandedTrips[tripId];
        setExpandedTrips(prev => ({ ...prev, [tripId]: newExpanded }));

        if (newExpanded && !tripBookings[tripId]) {
            fetchBookingsForTrip(tripId);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.startDate || !formData.endDate || !formData.maxParticipants) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            setError('Ngày kết thúc phải sau ngày bắt đầu');
            return;
        }

        setIsSubmitting(true);

        try {
            if (editingTrip) {
                await api.put(`/trips/${editingTrip.id}`, {
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    maxParticipants: parseInt(formData.maxParticipants),
                });
            } else {
                await api.post('/trips', {
                    tourId: parseInt(tourId),
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    maxParticipants: parseInt(formData.maxParticipants),
                });
            }

            await fetchTrips();
            setShowForm(false);
            setEditingTrip(null);
            setFormData({ startDate: '', endDate: '', maxParticipants: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể lưu chuyến. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (trip) => {
        setEditingTrip(trip);
        setFormData({
            startDate: trip.startDate ? new Date(trip.startDate).toISOString().slice(0, 16) : '',
            endDate: trip.endDate ? new Date(trip.endDate).toISOString().slice(0, 16) : '',
            maxParticipants: trip.maxParticipants?.toString() || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (tripId) => {
        if (!window.confirm('Bạn có chắc muốn xóa chuyến này?')) return;

        try {
            await api.delete(`/trips/${tripId}`);
            await fetchTrips();
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể xóa chuyến');
        }
    };

    const handleToggleActive = async (trip) => {
        try {
            await api.put(`/trips/${trip.id}`, {
                isActive: !trip.isActive,
            });
            await fetchTrips();
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể cập nhật trạng thái');
        }
    };

    const handleCheckIn = async (bookingCode, tripId) => {
        setCheckingIn(bookingCode);
        try {
            const response = await api.put(`/bookings/checkin/${bookingCode}`);
            if (response.data.code === 1000) {
                await fetchBookingsForTrip(tripId);
            }
        } catch (err) {
            console.error('Error checking in:', err);
            alert(err.response?.data?.message || 'Không thể check-in');
        } finally {
            setCheckingIn(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatPrice = (price) => {
        if (!price) return 'Liên hệ';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
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
            PENDING: { bg: 'bg-slate-100', text: 'text-slate-600', label: <><FaMoneyBillAlt className="inline mr-1 text-amber-500" /> Chờ TT</> },
            PAID: { bg: 'bg-green-100', text: 'text-green-700', label: <><FaRegCheckCircle className="inline mr-1 text-green-500" /> Đã TT</> },
            REFUNDED: { bg: 'bg-orange-100', text: 'text-orange-700', label: <><PiKeyReturnBold className="inline mr-1 text-blue-500" /> Hoàn tiền</> },
        };
        const c = config[status] || config.PENDING;
        return <span className={`px-2 py-1 rounded-lg text-xs font-medium ${c.bg} ${c.text}`}>{c.label}</span>;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-zinc-400" size={32} />
            </div>
        );
    }

    if (!tour) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-zinc-900 mb-2">Tour không tồn tại</h3>
                <button
                    onClick={() => navigate('/agent/tours')}
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
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight">Quản lý chuyến</h1>
                    <p className="text-zinc-500">{tour.name}</p>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                    <AlertCircle size={16} />
                    <span className="text-sm">{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">×</button>
                </div>
            )}

            {/* Add Trip Button */}
            {!showForm && (
                <button
                    onClick={() => {
                        setEditingTrip(null);
                        setFormData({ startDate: '', endDate: '', maxParticipants: '' });
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    <Plus size={16} />
                    Thêm chuyến mới
                </button>
            )}

            {/* Trip Form */}
            {showForm && (
                <div className="p-4 bg-white rounded-xl border border-zinc-200">
                    <h3 className="font-medium text-zinc-900 mb-4">
                        {editingTrip ? 'Sửa chuyến' : 'Thêm chuyến mới'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-700">
                                    Ngày bắt đầu <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-700">
                                    Ngày kết thúc <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                    min={formData.startDate}
                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-700">
                                    Số người tối đa <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.maxParticipants}
                                    onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: e.target.value }))}
                                    placeholder="VD: 20"
                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Check size={16} />
                                )}
                                {editingTrip ? 'Cập nhật' : 'Tạo chuyến'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingTrip(null);
                                }}
                                className="px-4 py-2 text-zinc-700 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors"
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Trips List */}
            <div className="space-y-4">
                <h3 className="font-medium text-zinc-900 flex items-center gap-2">
                    <Calendar size={16} />
                    Danh sách chuyến ({trips.length})
                </h3>

                {trips.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500 bg-white rounded-xl border border-zinc-200">
                        <Calendar size={48} className="mx-auto mb-3 opacity-50" />
                        <p className="font-medium">Chưa có chuyến nào được tạo</p>
                        <p className="text-sm">Nhấn "Thêm chuyến mới" để bắt đầu</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {trips.map((trip) => (
                            <div
                                key={trip.id}
                                className={`bg-white border rounded-xl overflow-hidden ${trip.isActive ? 'border-zinc-200' : 'border-zinc-300 bg-zinc-50'}`}
                            >
                                {/* Trip Header */}
                                <div
                                    className="p-4 cursor-pointer hover:bg-zinc-50 transition-colors"
                                    onClick={() => toggleTripExpand(trip.id)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${trip.isFull
                                                    ? 'bg-red-100 text-red-700'
                                                    : trip.isActive
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-zinc-200 text-zinc-600'
                                                    }`}>
                                                    {trip.isFull ? 'Đã đầy' : trip.isActive ? 'Đang mở' : 'Đã đóng'}
                                                </span>
                                                <span className="text-sm text-zinc-500">
                                                    #{trip.id}
                                                </span>
                                            </div>
                                            <div className="text-sm text-zinc-600">
                                                <span className="font-medium">Thời gian:</span>{' '}
                                                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="flex items-center gap-1">
                                                    <Users size={14} />
                                                    <span className="font-medium">{trip.currentParticipants || 0}</span>
                                                    <span className="text-zinc-500">/ {trip.maxParticipants}</span>
                                                </span>
                                                <span className="text-zinc-500">
                                                    Còn {trip.availableSlots || 0} chỗ
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleToggleActive(trip); }}
                                                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${trip.isActive
                                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                    }`}
                                            >
                                                {trip.isActive ? 'Đóng' : 'Mở'}
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleEdit(trip); }}
                                                className="p-2 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            {(trip.currentParticipants || 0) === 0 && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(trip.id); }}
                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                            {expandedTrips[trip.id] ? (
                                                <ChevronUp size={20} className="text-zinc-400" />
                                            ) : (
                                                <ChevronDown size={20} className="text-zinc-400" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Bookings for this trip */}
                                {expandedTrips[trip.id] && (
                                    <div className="border-t border-zinc-200 p-4 bg-zinc-50">
                                        <h4 className="font-medium text-sm text-zinc-700 mb-3 flex items-center gap-2">
                                            <Users size={14} />
                                            Danh sách người đặt ({tripBookings[trip.id]?.length || 0})
                                        </h4>

                                        {loadingBookings[trip.id] ? (
                                            <div className="flex justify-center py-6">
                                                <Loader2 className="animate-spin text-zinc-400" size={24} />
                                            </div>
                                        ) : !tripBookings[trip.id] || tripBookings[trip.id].length === 0 ? (
                                            <div className="text-center py-6 text-zinc-400">
                                                <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">Chưa có ai đặt chuyến này</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {tripBookings[trip.id].map((booking) => (
                                                    <div
                                                        key={booking.id}
                                                        className={`p-4 rounded-xl border ${booking.status === 'CANCELLED'
                                                            ? 'bg-red-50 border-red-200 opacity-60'
                                                            : 'bg-white border-zinc-200'
                                                            }`}
                                                    >
                                                        <div className="flex items-start justify-between mb-2">
                                                            <span className="text-xs font-mono text-primary">
                                                                {booking.bookingCode}
                                                            </span>
                                                            <div className="flex gap-1 flex-wrap justify-end">
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

                                                        <div className="mt-3 flex items-center justify-between">
                                                            <span className="text-sm font-bold text-primary">
                                                                {formatPrice(booking.totalPrice)}
                                                            </span>

                                                            {booking.status === 'CONFIRMED' && (
                                                                <button
                                                                    onClick={() => handleCheckIn(booking.bookingCode, trip.id)}
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
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TripManagementPage;
