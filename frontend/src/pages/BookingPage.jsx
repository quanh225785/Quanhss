import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import {
    ArrowLeft, Users, Phone, FileText, Loader2, CreditCard, Check,
    AlertCircle, MapPin, Calendar, Clock, ChevronRight, CalendarX, Timer
} from 'lucide-react';
import { api } from '../utils/api';

// 10 minutes timeout for payment
const PAYMENT_TIMEOUT_MINUTES = 10;

const BookingPage = () => {
    const { tourId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const countdownRef = useRef(null);

    // Get trip info from navigation state
    const tripId = location.state?.tripId;
    const tripInfo = location.state?.trip;

    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [step, setStep] = useState(1); // 1: Info, 2: Payment, 3: Success
    const [booking, setBooking] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(PAYMENT_TIMEOUT_MINUTES * 60); // in seconds

    const [numberOfParticipants, setNumberOfParticipants] = useState(1);
    const [participantNames, setParticipantNames] = useState(['']);
    const [contactPhone, setContactPhone] = useState('');
    const [note, setNote] = useState('');

    useEffect(() => {
        // Redirect if no tripId
        if (!tripId) {
            navigate(`/tours/${tourId}`, { replace: true });
            return;
        }
        fetchTourDetails();
    }, [tourId, tripId]);

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

    // Countdown timer for payment step
    useEffect(() => {
        if (step === 2 && booking) {
            // Start countdown from 10 minutes when entering step 2
            // This avoids timezone issues with server's createdAt
            setTimeRemaining(PAYMENT_TIMEOUT_MINUTES * 60);

            // Start countdown
            countdownRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        // Time's up - cancel booking
                        clearInterval(countdownRef.current);
                        handleTimeoutCancel();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => {
                if (countdownRef.current) {
                    clearInterval(countdownRef.current);
                }
            };
        }
    }, [step, booking?.id]);

    const handleTimeoutCancel = async () => {
        if (booking) {
            try {
                await api.put(`/bookings/${booking.id}/cancel`);
            } catch (err) {
                console.error('Error cancelling timed-out booking:', err);
            }
        }
        setBooking(null);
        setError('Đã hết thời gian thanh toán. Vui lòng đặt lại tour.');
        setStep(1);
    };

    const formatTimeRemaining = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate max available spots from trip
    const maxSpots = tripInfo?.availableSlots || 10;

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

        // Vietnamese phone number regex: starts with 0 and has 10 digits
        const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
        if (!phoneRegex.test(contactPhone.trim())) {
            setError('Số điện thoại không hợp lệ (phải có 10 chữ số và bắt đầu bằng 03, 05, 07, 08 hoặc 09)');
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
                tripId: parseInt(tripId),
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

    const handleGoBackToStep1 = async () => {
        // Cancel the current booking before going back to step 1
        if (booking) {
            try {
                await api.put(`/bookings/${booking.id}/cancel`);
                setBooking(null);
            } catch (err) {
                console.error('Error cancelling booking:', err);
                // Still go back even if cancel fails
            }
        }
        setStep(1);
    };

    const handleNavigateBack = async () => {
        // If we're at step 2, cancel the booking first before navigating back
        if (step === 2 && booking) {
            try {
                await api.put(`/bookings/${booking.id}/cancel`);
            } catch (err) {
                console.error('Error cancelling booking:', err);
            }
        }
        navigate(-1);
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
            <div className="min-h-screen flex items-center justify-center p-8">
                <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] border border-white/40 shadow-2xl p-16 text-center max-w-lg">
                    <Loader2 className="w-20 h-20 animate-spin text-primary mx-auto mb-8" />
                    <p className="text-slate-900 font-black text-2xl tracking-tight">Đang tải thông tin đặt tour...</p>
                </div>
            </div>
        );
    }

    if (error && !tour) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8">
                <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] p-12 border border-white/40 shadow-2xl text-center max-w-md">
                    <AlertCircle size={64} className="text-red-500 mx-auto mb-6" />
                    <p className="text-slate-900 font-bold text-xl mb-8">{error}</p>
                    <button
                        onClick={handleNavigateBack}
                        className="w-full py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-slate-900">
            {/* Header - Glass */}
            <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-white/40 rounded-b-[2.5rem] shadow-2xl shadow-black/5">
                <div className="max-w-7xl mx-auto px-6 py-6 flex items-center gap-6">
                    <button
                        onClick={handleNavigateBack}
                        className="p-3.5 rounded-2xl bg-white/50 border border-white/40 hover:bg-white transition-all shadow-sm"
                    >
                        <ArrowLeft size={24} className="text-slate-700" />
                    </button>
                    <div>
                        <h1 className="font-black text-2xl tracking-tight text-slate-900">
                            {step === 1 && 'Đặt tour'}
                            {step === 2 && 'Thanh toán'}
                            {step === 3 && 'Hoàn tất'}
                        </h1>
                        <p className="text-sm font-bold text-slate-500 mt-0.5">{tour?.name}</p>
                    </div>
                </div>
            </header>

            {/* Progress Steps */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex items-center justify-center gap-3 mb-10">
                    {[1, 2, 3].map((s) => (
                        <React.Fragment key={s}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all shadow-lg ${step >= s
                                ? 'bg-primary text-white shadow-primary/30 scale-110'
                                : 'bg-white/70 text-slate-400 border border-white/40'
                                }`}>
                                {step > s ? <Check size={24} /> : s}
                            </div>
                            {s < 3 && (
                                <div className={`w-20 h-2 rounded-full transition-all ${step > s ? 'bg-primary shadow-sm shadow-primary/20' : 'bg-white/50'
                                    }`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {error && (
                    <div className="mb-8 p-5 bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-[2rem] text-red-700 flex items-center gap-4 animate-shake shadow-lg">
                        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <AlertCircle size={24} className="text-red-600" />
                        </div>
                        <p className="font-bold">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Step 1: Booking Info */}
                        {step === 1 && (
                            <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl shadow-black/5 rounded-[3rem] p-10 space-y-8">
                                <h2 className="text-2xl font-display font-black text-slate-900 flex items-center gap-3">
                                    <div className="w-2 h-8 bg-primary rounded-full"></div>
                                    Thông tin đặt tour
                                </h2>

                                {/* Number of Participants */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <Users size={16} className="inline mr-2" />
                                        Số người tham gia
                                    </label>
                                    <select
                                        value={numberOfParticipants}
                                        onChange={(e) => setNumberOfParticipants(parseInt(e.target.value))}
                                        className="w-full px-5 py-4 bg-white/50 border border-white/40 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-lg font-bold text-slate-900"
                                    >
                                        {Array.from({ length: Math.min(maxSpots, 10) }, (_, i) => i + 1).map(n => (
                                            <option key={n} value={n}>{n} người</option>
                                        ))}
                                    </select>
                                    {tripInfo && (
                                        <p className="text-sm text-slate-500 mt-2">
                                            Còn {maxSpots} chỗ trống cho chuyến này
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
                                                    className="w-full pl-12 pr-4 py-4 bg-white/50 border border-white/40 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-slate-900"
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
                                        className="w-full px-5 py-4 bg-white/50 border border-white/40 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-slate-900"
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
                                        className="w-full px-5 py-4 bg-white/50 border border-white/40 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none font-bold text-slate-900"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Payment */}
                        {step === 2 && booking && (
                            <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl shadow-black/5 rounded-[3rem] p-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-display font-black text-slate-900 flex items-center gap-3">
                                        <div className="w-2 h-8 bg-secondary rounded-full"></div>
                                        Xác nhận thanh toán
                                    </h2>
                                    {/* Countdown Timer */}
                                    <div className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-mono text-xl font-black ${timeRemaining > 300
                                        ? 'bg-green-500/10 text-green-700 border border-green-500/20'
                                        : timeRemaining > 120
                                            ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                                            : 'bg-red-500/10 text-red-700 border border-red-500/20 animate-pulse'
                                        }`}>
                                        <Timer size={24} />
                                        <span>{formatTimeRemaining(timeRemaining)}</span>
                                    </div>
                                </div>

                                {/* Timeout Warning */}
                                <div className={`p-6 rounded-[2rem] flex items-center gap-4 ${timeRemaining > 120
                                    ? 'bg-blue-500/10 border border-blue-500/20 text-blue-800'
                                    : 'bg-red-500/10 border border-red-500/20 text-red-800'
                                    }`}>
                                    <Timer size={24} className="flex-shrink-0" />
                                    <p className="font-medium">
                                        <strong className="font-black">Lưu ý:</strong> Bạn có {PAYMENT_TIMEOUT_MINUTES} phút để hoàn tất thanh toán.
                                        {timeRemaining <= 120 && ' Thời gian sắp hết!'}
                                        {' '}Nếu không thanh toán kịp, đơn đặt tour sẽ tự động bị hủy.
                                    </p>
                                </div>

                                <div className="p-6 bg-white/50 border border-white/40 rounded-3xl shadow-sm">
                                    <p className="text-sm font-black text-slate-500 uppercase tracking-widest mb-1">Mã đặt tour</p>
                                    <p className="text-3xl font-black text-primary font-mono">{booking.bookingCode}</p>
                                </div>

                                {/* <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                                    <p className="text-amber-800">
                                        💡 <strong>Lưu ý:</strong> Đây là thanh toán giả lập cho mục đích demo.
                                        Trong thực tế, bạn sẽ được chuyển đến cổng thanh toán an toàn.
                                    </p>
                                </div> */}

                                <div className="space-y-4 p-6 bg-white/50 border border-white/40 rounded-3xl shadow-sm">
                                    <div className="flex justify-between font-bold">
                                        <span className="text-slate-500">Giá tour</span>
                                        <span className="text-slate-900">{formatPrice(tour?.price)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold">
                                        <span className="text-slate-500">Số người tham gia</span>
                                        <span className="text-slate-900">x {booking.numberOfParticipants}</span>
                                    </div>
                                    <div className="border-t border-white/40 pt-4 flex justify-between items-center">
                                        <span className="font-black text-xl text-slate-900">Tổng cộng</span>
                                        <span className="font-black text-3xl text-primary drop-shadow-sm">{formatPrice(booking.totalPrice)}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <button
                                        onClick={handleGoBackToStep1}
                                        disabled={submitting}
                                        className="py-4 border border-slate-200 text-slate-700 font-black rounded-2xl hover:bg-white transition-all disabled:opacity-50"
                                    >
                                        Quay lại
                                    </button>
                                    <button
                                        onClick={handlePayment}
                                        disabled={submitting}
                                        className="py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 hover:shadow-2xl shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
                                    >
                                        {submitting ? (
                                            <Loader2 size={24} className="animate-spin" />
                                        ) : (
                                            <CreditCard size={24} />
                                        )}
                                        Thanh toán ngay
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Success */}
                        {step === 3 && booking && (
                            <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl shadow-black/5 rounded-[3rem] p-12 text-center space-y-8">
                                <div className="w-32 h-32 bg-green-500/10 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                    <Check size={64} className="text-green-600 drop-shadow-sm" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-display font-black text-slate-900 mb-3 tracking-tight">Đặt tour thành công!</h2>
                                    <p className="text-slate-500 font-bold text-lg">
                                        Cảm ơn bạn đã tin tưởng. Mã đặt tour của bạn là:
                                    </p>
                                    <p className="text-4xl font-black text-primary font-mono mt-4 drop-shadow-sm">{booking.bookingCode}</p>
                                </div>

                                {booking.qrCodeUrl && (
                                    <div className="p-8 bg-white/50 border border-white/40 rounded-[2.5rem] inline-block shadow-xl">
                                        <p className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">QR Code check-in</p>
                                        <img
                                            src={booking.qrCodeUrl}
                                            alt="QR Code"
                                            className="w-56 h-56 mx-auto rounded-2xl shadow-2xl border-4 border-white"
                                        />
                                        <p className="text-xs font-bold text-slate-500 mt-4">
                                            Vui lòng lưu lại mã này để check-in tại điểm xuất phát
                                        </p>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                                    <Link
                                        to="/user/bookings"
                                        className="px-10 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 text-lg"
                                    >
                                        Xem đơn đặt tour
                                    </Link>
                                    <Link
                                        to="/tours"
                                        className="px-10 py-4 bg-white/50 border border-white/40 text-slate-700 font-black rounded-2xl hover:bg-white transition-all shadow-sm text-lg"
                                    >
                                        Tiếp tục khám phá
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Tour Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl shadow-black/5 rounded-[3rem] p-8 sticky top-32">
                            {/* Tour Image */}
                            <div className="w-full h-48 rounded-3xl overflow-hidden bg-slate-100 mb-6 shadow-inner relative group">
                                {tour?.imageUrl ? (
                                    <img
                                        src={tour.imageUrl}
                                        alt={tour.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                                        <MapPin className="text-primary/50" size={40} />
                                    </div>
                                )}
                            </div>

                            <h3 className="font-black text-xl mb-4 text-slate-900 leading-tight">{tour?.name}</h3>

                            <div className="space-y-4 text-sm font-bold text-slate-600 mb-8 p-4 bg-white/50 rounded-[2rem] border border-white/40">
                                {/* Trip Info */}
                                {tripInfo && (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                                <Calendar size={18} className="text-emerald-600" />
                                            </div>
                                            <span>Bắt đầu: {formatDate(tripInfo.startDate)}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-red-500/10 rounded-xl flex items-center justify-center">
                                                <CalendarX size={18} className="text-red-500" />
                                            </div>
                                            <span>Kết thúc: {formatDate(tripInfo.endDate)}</span>
                                        </div>
                                    </>
                                )}
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-secondary/10 rounded-xl flex items-center justify-center">
                                        <Clock size={18} className="text-secondary" />
                                    </div>
                                    <span>{tour?.numberOfDays || 1} ngày</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                        <MapPin size={18} className="text-blue-500" />
                                    </div>
                                    <span>{tour?.points?.length || 0} điểm tham quan</span>
                                </div>
                            </div>

                            <div className="border-t border-white/40 pt-6 space-y-3">
                                <div className="flex justify-between items-center font-bold">
                                    <span className="text-slate-500">Giá/người</span>
                                    <span className="text-slate-900">{formatPrice(tour?.price)}</span>
                                </div>
                                <div className="flex justify-between items-center font-bold">
                                    <span className="text-slate-500">Số người</span>
                                    <span className="text-slate-900">{numberOfParticipants}</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-white/40">
                                    <span className="font-black text-xl text-slate-900">Tổng cộng</span>
                                    <span className="text-2xl font-black text-primary drop-shadow-sm">{formatPrice(totalPrice)}</span>
                                </div>
                            </div>

                            {step === 1 && (
                                <button
                                    onClick={handleCreateBooking}
                                    disabled={submitting}
                                    className="w-full mt-8 py-5 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 hover:shadow-2xl shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg group"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={24} className="animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            Tiếp tục
                                            <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
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
