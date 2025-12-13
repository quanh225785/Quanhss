import React, { useState, useEffect } from 'react';
import { Search, Route, Check, X, AlertCircle, Loader2, MapPin, Clock, Eye } from 'lucide-react';
import { api } from '../../utils/api';
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
      alert('Tour đã được duyệt thành công!');
      setShowApproveModal(false);
      setSelectedTour(null);
      await fetchTours();
    } catch (err) {
      console.error('Error approving tour:', err);
      alert('Không thể duyệt tour: ' + (err.response?.data?.message || 'Lỗi không xác định'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (tourId) => {
    if (!rejectReason || rejectReason.trim() === '') {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    setProcessingId(tourId);
    try {
      await api.post(`/tours/${tourId}/reject`, null, {
        params: { reason: rejectReason.trim() },
      });
      alert('Tour đã bị từ chối!');
      setShowRejectModal(false);
      setSelectedTour(null);
      setRejectReason('');
      await fetchTours();
    } catch (err) {
      console.error('Error rejecting tour:', err);
      alert('Không thể từ chối tour: ' + (err.response?.data?.message || 'Lỗi không xác định'));
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quản lý Tour</h2>
          <p className="text-zinc-500">Duyệt tour đề xuất từ các agent.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">Lỗi</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-zinc-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'pending'
              ? 'border-zinc-900 text-zinc-900'
              : 'border-transparent text-zinc-500 hover:text-zinc-700'
              }`}
          >
            Tour chờ duyệt ({tours.filter(t => t.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'all'
              ? 'border-zinc-900 text-zinc-900'
              : 'border-transparent text-zinc-500 hover:text-zinc-700'
              }`}
          >
            Tất cả tour ({tours.length})
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-zinc-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm tour..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
      </div>

      {/* Tours List */}
      {filteredTours.length === 0 ? (
        <div className="bg-white rounded-lg border border-zinc-200 p-12 text-center">
          <Route className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-500">
            {searchQuery ? 'Không tìm thấy tour nào' : 'Chưa có tour nào'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTours.map((tour) => (
            <div
              key={tour.id}
              className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-zinc-900 truncate">{tour.name}</h3>
                  {tour.description && (
                    <p className="text-sm text-zinc-600 line-clamp-2 mt-1">
                      {tour.description}
                    </p>
                  )}
                </div>
                {getStatusBadge(tour.status)}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-zinc-600">
                  <MapPin className="w-4 h-4 text-zinc-400" />
                  {tour.points?.length || 0} điểm
                </div>
                {tour.totalDistance && (
                  <div className="flex items-center gap-2 text-zinc-600">
                    <Route className="w-4 h-4 text-zinc-400" />
                    {formatDistance(tour.totalDistance)}
                  </div>
                )}
                {tour.totalTime && (
                  <div className="flex items-center gap-2 text-zinc-600">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    {formatDuration(tour.totalTime)}
                  </div>
                )}
                {tour.price && (
                  <div className="text-zinc-900 font-medium">
                    {tour.price.toLocaleString('vi-VN')} VNĐ
                  </div>
                )}
              </div>

              <div className="text-sm text-zinc-600">
                Tạo bởi: <span className="font-medium">{tour.createdByUsername}</span>
                {tour.isOptimized && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700">
                    TSP
                  </span>
                )}
              </div>

              {tour.status === 'REJECTED' && tour.rejectionReason && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  Lý do từ chối: {tour.rejectionReason}
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-zinc-100">
                <button
                  onClick={() => openDetailsModal(tour)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 text-sm font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 rounded-md transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Chi tiết
                </button>
                {tour.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => openApproveModal(tour)}
                      disabled={processingId === tour.id}
                      className="flex-1 flex items-center justify-center gap-1 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                      className="flex-1 flex items-center justify-center gap-1 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            </div>

            {/* Points List */}
            <div>
              <h4 className="text-sm font-medium text-zinc-700 mb-2">
                Các điểm dừng ({selectedTour.points?.length || 0})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedTour.points?.map((point, index) => (
                  <div key={point.id} className="flex items-center gap-3 p-2 bg-zinc-50 rounded-lg">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${index === 0
                        ? 'bg-emerald-500'
                        : index === selectedTour.points.length - 1
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                        }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">
                        {point.locationName}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">{point.locationAddress}</p>
                    </div>
                  </div>
                ))}
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
