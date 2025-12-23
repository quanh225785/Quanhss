import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CheckCircle, XCircle, Loader2, Route, Clock, MapPin, Trash2, Eye, Calendar, Users, Pencil } from 'lucide-react';
import { api } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { formatDistance, formatDuration } from '../../utils/polylineUtils';
import CreateTourModal from './CreateTourModal';
import EditTourModal from './EditTourModal';
import Modal from '../shared/Modal';
import ConfirmModal from '../shared/ConfirmModal';

const MyTours = () => {
    const navigate = useNavigate();
    const [tours, setTours] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [tourToEdit, setTourToEdit] = useState(null);
    const [error, setError] = useState(null);
    const [tourToHide, setTourToHide] = useState(null);
    const [tourToDelete, setTourToDelete] = useState(null);
    const { showToast } = useToast();

    useEffect(() => {
        fetchTours();
    }, []);

    const fetchTours = async () => {
        setIsLoading(true);
        setError(null); // Clear any previous errors
        try {
            const response = await api.get('/tours');
            if (response.data.code === 1000) {
                const tours = response.data.result || [];
                setTours(tours);
            }
        } catch (err) {
            console.error('Error fetching tours:', err);
            setError('Không thể tải danh sách tour');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteTour = (id) => {
        setTourToDelete(id);
    };

    const confirmDeleteTour = async () => {
        if (!tourToDelete) return;
        try {
            await api.delete(`/tours/${tourToDelete}`);
            setTours(prev => prev.filter(t => t.id !== tourToDelete));
            setTourToDelete(null);
            showToast({
                type: 'success',
                message: 'Thành công',
                description: 'Đã xóa tour thành công'
            });
        } catch (err) {
            console.error('Error deleting tour:', err);
            showToast({
                type: 'error',
                message: 'Lỗi',
                description: 'Không thể xóa tour. Vui lòng thử lại.'
            });
        }
    };

    const handleHideTour = (id) => {
        setTourToHide(id);
    };

    const confirmHideTour = async () => {
        if (!tourToHide) return;

        try {
            await api.post(`/tours/${tourToHide}/hide`);
            fetchTours();
            setTourToHide(null);
        } catch (err) {
            console.error('Error hiding tour:', err);
            showToast({
                type: 'error',
                message: 'Lỗi ẩn tour',
                description: 'Không thể ẩn tour. Vui lòng thử lại.'
            });
        }
    };

    const handleUnhideTour = async (id) => {
        try {
            await api.post(`/tours/${id}/unhide`);
            fetchTours();
        } catch (err) {
            console.error('Error unhiding tour:', err);
            showToast({
                type: 'error',
                message: 'Lỗi hiện tour',
                description: 'Không thể hiện tour. Vui lòng thử lại.'
            });
        }
    };

    const handleTourCreated = () => {
        setShowCreateModal(false);
        fetchTours();
    };

    const handleTourUpdated = () => {
        setTourToEdit(null);
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
                                        {tour.numberOfDays && tour.numberOfDays > 1 && (
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-blue-500" />
                                                {tour.numberOfDays} ngày
                                            </div>
                                        )}
                                        {/* Trip statistics */}
                                        {tour.status === 'APPROVED' && (
                                            <div className="flex items-center gap-1.5">
                                                <Users size={14} className="text-emerald-500" />
                                                {tour.activeTrips || 0} chuyến đang mở
                                                {tour.totalTrips > 0 && (
                                                    <span className="text-zinc-400">
                                                        / {tour.totalTrips} tổng
                                                    </span>
                                                )}
                                            </div>
                                        )}
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
                                        onClick={() => setTourToEdit(tour)}
                                        className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                                        title="Sửa tour"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => navigate(`/agent/tours/${tour.id}`)}
                                        className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                                        title="Xem chi tiết & đơn đặt"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    {tour.status === 'APPROVED' && (
                                        <>
                                            <button
                                                onClick={() => navigate(`/agent/tours/${tour.id}/trips`)}
                                                className="px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                                                title="Quản lý chuyến"
                                            >
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    Quản lý chuyến
                                                </span>
                                            </button>
                                            <button
                                                onClick={() => handleHideTour(tour.id)}
                                                className="p-2 text-zinc-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                title="Ẩn tour"
                                            >
                                                <XCircle size={18} />
                                            </button>
                                        </>
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
                        </div>
                    ))}
                </div>
            )}

            {/* Hide Tour Confirmation Modal */}
            <ConfirmModal
                isOpen={!!tourToHide}
                onClose={() => setTourToHide(null)}
                onConfirm={confirmHideTour}
                title="Xác nhận ẩn tour"
                message="Bạn có chắc chắn muốn ẩn tour này khỏi danh sách công khai? Tour sẽ không hiển thị cho người dùng nữa."
                confirmText="Ẩn tour"
                cancelText="Hủy"
                variant="warning"
            />

            {/* Delete Tour Confirmation Modal */}
            <ConfirmModal
                isOpen={!!tourToDelete}
                onClose={() => setTourToDelete(null)}
                onConfirm={confirmDeleteTour}
                title="Xác nhận xóa tour"
                message="Bạn có chắc chắn muốn xóa tour này? Hành động này không thể hoàn tác và sẽ xóa tất cả các chuyến đi liên quan."
                confirmText="Xóa tour"
                cancelText="Hủy"
                variant="danger"
            />

            {/* Create Tour Modal */}
            {showCreateModal && (
                <CreateTourModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleTourCreated}
                />
            )}

            {/* Edit Tour Modal */}
            {tourToEdit && (
                <EditTourModal
                    tour={tourToEdit}
                    onClose={() => setTourToEdit(null)}
                    onSuccess={handleTourUpdated}
                />
            )}
        </div>
    );
};

export default MyTours;
