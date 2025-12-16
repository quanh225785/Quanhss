import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Clock, ArrowRight, Loader2, AlertCircle, X, Users, QrCode, ChevronLeft, ChevronRight, List } from "lucide-react";
import { api } from "../../utils/api";
import { FaMoneyBillAlt } from "react-icons/fa";
import { FaRegCheckCircle } from "react-icons/fa";
import { PiKeyReturnBold } from "react-icons/pi";

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [popupBooking, setPopupBooking] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

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
      PENDING: { label: <><FaMoneyBillAlt className="inline mr-1 text-amber-500" /> Chờ thanh toán</> },
      PAID: { label: <><FaRegCheckCircle className="inline mr-1 text-green-500" /> Đã thanh toán</> },
      REFUNDED: { label: <><PiKeyReturnBold className="inline mr-1 text-blue-500" /> Đã hoàn tiền</> },
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

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getBookingsForDate = (date) => {
    return bookings.filter(booking => {
      // Use tripStartDate if available, fall back to tourStartDate for legacy bookings
      const startDateStr = booking.tripStartDate || booking.tourStartDate;
      if (!startDateStr) return false;
      const startDate = new Date(startDateStr);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (booking.tourNumberOfDays || 1) - 1);

      return date >= new Date(startDate.setHours(0, 0, 0, 0)) &&
        date <= new Date(endDate.setHours(23, 59, 59, 999));
    });
  };

  const getBookingColor = (status) => {
    const colors = {
      PENDING: 'bg-amber-400/60',
      CONFIRMED: 'bg-blue-400/60',
      COMPLETED: 'bg-green-400/60',
      CANCELLED: 'bg-red-300/60',
    };
    return colors[status] || 'bg-slate-400/60';
  };

  const isStartDate = (booking, date) => {
    const startDateStr = booking.tripStartDate || booking.tourStartDate;
    if (!startDateStr) return false;
    const startDate = new Date(startDateStr);
    return date.toDateString() === startDate.toDateString();
  };

  const isEndDate = (booking, date) => {
    const startDateStr = booking.tripStartDate || booking.tourStartDate;
    if (!startDateStr) return false;
    const startDate = new Date(startDateStr);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (booking.tourNumberOfDays || 1) - 1);
    return date.toDateString() === endDate.toDateString();
  };

  const renderCalendarView = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
    const days = [];
    const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    // Empty cells before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayBookings = getBookingsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={day}
          className={`aspect-square border border-slate-100 p-1 relative ${isToday ? 'bg-primary/5 border-primary/30' : 'bg-white/40'
            }`}
        >
          <div className={`text-xs font-medium mb-1 ${isToday ? 'text-primary font-bold' : 'text-slate-600'}`}>
            {day}
          </div>
          <div className="space-y-1 absolute left-0 right-0 bottom-1">
            {dayBookings.map((booking, idx) => {
              const color = getBookingColor(booking.status);
              const isStart = isStartDate(booking, date);
              const isEnd = isEndDate(booking, date);

              return (
                <div
                  key={`${booking.id}-${idx}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setPopupPosition({
                      x: rect.left + rect.width / 2,
                      y: rect.top
                    });
                    setPopupBooking(booking);
                  }}
                  className={`text-[10px] h-6 flex items-center text-slate-800 font-medium cursor-pointer hover:opacity-80 transition-opacity ${color} ${isStart ? 'rounded-l-lg ml-1 pl-2' : 'pl-1'
                    } ${isEnd ? 'rounded-r-lg mr-1' : ''}`}
                  style={{ marginLeft: isStart ? '4px' : '-1px', marginRight: isEnd ? '4px' : '-1px' }}
                  title={`${booking.tourName} - ${booking.tourNumberOfDays} ngày`}
                >
                  {isStart ? booking.tourName.slice(0, 12) : ''}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/60 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h3 className="text-lg font-bold text-slate-900">
            Tháng {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Week days header */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-bold text-slate-500 py-2 border-b border-slate-200">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {days}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded bg-amber-400/60"></div>
            <span className="text-slate-600">Chờ xác nhận</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded bg-blue-400/60"></div>
            <span className="text-slate-600">Đã xác nhận</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded bg-green-400/60"></div>
            <span className="text-slate-600">Hoàn thành</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded bg-red-300/60"></div>
            <span className="text-slate-600">Đã hủy</span>
          </div>
        </div>

        {/* Booking Popup */}
        {popupBooking && createPortal(
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setPopupBooking(null)}
          >
            <div
              className="absolute bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 w-80 animate-scale-in"
              style={{
                left: Math.min(popupPosition.x - 160, window.innerWidth - 340),
                top: Math.max(popupPosition.y - 220, 10),
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Arrow */}
              <div
                className="absolute w-3 h-3 bg-white border-b border-r border-slate-200 transform rotate-45"
                style={{ bottom: '-7px', left: '50%', marginLeft: '-6px' }}
              />

              <div className="flex gap-4">
                {/* Tour Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                  {popupBooking.tourImageUrl ? (
                    <img
                      src={popupBooking.tourImageUrl}
                      alt={popupBooking.tourName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                      <MapPin className="text-primary/50" size={24} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    {popupBooking.bookingCode}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm mt-1 truncate">
                    {popupBooking.tourName}
                  </h4>
                  <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(popupBooking.tripStartDate || popupBooking.tourStartDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {popupBooking.tourNumberOfDays} ngày
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                    <Users className="w-3 h-3" />
                    {popupBooking.numberOfParticipants} người
                  </div>
                </div>
              </div>

              {/* Status & Price */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                {getStatusBadge(popupBooking.status, popupBooking.paymentStatus)}
                <span className="text-sm font-bold text-primary">{formatPrice(popupBooking.totalPrice)}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    setPopupBooking(null);
                    navigate(`/tour/${popupBooking.tourId}`);
                  }}
                  className="flex-1 px-3 py-2 text-xs font-medium text-white bg-primary hover:bg-primary/90 rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  Xem chi tiết
                  <ArrowRight size={14} />
                </button>
                {popupBooking.qrCodeUrl && (
                  <button
                    onClick={() => {
                      setPopupBooking(null);
                      setSelectedBooking(popupBooking);
                    }}
                    className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1"
                  >
                    <QrCode size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Chuyến đi của tôi</h2>
          <p className="text-slate-500 mt-2">
            Quản lý các tour đã đặt và lịch sử chuyến đi.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 bg-white/60 backdrop-blur-md rounded-xl p-1 border border-white/60">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'list'
              ? 'bg-primary text-white shadow-sm'
              : 'text-slate-600 hover:bg-white/80'
              }`}
          >
            <List size={16} />
            Danh sách
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'calendar'
              ? 'bg-primary text-white shadow-sm'
              : 'text-slate-600 hover:bg-white/80'
              }`}
          >
            <Calendar size={16} />
            Lịch
          </button>
        </div>
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
        <>
          {/* Calendar View */}
          {viewMode === 'calendar' && renderCalendarView()}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="grid gap-6">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="group bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-sm hover:shadow-lg transition-all duration-300 relative"
                >
                  <div
                    className="flex flex-col md:flex-row gap-6 cursor-pointer"
                    onClick={() => navigate(`/tour/${booking.tourId}`)}
                  >
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
                            {(booking.tripStartDate || booking.tourStartDate) && (
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-primary" />
                                {formatDate(booking.tripStartDate || booking.tourStartDate)}
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

                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
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
        </>
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
