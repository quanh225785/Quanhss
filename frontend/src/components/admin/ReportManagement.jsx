import React, { useState, useEffect } from 'react';
import {
    Flag,
    Loader2,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    User,
    Filter,
    RefreshCw,
    Eye,
    X,
} from 'lucide-react';
import { api } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const ReportManagement = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED
    const [selectedReport, setSelectedReport] = useState(null);
    const [showProcessModal, setShowProcessModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [adminNote, setAdminNote] = useState('');
    const { showToast } = useToast();

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await api.get('/reports');
            setReports(response.data.result || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
            showToast({
                type: 'error',
                message: 'Lỗi tải dữ liệu',
                description: 'Không thể tải danh sách báo cáo'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleProcess = async (approved) => {
        if (!selectedReport) return;

        try {
            setProcessing(true);
            await api.post(`/reports/${selectedReport.id}/process`, {
                approved,
                adminNote: adminNote.trim() || null
            });

            showToast({
                type: 'success',
                message: approved ? 'Đã duyệt báo cáo' : 'Đã từ chối báo cáo',
                description: approved
                    ? 'Thông báo cảnh báo đã được gửi đến đối tượng vi phạm'
                    : 'Báo cáo đã được đánh dấu là không hợp lệ'
            });

            setShowProcessModal(false);
            setSelectedReport(null);
            setAdminNote('');
            fetchReports();
        } catch (error) {
            console.error('Error processing report:', error);
            showToast({
                type: 'error',
                message: 'Lỗi xử lý',
                description: error.response?.data?.message || 'Không thể xử lý báo cáo'
            });
        } finally {
            setProcessing(false);
        }
    };

    const openProcessModal = (report) => {
        setSelectedReport(report);
        setAdminNote('');
        setShowProcessModal(true);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock size={12} />
                        Chờ xử lý
                    </span>
                );
            case 'APPROVED':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle size={12} />
                        Đã duyệt
                    </span>
                );
            case 'REJECTED':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle size={12} />
                        Đã từ chối
                    </span>
                );
            default:
                return null;
        }
    };

    const getTargetTypeBadge = (targetType) => {
        switch (targetType) {
            case 'AGENT':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Đại lý
                    </span>
                );
            case 'TOUR':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        Tour
                    </span>
                );
            case 'REVIEW':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                        Đánh giá
                    </span>
                );
            default:
                return null;
        }
    };

    const filteredReports = reports.filter(report => {
        if (filter === 'ALL') return true;
        return report.status === filter;
    });

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-slate-900">
                        Quản lý báo cáo
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Xem và xử lý các báo cáo vi phạm từ người dùng
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchReports}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                        title="Làm mới"
                    >
                        <RefreshCw size={20} className="text-slate-600" />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
                <Filter size={18} className="text-slate-500" />
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === status
                                ? 'bg-primary text-white'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        {status === 'ALL' && 'Tất cả'}
                        {status === 'PENDING' && `Chờ xử lý (${reports.filter(r => r.status === 'PENDING').length})`}
                        {status === 'APPROVED' && 'Đã duyệt'}
                        {status === 'REJECTED' && 'Đã từ chối'}
                    </button>
                ))}
            </div>

            {/* Reports List */}
            {filteredReports.length === 0 ? (
                <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl p-12 text-center">
                    <Flag size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">Không có báo cáo nào</p>
                </div>
            ) : (
                <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Người báo cáo
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Đối tượng
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Lý do
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Thời gian
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredReports.map((report) => (
                                    <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-sm font-bold">
                                                    <User size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">
                                                        {report.reporterName}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {report.reporterEmail}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                {getTargetTypeBadge(report.targetType)}
                                                <p className="text-sm font-medium text-slate-900 mt-1">
                                                    {report.targetName}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-600 max-w-xs truncate" title={report.reason}>
                                                {report.reason}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-600">
                                                {formatDate(report.createdAt)}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(report.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {report.status === 'PENDING' ? (
                                                <button
                                                    onClick={() => openProcessModal(report)}
                                                    className="px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                                                >
                                                    Xử lý
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => openProcessModal(report)}
                                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye size={18} className="text-slate-500" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Process Modal */}
            {showProcessModal && selectedReport && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-xl">
                                    <Flag className="text-blue-600" size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Chi tiết báo cáo
                                </h3>
                            </div>
                            <button
                                onClick={() => {
                                    setShowProcessModal(false);
                                    setSelectedReport(null);
                                }}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500">Người báo cáo</p>
                                    <p className="font-medium text-slate-900">{selectedReport.reporterName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Đối tượng</p>
                                    <div className="flex items-center gap-2">
                                        {getTargetTypeBadge(selectedReport.targetType)}
                                        <span className="font-medium text-slate-900">{selectedReport.targetName}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500 mb-1">Lý do báo cáo</p>
                                <p className="p-3 bg-slate-50 rounded-xl text-slate-700">{selectedReport.reason}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500">Thời gian</p>
                                    <p className="font-medium text-slate-900">{formatDate(selectedReport.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Trạng thái</p>
                                    {getStatusBadge(selectedReport.status)}
                                </div>
                            </div>

                            {selectedReport.adminNote && (
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Ghi chú admin</p>
                                    <p className="p-3 bg-blue-50 rounded-xl text-blue-700">{selectedReport.adminNote}</p>
                                </div>
                            )}

                            {selectedReport.status === 'PENDING' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Ghi chú xử lý (tùy chọn)
                                    </label>
                                    <textarea
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                        placeholder="Nhập ghi chú cho báo cáo này..."
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                        rows={3}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {selectedReport.status === 'PENDING' && (
                            <div className="p-6 border-t border-slate-100 flex gap-3">
                                <button
                                    onClick={() => handleProcess(false)}
                                    disabled={processing}
                                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <XCircle size={18} />
                                    Từ chối
                                </button>
                                <button
                                    onClick={() => handleProcess(true)}
                                    disabled={processing}
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {processing ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <CheckCircle size={18} />
                                    )}
                                    Duyệt & Cảnh báo
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportManagement;
