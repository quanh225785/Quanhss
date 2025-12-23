import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Users, Loader2, Trash2, Edit, Check, AlertCircle } from 'lucide-react';
import { api } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../shared/Modal';
import ConfirmModal from '../shared/ConfirmModal';

const TripManagement = ({ tour, onClose, onSuccess }) => {
    const [trips, setTrips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [tripToDelete, setTripToDelete] = useState(null);

    // Form for new/edit trip
    const [showForm, setShowForm] = useState(false);
    const [editingTrip, setEditingTrip] = useState(null);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        maxParticipants: '',
    });

    useEffect(() => {
        fetchTrips();
    }, [tour.id]);

    const fetchTrips = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/trips/tour/${tour.id}`);
            if (response.data.code === 1000) {
                setTrips(response.data.result || []);
            }
        } catch (err) {
            console.error('Error fetching trips:', err);
            setError('Không thể tải danh sách chuyến');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.startDate || !formData.endDate || !formData.maxParticipants) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            setError('Ngày kết thúc phải sau ngày bắt đầu');
            return;
        }

        setIsSubmitting(true);

        try {
            if (editingTrip) {
                // Update existing trip
                await api.put(`/trips/${editingTrip.id}`, {
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    maxParticipants: parseInt(formData.maxParticipants),
                });
            } else {
                // Create new trip
                await api.post('/trips', {
                    tourId: tour.id,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    maxParticipants: parseInt(formData.maxParticipants),
                });
            }

            // Refresh trips and reset form
            await fetchTrips();
            setShowForm(false);
            setEditingTrip(null);
            setFormData({ startDate: '', endDate: '', maxParticipants: '' });
            onSuccess?.();
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể lưu chuyến. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (trip) => {
        setEditingTrip(trip);
        setFormData({
            startDate: trip.startDate ? new Date(trip.startDate).toISOString().slice(0, 16) : '',
            endDate: trip.endDate ? new Date(trip.endDate).toISOString().slice(0, 16) : '',
            maxParticipants: trip.maxParticipants?.toString() || '',
        });
        setShowForm(true);
    };

    const handleDelete = (tripId) => {
        setTripToDelete(tripId);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!tripToDelete) return;

        try {
            await api.delete(`/trips/${tripToDelete}`);
            await fetchTrips();
            setShowDeleteConfirm(false);
            setTripToDelete(null);
            showToast({
                type: 'success',
                message: 'Thành công',
                description: 'Đã xóa chuyến thành công'
            });
            onSuccess?.();
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể xóa chuyến');
        }
    };

    const handleToggleActive = async (trip) => {
        try {
            await api.put(`/trips/${trip.id}`, {
                isActive: !trip.isActive,
            });
            await fetchTrips();
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể cập nhật trạng thái');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Quản lý chuyến - ${tour.name}`} size="4xl">
            <div className="space-y-4">
                {/* Error */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                        <AlertCircle size={16} />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                {/* Add Trip Button */}
                {!showForm && (
                    <button
                        onClick={() => {
                            setEditingTrip(null);
                            setFormData({ startDate: '', endDate: '', maxParticipants: '' });
                            setShowForm(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        <Plus size={16} />
                        Thêm chuyến mới
                    </button>
                )}

                {/* Trip Form */}
                {showForm && (
                    <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                        <h3 className="font-medium text-zinc-900 mb-4">
                            {editingTrip ? 'Sửa chuyến' : 'Thêm chuyến mới'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-zinc-700">
                                        Ngày bắt đầu <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-zinc-700">
                                        Ngày kết thúc <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                        min={formData.startDate}
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-zinc-700">
                                        Số người tối đa <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.maxParticipants}
                                        onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: e.target.value }))}
                                        placeholder="VD: 20"
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Check size={16} />
                                    )}
                                    {editingTrip ? 'Cập nhật' : 'Tạo chuyến'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingTrip(null);
                                    }}
                                    className="px-4 py-2 text-zinc-700 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Trips List */}
                <div className="space-y-2">
                    <h3 className="font-medium text-zinc-900 flex items-center gap-2">
                        <Calendar size={16} />
                        Danh sách chuyến ({trips.length})
                    </h3>

                    {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <Loader2 className="animate-spin text-zinc-400" size={24} />
                        </div>
                    ) : trips.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500 bg-zinc-50 rounded-lg">
                            <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                            <p>Chưa có chuyến nào được tạo</p>
                            <p className="text-sm">Nhấn "Thêm chuyến mới" để bắt đầu</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {trips.map((trip) => (
                                <div
                                    key={trip.id}
                                    className={`p-4 border rounded-lg ${trip.isActive ? 'bg-white border-zinc-200' : 'bg-zinc-100 border-zinc-300'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${trip.isFull
                                                    ? 'bg-red-100 text-red-700'
                                                    : trip.isActive
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-zinc-200 text-zinc-600'
                                                    }`}>
                                                    {trip.isFull ? 'Đã đầy' : trip.isActive ? 'Đang mở' : 'Đã đóng'}
                                                </span>
                                            </div>
                                            <div className="text-sm text-zinc-600">
                                                <span className="font-medium">Thời gian:</span>{' '}
                                                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="flex items-center gap-1">
                                                    <Users size={14} />
                                                    <span className="font-medium">{trip.currentParticipants || 0}</span>
                                                    <span className="text-zinc-500">/ {trip.maxParticipants}</span>
                                                </span>
                                                <span className="text-zinc-500">
                                                    Còn {trip.availableSlots || 0} chỗ
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleActive(trip)}
                                                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${trip.isActive
                                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                    }`}
                                            >
                                                {trip.isActive ? 'Đóng' : 'Mở'}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(trip)}
                                                className="p-2 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            {(trip.currentParticipants || 0) === 0 && (
                                                <button
                                                    onClick={() => handleDelete(trip.id)}
                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setTripToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Xác nhận xóa"
                message="Bạn có chắc muốn xóa chuyến này? Hành động này không thể hoàn tác."
                variant="danger"
                confirmText="Xóa"
                cancelText="Hủy"
            />
        </Modal>
    );
};

export default TripManagement;
