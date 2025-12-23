import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, AlertCircle, Calendar, Clock, MapPin, Coffee, Images, Image as ImageIcon } from 'lucide-react';
import { api } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import MultipleImageUpload from '../common/MultipleImageUpload';
import ImageUpload from '../common/ImageUpload';

const EditTourModal = ({ tour, onClose, onSuccess }) => {
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [activeDay, setActiveDay] = useState(1);

    // Form data
    const [formData, setFormData] = useState({
        description: tour.description || '',
        imageUrls: tour.imageUrls || [],
        points: tour.points?.map(p => ({
            id: p.id,
            note: p.note || '',
            activity: p.activity || '',
            dayNumber: p.dayNumber || 1,
            startTime: p.startTime || '',
            locationName: p.locationName,
            imageUrl: p.imageUrl || '',
            isFreeActivity: !p.locationId
        })) || []
    });

    useEffect(() => {
        if (tour.points && tour.points.length > 0) {
            // Find the first day with points
            const minDay = Math.min(...tour.points.map(p => p.dayNumber || 1));
            setActiveDay(minDay);
        }
    }, [tour]);

    const handleUpdatePoint = (pointId, field, value) => {
        setFormData(prev => ({
            ...prev,
            points: prev.points.map(p =>
                p.id === pointId ? { ...p, [field]: value } : p
            )
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await api.put(`/tours/${tour.id}`, {
                description: formData.description,
                imageUrls: formData.imageUrls,
                points: formData.points.map(p => ({
                    id: p.id,
                    note: p.note,
                    activity: p.activity,
                    imageUrl: p.imageUrl
                }))
            });

            if (response.data.code === 1000) {
                showToast({
                    type: 'success',
                    message: 'Thành công',
                    description: 'Đã cập nhật tour thành công'
                });
                onSuccess?.();
            }
        } catch (err) {
            console.error('Error updating tour:', err);
            setError(err.response?.data?.message || 'Không thể cập nhật tour. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Group points by day
    const getPointsByDay = (day) => {
        return formData.points
            .filter(p => p.dayNumber === day)
            .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    };

    const days = [...new Set(formData.points.map(p => p.dayNumber))].sort((a, b) => a - b);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900">Sửa Tour</h2>
                        <p className="text-sm text-zinc-500 truncate max-w-[400px]">{tour.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-all"
                        disabled={isSubmitting}
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-red-700 text-sm">
                            <AlertCircle className="shrink-0 mt-0.5" size={16} />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Tour Images */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                            <Images size={16} className="text-primary" />
                            Hình ảnh Tour
                        </label>
                        <MultipleImageUpload
                            images={formData.imageUrls}
                            setImages={(urls) => setFormData(prev => ({ ...prev, imageUrls: urls }))}
                            maxImages={10}
                        />
                        <p className="text-[11px] text-zinc-400 italic">* Hình ảnh đầu tiên sẽ được chọn làm ảnh hiển thị chính.</p>
                    </div>

                    {/* Tour Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                            Mô tả Tour
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Nhập mô tả chung cho tour..."
                            rows={3}
                            className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all resize-none text-sm"
                        />
                    </div>

                    <div className="border-t border-zinc-100 pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-semibold text-zinc-700">Chi tiết từng điểm đến</label>
                            <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-[60%]">
                                {days.map(day => (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => setActiveDay(day)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${activeDay === day
                                            ? 'bg-zinc-900 text-white shadow-sm'
                                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                            }`}
                                    >
                                        Ngày {day}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {getPointsByDay(activeDay).length === 0 ? (
                                <p className="text-center py-8 text-zinc-400 text-sm italic">
                                    Không có điểm nào trong ngày này
                                </p>
                            ) : (
                                getPointsByDay(activeDay).map((point) => (
                                    <div key={point.id} className="p-5 border border-zinc-100 rounded-2xl bg-zinc-50/30 space-y-4">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            {/* Point Info */}
                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                                            {point.isFreeActivity ? (
                                                                <Coffee className="text-amber-500" size={16} />
                                                            ) : (
                                                                <MapPin className="text-blue-500" size={16} />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-zinc-900">
                                                                {point.locationName || 'Hoạt động tự do'}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <Clock size={12} className="text-zinc-400" />
                                                                <span className="text-xs font-medium text-zinc-500">{point.startTime || '--:--'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider ml-1">
                                                            Tên hoạt động
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={point.activity}
                                                            onChange={(e) => handleUpdatePoint(point.id, 'activity', e.target.value)}
                                                            placeholder="VD: Ăn sáng, Tham quan..."
                                                            className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all text-sm"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider ml-1">
                                                            Mô tả điểm đến
                                                        </label>
                                                        <textarea
                                                            value={point.note}
                                                            onChange={(e) => handleUpdatePoint(point.id, 'note', e.target.value)}
                                                            placeholder="Thêm ghi chú hoặc mô tả chi tiết cho điểm dừng này..."
                                                            rows={2}
                                                            className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all resize-none text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Point Image */}
                                            <div className="w-full md:w-48 shrink-0">
                                                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                                                    <ImageIcon size={12} />
                                                    Ảnh điểm dừng
                                                </label>
                                                <ImageUpload
                                                    image={point.imageUrl}
                                                    setImage={(url) => handleUpdatePoint(point.id, 'imageUrl', url)}
                                                    className="aspect-square md:aspect-[4/3]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-zinc-200 text-zinc-700 rounded-xl font-semibold hover:bg-zinc-100 transition-all text-sm"
                        disabled={isSubmitting}
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2.5 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-zinc-200"
                    >
                        {isSubmitting ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <Save size={18} />
                        )}
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditTourModal;
