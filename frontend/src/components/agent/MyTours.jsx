import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle, Loader2, Route, Clock, MapPin, Trash2, Eye } from 'lucide-react';
import { api } from '../../utils/api';
import { formatDistance, formatDuration } from '../../utils/polylineUtils';
import CreateTourModal from './CreateTourModal';
import TourMap from './TourMap';

const MyTours = () => {
    const [tours, setTours] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTour, setSelectedTour] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTours();
    }, []);

    const fetchTours = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/tours');
            if (response.data.code === 1000) {
                setTours(response.data.result || []);
            }
        } catch (err) {
            console.error('Error fetching tours:', err);
            setError('Không thể tải danh sách tour');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteTour = async (id) => {
        if (!confirm('Bạn có chắc muốn xóa tour này?')) return;

        try {
            await api.delete(`/tours/${id}`);
            setTours(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            console.error('Error deleting tour:', err);
        }
    };

    const handleHideTour = async (id) => {
        if (!confirm('Ẩn tour này khỏi danh sách công khai?')) return;

        try {
            await api.post(`/tours/${id}/hide`);
            fetchTours();
        } catch (err) {
            console.error('Error hiding tour:', err);
            alert('Không thể ẩn tour');
        }
    };

    const handleUnhideTour = async (id) => {
        try {
            await api.post(`/tours/${id}/unhide`);
            fetchTours();
        } catch (err) {
            console.error('Error unhiding tour:', err);
            alert('Không thể hiện tour');
        }
    };

    const handleTourCreated = () => {
        setShowCreateModal(false);
        fetchTours();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-zinc-400" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Quản lý Tour</h2>
                    <p className="text-zinc-500">Danh sách các tour do bạn tổ chức.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors"
                >
                    <Plus size={16} />
                    Tạo Tour mới
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
                    {error}
                </div>
            )}

            {tours.length === 0 ? (
                <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center">
                    <Route className="mx-auto text-zinc-300 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-zinc-900 mb-2">Chưa có tour nào</h3>
                    <p className="text-zinc-500 mb-4">Bắt đầu bằng việc tạo tour đầu tiên của bạn</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors"
                    >
                        <Plus size={16} />
                        Tạo Tour mới
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {tours.map((tour) => (
                        <div
                            key={tour.id}
                            className="bg-white border border-zinc-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-zinc-900">{tour.name}</h3>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${tour.status === 'APPROVED'
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : tour.status === 'PENDING'
                                                    ? 'bg-amber-50 text-amber-700'
                                                    : tour.status === 'HIDDEN'
                                                        ? 'bg-zinc-100 text-zinc-600'
                                                        : 'bg-red-50 text-red-700'
                                            }`}>
                                            {tour.status === 'APPROVED' ? (
                                                <>
                                                    <CheckCircle size={12} />
                                                    Đã duyệt
                                                </>
                                            ) : tour.status === 'PENDING' ? (
                                                <>
                                                    <Clock size={12} />
                                                    Chờ duyệt
                                                </>
                                            ) : tour.status === 'HIDDEN' ? (
                                                <>
                                                    <XCircle size={12} />
                                                    Đã ẩn
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle size={12} />
                                                    Đã từ chối
                                                </>
                                            )}
                                        </span>
                                        {tour.isOptimized && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                TSP
                                            </span>
                                        )}
                                    </div>

                                    {tour.description && (
                                        <p className="text-sm text-zinc-600 mb-3">{tour.description}</p>
                                    )}

                                    <div className="flex flex-wrap gap-4 text-sm text-zinc-600">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={14} className="text-zinc-400" />
                                            {tour.points?.length || 0} điểm
                                        </div>
                                        {tour.totalDistance && (
                                            <div className="flex items-center gap-1.5">
                                                <Route size={14} className="text-zinc-400" />
                                                {formatDistance(tour.totalDistance)}
                                            </div>
                                        )}
                                        {tour.totalTime && (
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={14} className="text-zinc-400" />
                                                {formatDuration(tour.totalTime)}
                                            </div>
                                        )}
                                        {tour.price && (
                                            <div className="font-medium text-zinc-900">
                                                {tour.price.toLocaleString('vi-VN')} VNĐ
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setSelectedTour(selectedTour?.id === tour.id ? null : tour)}
                                        className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                                        title="Xem chi tiết"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    {tour.status === 'APPROVED' && (
                                        <button
                                            onClick={() => handleHideTour(tour.id)}
                                            className="p-2 text-zinc-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                            title="Ẩn tour"
                                        >
                                            <XCircle size={18} />
                                        </button>
                                    )}
                                    {tour.status === 'HIDDEN' && (
                                        <button
                                            onClick={() => handleUnhideTour(tour.id)}
                                            className="p-2 text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                            title="Hiện tour"
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDeleteTour(tour.id)}
                                        className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Xóa"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Rejection Reason */}
                            {tour.status === 'REJECTED' && tour.rejectionReason && (
                                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-xs font-medium text-red-900 mb-1">Lý do từ chối:</p>
                                    <p className="text-sm text-red-700">{tour.rejectionReason}</p>
                                </div>
                            )}

                            {/* Expanded Tour Details */}
                            {selectedTour?.id === tour.id && (
                                <div className="mt-4 pt-4 border-t border-zinc-200">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {/* Points List */}
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium text-zinc-700">Các điểm dừng</h4>
                                            <div className="space-y-2">
                                                {tour.points?.map((point, index) => (
                                                    <div key={point.id} className="flex items-center gap-3 p-2 bg-zinc-50 rounded-lg">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${index === 0 ? 'bg-emerald-500' :
                                                            index === tour.points.length - 1 ? 'bg-red-500' : 'bg-blue-500'
                                                            }`}>
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-zinc-900 truncate">{point.locationName}</p>
                                                            <p className="text-xs text-zinc-500 truncate">{point.locationAddress}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Map */}
                                        <div>
                                            <h4 className="text-sm font-medium text-zinc-700 mb-2">Tuyến đường</h4>
                                            <TourMap
                                                points={tour.points?.map(p => ({
                                                    latitude: p.latitude,
                                                    longitude: p.longitude,
                                                    name: p.locationName,
                                                    orderIndex: p.orderIndex,
                                                })) || []}
                                                routePolyline={tour.routePolyline}
                                                totalDistance={tour.totalDistance}
                                                totalTime={tour.totalTime}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create Tour Modal */}
            {showCreateModal && (
                <CreateTourModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleTourCreated}
                />
            )}
        </div>
    );
};

export default MyTours;
