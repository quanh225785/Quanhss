import React, { useState, useEffect } from 'react';
import { Search, Route, Check, X, AlertCircle, Loader2, MapPin, Clock, Eye, Calendar } from 'lucide-react';
import { api } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { formatDistance, formatDuration } from '../../utils/polylineUtils';
import ConfirmModal from '../shared/ConfirmModal';
import Modal from '../shared/Modal';
import TourMap from '../agent/TourMap';

const TourManagement = () => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'all'
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const { showToast } = useToast();

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchTours();
  }, [activeTab]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTours(tours);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredTours(
        tours.filter(
          (t) =>
            t.name.toLowerCase().includes(query) ||
            (t.description && t.description.toLowerCase().includes(query)) ||
            t.createdByUsername.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, tours]);

  const fetchTours = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'pending' ? '/tours/pending' : '/tours/all';
      const response = await api.get(endpoint);
      setTours(response.data.result || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching tours:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách tour');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (tourId) => {
    setProcessingId(tourId);
    try {
      await api.post(`/tours/${tourId}/approve`);
      showToast({
        type: 'success',
        message: 'Thành công',
        description: 'Tour đã được duyệt thành công!'
      });
      setShowApproveModal(false);
      setSelectedTour(null);
      await fetchTours();
    } catch (err) {
      console.error('Error approving tour:', err);
      showToast({
        type: 'error',
        message: 'Lỗi',
        description: 'Không thể duyệt tour: ' + (err.response?.data?.message || 'Lỗi không xác định')
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (tourId) => {
    if (!rejectReason || rejectReason.trim() === '') {
      showToast({
        type: 'info',
        message: 'Yêu cầu',
        description: 'Vui lòng nhập lý do từ chối'
      });
      return;
    }

    setProcessingId(tourId);
    try {
      await api.post(`/tours/${tourId}/reject`, null, {
        params: { reason: rejectReason.trim() },
      });
      showToast({
        type: 'success',
        message: 'Thành công',
        description: 'Tour đã bị từ chối!'
      });
      setShowRejectModal(false);
      setSelectedTour(null);
      setRejectReason('');
      await fetchTours();
    } catch (err) {
      console.error('Error rejecting tour:', err);
      showToast({
        type: 'error',
        message: 'Lỗi',
        description: 'Không thể từ chối tour: ' + (err.response?.data?.message || 'Lỗi không xác định')
      });
    } finally {
      setProcessingId(null);
    }
  };

  const openApproveModal = (tour) => {
    setSelectedTour(tour);
    setShowApproveModal(true);
  };

  const openRejectModal = (tour) => {
    setSelectedTour(tour);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const openDetailsModal = (tour) => {
    setSelectedTour(tour);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: 'Chờ duyệt', className: 'bg-amber-100 text-amber-700' },
      APPROVED: { label: 'Đã duyệt', className: 'bg-emerald-100 text-emerald-700' },
      REJECTED: { label: 'Đã từ chối', className: 'bg-red-100 text-red-700' },
    };
    const config = statusMap[status] || statusMap.PENDING;
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/70 backdrop-blur-2xl border border-white/40 p-10 rounded-[3rem] shadow-2xl shadow-black/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-primary rounded-full"></div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">
              Quản lý Tour
            </h2>
          </div>
          <p className="text-slate-500 font-medium ml-5">Kiểm duyệt và quản lý danh sách tour trên toàn hệ thống.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50/50 backdrop-blur-md border border-red-100 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <span className="font-bold">{error}</span>
        </div>
      )}

      {/* Navigation and Filters */}
      <div className="flex flex-col lg:flex-row gap-6 items-center bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40 shadow-xl shadow-black/5">
        <div className="flex p-2 bg-slate-100/50 backdrop-blur-sm rounded-2xl border border-white/40 w-full lg:w-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 lg:flex-none px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'pending'
              ? "bg-white text-primary shadow-sm"
              : "text-slate-500 hover:text-slate-900"
              }`}
          >
            Chờ duyệt ({tours.filter(t => t.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 lg:flex-none px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'all'
              ? "bg-white text-primary shadow-sm"
              : "text-slate-500 hover:text-slate-900"
              }`}
          >
            Tất cả ({tours.length})
          </button>
        </div>

        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên tour, agent, mô tả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white/50 border border-white/40 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Tours List */}
      {filteredTours.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] p-24 text-center shadow-2xl shadow-black/5">
          <div className="bg-slate-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/40 shadow-inner">
            <Route className="w-12 h-12 text-slate-300" />
          </div>
          <p className="text-slate-900 font-black text-2xl tracking-tight mb-2">
            {searchQuery ? 'Không tìm thấy tour nào' : 'Chưa có tour nào'}
          </p>
          <p className="text-slate-500 font-medium">Thử thay đổi bộ lọc hoặc tiêu chí tìm kiếm</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {filteredTours.map((tour) => (
            <div
              key={tour.id}
              className="group bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40 shadow-xl shadow-black/5 flex flex-col gap-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-black text-slate-900 truncate leading-tight mb-2">
                    {tour.name}
                  </h3>
                  {tour.description && (
                    <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed">
                      {tour.description}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {getStatusBadge(tour.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Thời gian</p>
                    <p className="text-sm font-bold text-slate-700">{tour.numberOfDays || 1} ngày</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-xl">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Điểm đến</p>
                    <p className="text-sm font-bold text-slate-700">{tour.points?.length || 0} điểm</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-xl">
                    <Route className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quãng đường</p>
                    <p className="text-sm font-bold text-slate-700">{formatDistance(tour.totalDistance || 0)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-xl">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Thời gian đi</p>
                    <p className="text-sm font-bold text-slate-700">{formatDuration(tour.totalTime || 0)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                    {tour.createdByUsername?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Đại lý</p>
                    <p className="text-xs font-bold text-slate-700">@{tour.createdByUsername}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Giá tour</p>
                  <p className="text-base font-black text-primary">
                    {tour.price?.toLocaleString('vi-VN')} <span className="text-[10px]">VNĐ</span>
                  </p>
                </div>
              </div>

              {tour.status === 'REJECTED' && tour.rejectionReason && (
                <div className="flex items-start gap-2 bg-red-50/50 p-4 rounded-2xl border border-red-100">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-red-600">
                    Lý do từ chối: {tour.rejectionReason}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-6 border-t border-white/40">
                <button
                  onClick={() => openDetailsModal(tour)}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-black text-slate-700 bg-white/50 border border-white/40 hover:bg-white rounded-2xl transition-all shadow-sm"
                >
                  <Eye className="w-4 h-4" />
                  Chi tiết
                </button>
                {tour.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => openApproveModal(tour)}
                      disabled={processingId === tour.id}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-xl shadow-emerald-900/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {processingId === tour.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Duyệt
                    </button>
                    <button
                      onClick={() => openRejectModal(tour)}
                      disabled={processingId === tour.id}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-black text-white bg-red-600 hover:bg-red-700 rounded-2xl shadow-xl shadow-red-900/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {processingId === tour.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      Từ chối
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approve Confirmation Modal */}
      <ConfirmModal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setSelectedTour(null);
        }}
        onConfirm={() => selectedTour && handleApprove(selectedTour.id)}
        title="Xác nhận duyệt tour"
        message={
          selectedTour
            ? `Bạn có chắc chắn muốn duyệt tour "${selectedTour.name}"? Tour sẽ được hiển thị cho người dùng.`
            : ''
        }
        confirmText="Duyệt"
        cancelText="Hủy"
        variant="success"
        isLoading={processingId === selectedTour?.id}
      />

      {/* Reject Modal with Reason Input */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedTour(null);
          setRejectReason('');
        }}
        title="Từ chối tour"
        size="md"
        footer={
          <>
            <button
              onClick={() => {
                setShowRejectModal(false);
                setSelectedTour(null);
                setRejectReason('');
              }}
              disabled={processingId === selectedTour?.id}
              className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={() => selectedTour && handleReject(selectedTour.id)}
              disabled={processingId === selectedTour?.id || !rejectReason.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {processingId === selectedTour?.id ? 'Đang xử lý...' : 'Từ chối'}
            </button>
          </>
        }
      >
        {selectedTour && (
          <div className="space-y-4">
            <div className="bg-zinc-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-zinc-900">{selectedTour.name}</p>
              {selectedTour.description && (
                <p className="text-xs text-zinc-500 mt-1">{selectedTour.description}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="rejectReason"
                className="block text-sm font-medium text-zinc-700 mb-2"
              >
                Lý do từ chối <span className="text-red-600">*</span>
              </label>
              <textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối tour này..."
                className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent resize-none"
                rows="4"
                disabled={processingId === selectedTour?.id}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Tour Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedTour(null);
        }}
        title="Chi tiết tour"
        size="5xl"
      >
        {selectedTour && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900">{selectedTour.name}</h3>
              {selectedTour.description && (
                <p className="text-sm text-zinc-600 mt-1">{selectedTour.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-zinc-500">Trạng thái:</span>{' '}
                {getStatusBadge(selectedTour.status)}
              </div>
              <div>
                <span className="text-zinc-500">Tạo bởi:</span>{' '}
                <span className="font-medium">{selectedTour.createdByUsername}</span>
              </div>
              {selectedTour.price && (
                <div>
                  <span className="text-zinc-500">Giá:</span>{' '}
                  <span className="font-medium">
                    {selectedTour.price.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              )}
              <div>
                <span className="text-zinc-500">Phương tiện:</span>{' '}
                <span className="font-medium">
                  {selectedTour.vehicle === 'car' ? 'Ô tô' : 'Xe máy'}
                </span>
              </div>
              {selectedTour.startDate && (
                <div>
                  <span className="text-zinc-500">Ngày bắt đầu:</span>{' '}
                  <span className="font-medium">
                    {new Date(selectedTour.startDate).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
              {selectedTour.endDate && (
                <div>
                  <span className="text-zinc-500">Ngày kết thúc:</span>{' '}
                  <span className="font-medium">
                    {new Date(selectedTour.endDate).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
              {selectedTour.maxParticipants && (
                <div>
                  <span className="text-zinc-500">Số lượng người:</span>{' '}
                  <span className="font-medium">
                    {selectedTour.currentParticipants || 0}/{selectedTour.maxParticipants}
                  </span>
                </div>
              )}
            </div>

            {/* Itinerary by Day */}
            <div>
              <h4 className="text-sm font-medium text-zinc-700 mb-2">
                Lịch trình ({selectedTour.points?.length || 0} điểm)
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {Array.from({ length: selectedTour.numberOfDays || 1 }, (_, i) => i + 1).map(day => {
                  const dayPoints = selectedTour.points?.filter(p => (p.dayNumber || 1) === day)
                    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)) || [];
                  return (
                    <div key={day} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-blue-700">Ngày {day}</span>
                        <span className="text-xs text-zinc-500">({dayPoints.length} điểm)</span>
                      </div>
                      {dayPoints.length === 0 ? (
                        <p className="text-xs text-zinc-400 italic">Chưa có lịch trình</p>
                      ) : (
                        <div className="space-y-2">
                          {dayPoints.map((point, index) => (
                            <div key={point.id} className={`flex items-start gap-3 rounded-lg p-2 shadow-sm ${point.locationName ? 'bg-white' : 'bg-amber-50'}`}>
                              <div className="flex-shrink-0 w-14 text-right">
                                <span className="text-sm font-medium text-blue-600">
                                  {point.startTime || '--:--'}
                                </span>
                              </div>
                              <div className="flex-shrink-0 w-px bg-blue-200 self-stretch min-h-[40px]"></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-zinc-900">
                                  {point.activity || point.locationName || 'Hoạt động tự do'}
                                </p>
                                {point.locationName ? (
                                  <>
                                    <p className="text-xs text-zinc-500 truncate">
                                      {point.locationName}
                                    </p>
                                    {point.locationAddress && (
                                      <p className="text-xs text-zinc-400 truncate">{point.locationAddress}</p>
                                    )}
                                  </>
                                ) : (
                                  <p className="text-xs text-amber-600">☕ Hoạt động tự do</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Map */}
            {selectedTour.routePolyline && (
              <div>
                <h4 className="text-sm font-medium text-zinc-700 mb-2">Bản đồ tuyến đường</h4>
                <TourMap
                  points={
                    selectedTour.points?.map((p) => ({
                      latitude: p.latitude,
                      longitude: p.longitude,
                      name: p.locationName,
                      orderIndex: p.orderIndex,
                      dayNumber: p.dayNumber,
                    })) || []
                  }
                  routePolyline={selectedTour.routePolyline}
                  totalDistance={selectedTour.totalDistance}
                  totalTime={selectedTour.totalTime}
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TourManagement;
