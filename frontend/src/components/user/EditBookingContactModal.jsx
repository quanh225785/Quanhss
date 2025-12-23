import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Phone, Users, Check, AlertCircle, Edit3 } from 'lucide-react';
import { api } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const EditBookingContactModal = ({ booking, onClose, onSuccess }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [contactPhone, setContactPhone] = useState(booking?.contactPhone || '');
    const [participantNames, setParticipantNames] = useState(booking?.participantNames || []);

    useEffect(() => {
        // Reset form when booking changes
        if (booking) {
            setContactPhone(booking.contactPhone || '');
            setParticipantNames([...booking.participantNames] || []);
            setError(null);
        }
    }, [booking]);

    const handleParticipantNameChange = (index, value) => {
        const newNames = [...participantNames];
        newNames[index] = value;
        setParticipantNames(newNames);
    };

    const validateForm = () => {
        // Check all names are filled
        if (participantNames.some(name => !name.trim())) {
            setError('Vui lòng nhập đầy đủ họ tên của tất cả người tham gia');
            return false;
        }

        // Check phone number
        if (!contactPhone.trim()) {
            setError('Vui lòng nhập số điện thoại liên hệ');
            return false;
        }

        // Vietnamese phone number regex
        const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
        if (!phoneRegex.test(contactPhone.trim())) {
            setError('Số điện thoại không hợp lệ (phải có 10 chữ số và bắt đầu bằng 03, 05, 07, 08 hoặc 09)');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setError(null);

        try {
            const response = await api.put(`/bookings/${booking.id}/contact`, {
                participantNames: participantNames.map(n => n.trim()),
                contactPhone: contactPhone.trim()
            });

            if (response.data.code === 1000) {
                showToast({
                    type: 'success',
                    message: 'Cập nhật thành công',
                    description: 'Thông tin liên hệ đã được cập nhật.'
                });
                onSuccess();
                onClose();
            } else {
                setError(response.data.message || 'Có lỗi xảy ra');
            }
        } catch (err) {
            console.error('Error updating booking contact:', err);
            setError(err.response?.data?.message || 'Không thể cập nhật thông tin');
        } finally {
            setLoading(false);
        }
    };

    if (!booking) return null;

    return createPortal(
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl transform scale-100 animate-scale-in overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative bg-primary p-6 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Edit3 size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl">Sửa thông tin liên hệ</h3>
                            <p className="text-white/80 text-sm">Mã đặt tour: {booking.bookingCode}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Info Banner */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 flex items-start gap-3">
                        <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 16v-4M12 8h.01" />
                            </svg>
                        </div>
                        <p className="text-sm">
                            Bạn có thể sửa số điện thoại và họ tên người tham gia cho đến khi check-in.
                            <strong> Số lượng người tham gia không thể thay đổi.</strong>
                        </p>
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

                    {/* Participant Names */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <Users size={16} className="inline mr-2" />
                            Họ tên người tham gia ({participantNames.length} người) <span className="text-red-500">*</span>
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
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Check size={20} />
                                Lưu thay đổi
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default EditBookingContactModal;
