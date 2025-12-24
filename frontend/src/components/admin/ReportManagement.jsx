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
            <div className="bg-white/70 backdrop-blur-2xl border border-white/40 p-10 rounded-[3rem] shadow-2xl shadow-black/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-8 bg-primary rounded-full"></div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">
                            Quản lý báo cáo
                        </h1>
                    </div>
                    <p className="text-slate-500 font-medium ml-5">
                        Theo dõi và xử lý các khiếu nại, báo cáo vi phạm từ cộng đồng.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchReports}
                        className="p-4 bg-white/50 border border-white/40 hover:bg-white rounded-2xl transition-all shadow-sm active:scale-95 group"
                        title="Làm mới"
                    >
                        <RefreshCw size={20} className="text-slate-600 group-hover:rotate-180 transition-transform duration-500" />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white/40 shadow-xl shadow-black/5">
                <div className="p-3 bg-slate-100/50 rounded-xl mr-2">
                    <Filter size={18} className="text-slate-500" />
                </div>
                <div className="flex flex-wrap gap-3">
                    {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === status
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'bg-white/50 border border-white/40 text-slate-500 hover:text-slate-900 hover:bg-white'
                                }`}
                        >
                            {status === 'ALL' && 'Tất cả'}
                            {status === 'PENDING' && `Chờ xử lý (${reports.filter(r => r.status === 'PENDING').length})`}
                            {status === 'APPROVED' && 'Đã duyệt'}
                            {status === 'REJECTED' && 'Đã từ chối'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reports List */}
            {filteredReports.length === 0 ? (
                <div className="bg-white/70 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] p-24 text-center shadow-2xl shadow-black/5">
                    <div className="bg-slate-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/40 shadow-inner">
                        <Flag size={48} className="text-slate-300" />
                    </div>
                    <p className="text-slate-900 font-black text-2xl tracking-tight mb-2">Không có báo cáo nào</p>
                    <p className="text-slate-500 font-medium tracking-tight">Hệ thống hiện tại chưa ghi nhận khiếu nại nào ở mục này.</p>
                </div>
            ) : (
                <div className="bg-white/70 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="bg-white/50 border-b border-white/40">
                                    <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500">
                                        Người báo cáo
                                    </th>
                                    <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500">
                                        Đối tượng
                                    </th>
                                    <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500">
                                        Lý do
                                    </th>
                                    <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500">
                                        Thời gian
                                    </th>
                                    <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500">
                                        Trạng thái
                                    </th>
                                    <th className="px-8 py-6 text-right text-xs font-black uppercase tracking-widest text-slate-500">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/20">
                                {filteredReports.map((report) => (
                                    <tr key={report.id} className="group hover:bg-white/80 transition-all border-b border-white/20 last:border-0">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-indigo-50/50 flex items-center justify-center text-indigo-600 font-black text-xs border border-indigo-100 group-hover:scale-110 transition-transform">
                                                    {report.reporterName?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 tracking-tight">
                                                        {report.reporterName}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase">
                                                        {report.reporterEmail}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 uppercase">
                                            <div>
                                                {getTargetTypeBadge(report.targetType)}
                                                <p className="text-xs font-black text-slate-700 mt-2 tracking-tight">
                                                    {report.targetName}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs font-bold text-slate-600 max-w-xs truncate" title={report.reason}>
                                                {report.reason}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs font-black text-slate-400 font-sans uppercase">
                                                {formatDate(report.createdAt)}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6">
                                            {getStatusBadge(report.status)}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {report.status === 'PENDING' ? (
                                                <button
                                                    onClick={() => openProcessModal(report)}
                                                    className="px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                                                >
                                                    Xử lý
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => openProcessModal(report)}
                                                    className="p-4 bg-white/50 border border-white/40 text-slate-600 hover:text-primary hover:bg-white rounded-2xl transition-all shadow-sm active:scale-95"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye size={18} />
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
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-300">
                    <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] border border-white/40 p-10 w-full max-w-2xl shadow-2xl transform animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-100">
                                    <Flag className="text-blue-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                        Chi tiết báo cáo
                                    </h3>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Mã báo cáo: #{selectedReport.id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowProcessModal(false);
                                    setSelectedReport(null);
                                }}
                                className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all active:scale-95"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Người báo cáo</p>
                                    <p className="text-base font-black text-slate-900 tracking-tight">{selectedReport.reporterName}</p>
                                </div>
                                <div className="space-y-2 text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Đối tượng bị báo cáo</p>
                                    <div className="flex flex-col items-end gap-1">
                                        {getTargetTypeBadge(selectedReport.targetType)}
                                        <span className="text-base font-black text-slate-900 tracking-tight">{selectedReport.targetName}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/50 p-8 rounded-[2rem] border border-white/40 shadow-inner">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Lý do khiếu nại</p>
                                <p className="text-base font-bold text-slate-700 leading-relaxed italic">"{selectedReport.reason}"</p>
                            </div>

                            <div className="grid grid-cols-2 gap-8 items-end">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Thời gian gửi</p>
                                    <p className="text-sm font-black text-slate-900 font-sans tracking-tight">{formatDate(selectedReport.createdAt)}</p>
                                </div>
                                <div className="space-y-2 text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trạng thái hiện tại</p>
                                    <div className="flex justify-end">{getStatusBadge(selectedReport.status)}</div>
                                </div>
                            </div>

                            {selectedReport.adminNote && (
                                <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Ghi chú quản trị</p>
                                    <p className="text-sm font-bold text-indigo-900 leading-relaxed">{selectedReport.adminNote}</p>
                                </div>
                            )}

                            {selectedReport.status === 'PENDING' && (
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                                        Ghi chú xử lý mới (Tùy chọn)
                                    </label>
                                    <textarea
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                        placeholder="Nhập ghi chú hoặc hướng xử lý cho báo cáo này..."
                                        className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none shadow-inner"
                                        rows={3}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {selectedReport.status === 'PENDING' && (
                            <div className="mt-10 pt-10 border-t border-slate-100 flex gap-4">
                                <button
                                    onClick={() => handleProcess(false)}
                                    disabled={processing}
                                    className="flex-1 px-8 py-5 border border-slate-200 text-slate-700 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <XCircle size={18} />
                                    Từ chối
                                </button>
                                <button
                                    onClick={() => handleProcess(true)}
                                    disabled={processing}
                                    className="flex-3 px-8 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {processing ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <CheckCircle size={20} />
                                    )}
                                    Duyệt & Cảnh báo vi phạm
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
