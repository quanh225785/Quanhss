import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Users, Phone, FileText, Loader2, CreditCard, Check,
    AlertCircle, MapPin, Calendar, Clock, ChevronRight
} from 'lucide-react';
import { api } from '../utils/api';

const BookingPage = () => {
    const { tourId } = useParams();
    const navigate = useNavigate();

    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [step, setStep] = useState(1); // 1: Info, 2: Payment, 3: Success
    const [booking, setBooking] = useState(null);

    const [numberOfParticipants, setNumberOfParticipants] = useState(1);
    const [participantNames, setParticipantNames] = useState(['']);
    const [contactPhone, setContactPhone] = useState('');
    const [note, setNote] = useState('');

    useEffect(() => {
        fetchTourDetails();
    }, [tourId]);

    const fetchTourDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/tours/${tourId}`);
            if (response.data.code === 1000) {
                setTour(response.data.result);
            } else {
                setError('Không tìm thấy tour');
            }
        } catch (err) {
            console.error('Error fetching tour:', err);
            setError('Không thể tải thông tin tour');
        } finally {
            setLoading(false);
        }
    };

    // Calculate max available spots
    const maxSpots = tour?.maxParticipants
        ? tour.maxParticipants - (tour.currentParticipants || 0)
        : 10;

    // Update participant names array when number changes
    useEffect(() => {
        setParticipantNames(prev => {
            const newNames = [...prev];
            while (newNames.length < numberOfParticipants) {
                newNames.push('');
            }
            while (newNames.length > numberOfParticipants) {
                newNames.pop();
            }
            return newNames;
        });
    }, [numberOfParticipants]);

    const handleParticipantNameChange = (index, value) => {
        setParticipantNames(prev => {
            const newNames = [...prev];
            newNames[index] = value;
            return newNames;
        });
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

    const totalPrice = (tour?.price || 0) * numberOfParticipants;

    const validateStep1 = () => {
        if (participantNames.some(name => !name.trim())) {
            setError('Vui lòng nhập đầy đủ họ tên của tất cả người tham gia');
            return false;
        }
        if (!contactPhone.trim()) {
            setError('Vui lòng nhập số điện thoại liên hệ');
            return false;
        }
        return true;
    };

    const handleCreateBooking = async () => {
        if (!validateStep1()) return;

        setSubmitting(true);
        setError(null);

        try {
            const response = await api.post('/bookings', {
                tourId: parseInt(tourId),
                participantNames: participantNames.map(n => n.trim()),
                contactPhone: contactPhone.trim(),
                note: note.trim() || null,
            });

            if (response.data.code === 1000) {
                setBooking(response.data.result);
                setStep(2);
            } else {
                setError(response.data.message || 'Có lỗi xảy ra');
            }
        } catch (err) {
            console.error('Error creating booking:', err);
            setError(err.response?.data?.message || 'Không thể tạo đơn đặt tour');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePayment = async () => {
        if (!booking) return;

        setSubmitting(true);
        setError(null);

        try {
            const response = await api.put(`/bookings/${booking.id}/pay`);

            if (response.data.code === 1000) {
                setBooking(response.data.result);
                setStep(3);
            } else {
                setError(response.data.message || 'Thanh toán thất bại');
            }
        } catch (err) {
            console.error('Error processing payment:', err);
            setError(err.response?.data?.message || 'Không thể xử lý thanh toán');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    if (error && !tour) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center gap-4">
                <AlertCircle size={48} className="text-red-400" />
                <p className="text-slate-600">{error}</p>
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
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="font-bold text-lg">
                            {step === 1 && 'Đặt tour'}
                            {step === 2 && 'Thanh toán'}
                            {step === 3 && 'Hoàn tất'}
                        </h1>
                        <p className="text-sm text-slate-500">{tour?.name}</p>
                    </div>
                </div>
            </header>

            {/* Progress Steps */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="flex items-center justify-center gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                        <React.Fragment key={s}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= s
                                    ? 'bg-primary text-white'
                                    : 'bg-slate-200 text-slate-500'
                                }`}>
                                {step > s ? <Check size={18} /> : s}
                            </div>
                            {s < 3 && (
                                <div className={`w-16 h-1 rounded-full transition-all ${step > s ? 'bg-primary' : 'bg-slate-200'
                                    }`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-3">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Step 1: Booking Info */}
                        {step === 1 && (
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-6">
                                <h2 className="text-xl font-bold">Thông tin đặt tour</h2>

                                {/* Number of Participants */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <Users size={16} className="inline mr-2" />
                                        Số người tham gia
                                    </label>
                                    <select
                                        value={numberOfParticipants}
                                        onChange={(e) => setNumberOfParticipants(parseInt(e.target.value))}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-lg"
                                    >
                                        {Array.from({ length: Math.min(maxSpots, 10) }, (_, i) => i + 1).map(n => (
                                            <option key={n} value={n}>{n} người</option>
                                        ))}
                                    </select>
                                    {tour?.maxParticipants && (
                                        <p className="text-sm text-slate-500 mt-2">
                                            Còn {maxSpots} chỗ trống (tối đa {tour.maxParticipants} người)
                                        </p>
                                    )}
                                </div>

                                {/* Participant Names */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Họ tên người tham gia <span className="text-red-500">*</span>
                                    </label>
                                    <div className="space-y-3">
                                        {participantNames.map((name, index) => (
                                            <div key={index} className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                                                    #{index + 1}
                                                </span>
                                                <input
                                                    type="text"
                                                    placeholder={`Nhập họ tên người thứ ${index + 1}`}
                                                    value={name}
                                                    onChange={(e) => handleParticipantNameChange(index, e.target.value)}
                                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Contact Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <Phone size={16} className="inline mr-2" />
                                        Số điện thoại liên hệ <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="0901234567"
                                        value={contactPhone}
                                        onChange={(e) => setContactPhone(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>

                                {/* Note */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <FileText size={16} className="inline mr-2" />
                                        Ghi chú (không bắt buộc)
                                    </label>
                                    <textarea
                                        placeholder="Yêu cầu đặc biệt, dị ứng thức ăn, v.v."
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Payment */}
                        {step === 2 && booking && (
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-6">
                                <h2 className="text-xl font-bold">Xác nhận thanh toán</h2>

                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-sm text-slate-500 mb-1">Mã đặt tour</p>
                                    <p className="text-2xl font-bold text-primary font-mono">{booking.bookingCode}</p>
                                </div>

                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                                    <p className="text-amber-800">
                                        💡 <strong>Lưu ý:</strong> Đây là thanh toán giả lập cho mục đích demo.
                                        Trong thực tế, bạn sẽ được chuyển đến cổng thanh toán an toàn.
                                    </p>
                                </div>

                                <div className="space-y-3 p-4 bg-slate-50 rounded-2xl">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Giá tour</span>
                                        <span className="font-medium">{formatPrice(tour?.price)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Số người tham gia</span>
                                        <span className="font-medium">x {booking.numberOfParticipants}</span>
                                    </div>
                                    <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                                        <span className="font-bold text-lg">Tổng cộng</span>
                                        <span className="font-bold text-2xl text-primary">{formatPrice(booking.totalPrice)}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all"
                                    >
                                        Quay lại
                                    </button>
                                    <button
                                        onClick={handlePayment}
                                        disabled={submitting}
                                        className="py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <Loader2 size={20} className="animate-spin" />
                                        ) : (
                                            <CreditCard size={20} />
                                        )}
                                        Thanh toán
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Success */}
                        {step === 3 && booking && (
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 text-center space-y-6">
                                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <Check size={48} className="text-green-600" />
                                </div>

                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Đặt tour thành công!</h2>
                                    <p className="text-slate-600">
                                        Cảm ơn bạn đã đặt tour. Mã đặt tour của bạn là:
                                    </p>
                                    <p className="text-3xl font-bold text-primary font-mono mt-2">{booking.bookingCode}</p>
                                </div>

                                {booking.qrCodeUrl && (
                                    <div className="p-6 bg-slate-50 rounded-2xl inline-block">
                                        <p className="text-sm text-slate-500 mb-3">QR Code check-in</p>
                                        <img
                                            src={booking.qrCodeUrl}
                                            alt="QR Code"
                                            className="w-48 h-48 mx-auto rounded-xl shadow-lg"
                                        />
                                        <p className="text-xs text-slate-400 mt-3">
                                            Xuất trình mã này khi check-in
                                        </p>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                    <Link
                                        to="/user/bookings"
                                        className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all"
                                    >
                                        Xem đơn đặt tour
                                    </Link>
                                    <Link
                                        to="/tours"
                                        className="px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all"
                                    >
                                        Tiếp tục khám phá
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Tour Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sticky top-24">
                            {/* Tour Image */}
                            <div className="w-full h-40 rounded-2xl overflow-hidden bg-slate-100 mb-4">
                                {tour?.imageUrl ? (
                                    <img
                                        src={tour.imageUrl}
                                        alt={tour.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                                        <MapPin className="text-primary/50" size={32} />
                                    </div>
                                )}
                            </div>

                            <h3 className="font-bold text-lg mb-2">{tour?.name}</h3>

                            <div className="space-y-2 text-sm text-slate-600 mb-4">
                                {tour?.startDate && (
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-primary" />
                                        <span>{formatDate(tour.startDate)}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-secondary" />
                                    <span>{tour?.numberOfDays || 1} ngày</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-blue-500" />
                                    <span>{tour?.points?.length || 0} điểm tham quan</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-600">Giá/người</span>
                                    <span className="font-bold">{formatPrice(tour?.price)}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-600">Số người</span>
                                    <span className="font-bold">{numberOfParticipants}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                    <span className="font-bold">Tổng cộng</span>
                                    <span className="text-xl font-bold text-primary">{formatPrice(totalPrice)}</span>
                                </div>
                            </div>

                            {step === 1 && (
                                <button
                                    onClick={handleCreateBooking}
                                    disabled={submitting}
                                    className="w-full mt-4 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            Tiếp tục
                                            <ChevronRight size={20} />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
