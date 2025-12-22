import React, { useState, useEffect } from 'react';
import { X, Users, Phone, FileText, Loader2, CreditCard, Check, AlertCircle } from 'lucide-react';
import { api } from '../../utils/api';
import { FaMoneyBillAlt } from "react-icons/fa";
import { FaRegCheckCircle } from "react-icons/fa";
import { PiKeyReturnBold } from "react-icons/pi";

const BookingModal = ({ tour, onClose, onSuccess }) => {
    const [step, setStep] = useState(1); // 1: Info, 2: Payment, 3: Success
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [booking, setBooking] = useState(null);

    const [numberOfParticipants, setNumberOfParticipants] = useState(1);
    const [participantNames, setParticipantNames] = useState(['']);
    const [contactPhone, setContactPhone] = useState('');
    const [note, setNote] = useState('');

    // Calculate max available spots
    const maxSpots = tour.maxParticipants
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

    const totalPrice = (tour.price || 0) * numberOfParticipants;

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

        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/bookings', {
                tourId: tour.id,
                participantNames: participantNames.map(n => n.trim()),
                contactPhone: contactPhone.trim(),
                note: note.trim() || null,
            });

            if (response.data.code === 1000) {
                setBooking(response.data.result);
                setStep(2); // Move to payment step
            } else {
                setError(response.data.message || 'Có lỗi xảy ra');
            }
        } catch (err) {
            console.error('Error creating booking:', err);
            setError(err.response?.data?.message || 'Không thể tạo đơn đặt tour');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!booking) return;

        setLoading(true);
        setError(null);

        try {
            const response = await api.put(`/bookings/${booking.id}/pay`);

            if (response.data.code === 1000) {
                setBooking(response.data.result);
                setStep(3); // Move to success step
            } else {
                setError(response.data.message || 'Thanh toán thất bại');
            }
        } catch (err) {
            console.error('Error processing payment:', err);
            setError(err.response?.data?.message || 'Không thể xử lý thanh toán');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">
                        {step === 1 && '🎫 Đặt tour'}
                        {step === 2 && '💳 Thanh toán'}
                        {step === 3 && '✅ Đặt tour thành công'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {/* Step 1: Booking Info */}
                    {step === 1 && (
                        <div className="space-y-4">
                            {/* Tour Info */}
                            <div className="p-4 bg-slate-50 rounded-2xl">
                                <h3 className="font-bold text-slate-900 mb-1">{tour.name}</h3>
                                <p className="text-sm text-slate-500">
                                    {tour.numberOfDays || 1} ngày • {tour.points?.length || 0} điểm đến
                                </p>
                            </div>

                            {/* Number of Participants */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <Users size={16} className="inline mr-2" />
                                    Số người tham gia
                                </label>
                                <select
                                    value={numberOfParticipants}
                                    onChange={(e) => setNumberOfParticipants(parseInt(e.target.value))}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                >
                                    {Array.from({ length: Math.min(maxSpots, 10) }, (_, i) => i + 1).map(n => (
                                        <option key={n} value={n}>{n} người</option>
                                    ))}
                                </select>
                                {tour.maxParticipants && (
                                    <p className="text-xs text-slate-500 mt-1">
                                        Còn {maxSpots} chỗ trống
                                    </p>
                                )}
                            </div>

                            {/* Participant Names */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Họ tên người tham gia
                                </label>
                                <div className="space-y-2">
                                    {participantNames.map((name, index) => (
                                        <input
                                            key={index}
                                            type="text"
                                            placeholder={`Người ${index + 1}`}
                                            value={name}
                                            onChange={(e) => handleParticipantNameChange(index, e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Contact Phone */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <Phone size={16} className="inline mr-2" />
                                    Số điện thoại liên hệ
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
                                    Ghi chú (tùy chọn)
                                </label>
                                <textarea
                                    placeholder="Yêu cầu đặc biệt..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Payment */}
                    {step === 2 && booking && (
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-2xl">
                                <p className="text-sm text-slate-500 mb-1">Mã đặt tour</p>
                                <p className="text-xl font-bold text-primary">{booking.bookingCode}</p>
                            </div>

                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                                <p className="text-amber-800 text-sm">
                                    💡 Đây là thanh toán giả lập. Trong thực tế, bạn sẽ được chuyển đến cổng thanh toán.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Giá tour</span>
                                    <span>{formatPrice(tour.price)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Số người</span>
                                    <span>x {numberOfParticipants}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200">
                                    <span>Tổng cộng</span>
                                    <span className="text-primary">{formatPrice(totalPrice)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Success */}
                    {step === 3 && booking && (
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <Check size={40} className="text-green-600" />
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Đặt tour thành công!</h3>
                                <p className="text-slate-600">
                                    Mã đặt tour của bạn là <strong className="text-primary">{booking.bookingCode}</strong>
                                </p>
                            </div>

                            {booking.qrCodeUrl && (
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-sm text-slate-500 mb-2">QR Code check-in</p>
                                    <img
                                        src={booking.qrCodeUrl}
                                        alt="QR Code"
                                        className="w-40 h-40 mx-auto rounded-lg"
                                    />
                                </div>
                            )}

                            <p className="text-sm text-slate-500">
                                Xem chi tiết đơn đặt tour trong mục "Chuyến đi của tôi"
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
                    {step === 1 && (
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600">Tổng cộng:</span>
                                <span className="text-2xl font-bold text-primary">{formatPrice(totalPrice)}</span>
                            </div>
                            <button
                                onClick={handleCreateBooking}
                                disabled={loading}
                                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Tiếp tục thanh toán'
                                )}
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Đang xử lý thanh toán...
                                </>
                            ) : (
                                <>
                                    <CreditCard size={20} />
                                    Xác nhận thanh toán {formatPrice(totalPrice)}
                                </>
                            )}
                        </button>
                    )}

                    {step === 3 && (
                        <button
                            onClick={() => {
                                onSuccess?.(booking);
                                onClose();
                            }}
                            className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all"
                        >
                            Đóng
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
