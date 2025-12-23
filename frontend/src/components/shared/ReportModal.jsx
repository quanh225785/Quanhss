import React, { useState } from 'react';
import { X, Flag, Loader2, AlertTriangle } from 'lucide-react';
import { api } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const ReportModal = ({ isOpen, onClose, targetType, targetId, targetName }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (reason.trim().length < 10) {
            showToast({
                type: 'error',
                message: 'Lý do quá ngắn',
                description: 'Vui lòng nhập ít nhất 10 ký tự'
            });
            return;
        }

        try {
            setLoading(true);
            await api.post('/reports', {
                targetType,
                targetId,
                reason: reason.trim()
            });

            showToast({
                type: 'success',
                message: 'Gửi báo cáo thành công',
                description: 'Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét trong thời gian sớm nhất.'
            });

            setReason('');
            onClose();
        } catch (error) {
            console.error('Error submitting report:', error);
            const errorMessage = error.response?.data?.message || 'Không thể gửi báo cáo. Vui lòng thử lại.';
            showToast({
                type: 'error',
                message: 'Lỗi gửi báo cáo',
                description: errorMessage
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const getTargetLabel = () => {
        switch (targetType) {
            case 'AGENT':
                return 'đại lý';
            case 'TOUR':
                return 'tour';
            case 'REVIEW':
                return 'đánh giá';
            default:
                return 'nội dung';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-xl">
                            <Flag className="text-red-600" size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Báo cáo {getTargetLabel()}
                            </h3>
                            <p className="text-sm text-slate-500">
                                {targetName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                        <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-sm text-amber-800">
                            Vui lòng chỉ báo cáo khi bạn tin rằng {getTargetLabel()} này vi phạm quy định của chúng tôi.
                        </p>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Lý do báo cáo <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Mô tả chi tiết lý do bạn muốn báo cáo (tối thiểu 10 ký tự)..."
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                            rows={4}
                            required
                            minLength={10}
                        />
                        <p className="mt-1 text-xs text-slate-500">
                            {reason.length}/10 ký tự tối thiểu
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading || reason.trim().length < 10}
                            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Đang gửi...
                                </>
                            ) : (
                                <>
                                    <Flag size={18} />
                                    Gửi báo cáo
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportModal;
