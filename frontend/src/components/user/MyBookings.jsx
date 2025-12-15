import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar, MapPin, Clock, ArrowRight, Loader2, AlertCircle, X, Users, QrCode } from "lucide-react";
import { api } from "../../utils/api";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookings/my');
      if (response.data.code === 1000) {
        setBookings(response.data.result || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Không thể tải danh sách đặt tour');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!confirm('Bạn có chắc muốn hủy đặt tour này?')) return;

    setCancellingId(id);
    try {
      const response = await api.put(`/bookings/${id}/cancel`);
      if (response.data.code === 1000) {
        fetchBookings(); // Refresh list
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert(err.response?.data?.message || 'Không thể hủy đặt tour');
    } finally {
      setCancellingId(null);
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

  const getStatusBadge = (status, paymentStatus) => {
    const statusConfig = {
      PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Chờ xác nhận' },
      CONFIRMED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Đã xác nhận' },
      COMPLETED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Đã hoàn thành' },
      CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Đã hủy' },
    };

    const paymentConfig = {
      PENDING: { label: '💰 Chờ thanh toán' },
      PAID: { label: '✅ Đã thanh toán' },
      REFUNDED: { label: '↩️ Đã hoàn tiền' },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const payment = paymentConfig[paymentStatus] || paymentConfig.PENDING;

    return (
      <div className="flex flex-wrap gap-2">
        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.text} ${config.border} border`}>
          {config.label}
        </span>
        <span className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
          {payment.label}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Chuyến đi của tôi</h2>
        <p className="text-slate-500 mt-2">
          Quản lý các tour đã đặt và lịch sử chuyến đi.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/60">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Chưa có đặt tour nào</h3>
          <p className="text-slate-500">Hãy khám phá và đặt tour đầu tiên của bạn!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="group bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Tour Image */}
                <div className="w-full md:w-40 h-32 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-inner relative">
                  {booking.tourImageUrl ? (
                    <img
                      src={booking.tourImageUrl}
                      alt={booking.tourName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                      <MapPin className="text-primary/50" size={32} />
                    </div>
                  )}
                </div>

                {/* Booking Info */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-lg">
                          {booking.bookingCode}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-slate-900 text-xl group-hover:text-primary transition-colors">
                        {booking.tourName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                        {booking.tourStartDate && (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-primary" />
                            {formatDate(booking.tourStartDate)}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-secondary" />
                          {booking.tourNumberOfDays || 1} ngày
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-blue-500" />
                          {booking.numberOfParticipants} người
                        </span>
                      </div>
                    </div>

                    {getStatusBadge(booking.status, booking.paymentStatus)}
                  </div>

                  {/* Participants */}
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-1">Người tham gia:</p>
                    <p className="text-sm text-slate-700">{booking.participantNames?.join(', ')}</p>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">{formatPrice(booking.totalPrice)}</span>

                    <div className="flex gap-2">
                      {booking.qrCodeUrl && (
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center gap-2"
                        >
                          <QrCode size={16} />
                          QR Code
                        </button>
                      )}
                      {booking.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-all disabled:opacity-50"
                        >
                          {cancellingId === booking.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            'Hủy đặt tour'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {/* QR Code Modal - Using Portal to cover entire screen */}
      {selectedBooking && createPortal(
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl transform scale-100 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-slate-900">QR Check-in</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100">
              <p className="text-sm text-slate-500 mb-1">Mã đặt tour</p>
              <p className="font-mono text-xl font-bold text-primary tracking-wider">{selectedBooking.bookingCode}</p>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity blur"></div>
              <div className="relative bg-white p-4 rounded-xl border border-slate-100">
                <img
                  src={selectedBooking.qrCodeUrl}
                  alt="QR Code"
                  className="w-full aspect-square object-contain"
                />
              </div>
            </div>

            <p className="text-sm text-slate-500 mt-6 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              Đưa mã này cho nhân viên để check-in
            </p>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MyBookings;
