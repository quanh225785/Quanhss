import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Clock, CheckCircle, XCircle, Loader2, Info } from 'lucide-react';
import AddLocationModal from './AddLocationModal';
import { api } from '../../utils/api';

const LocationProposals = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

    useEffect(() => {
        fetchMySuggestions();
    }, []);

    const fetchMySuggestions = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/locations/suggestions/my');
            setSuggestions(response.data.result || []);
        } catch (err) {
            console.error('Error fetching suggestions:', err);
            setError('Không thể tải danh sách đề xuất. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSuccess = () => {
        setIsModalOpen(false);
        fetchMySuggestions();
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            PENDING: {
                label: 'Chờ duyệt',
                icon: Clock,
                className: 'bg-amber-50 text-amber-700',
            },
            APPROVED: {
                label: 'Đã duyệt',
                icon: CheckCircle,
                className: 'bg-emerald-50 text-emerald-700',
            },
            REJECTED: {
                label: 'Từ chối',
                icon: XCircle,
                className: 'bg-red-50 text-red-700',
            },
        };

        const config = statusConfig[status] || statusConfig.PENDING;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
                <Icon size={12} />
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const filteredSuggestions = suggestions.filter((s) => {
        if (filter === 'all') return true;
        return s.status.toLowerCase() === filter.toLowerCase();
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Đề xuất địa điểm</h2>
                    <p className="text-zinc-500">Gửi yêu cầu thêm địa điểm mới vào hệ thống.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors"
                >
                    <Plus size={16} />
                    Đề xuất địa điểm
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-zinc-200">
                {[
                    { key: 'all', label: 'Tất cả' },
                    { key: 'pending', label: 'Chờ duyệt' },
                    { key: 'approved', label: 'Đã duyệt' },
                    { key: 'rejected', label: 'Từ chối' },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${filter === tab.key
                            ? 'border-zinc-900 text-zinc-900'
                            : 'border-transparent text-zinc-500 hover:text-zinc-900'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-zinc-400" size={32} />
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <XCircle className="text-red-600 flex-shrink-0" size={20} />
                    <div>
                        <p className="text-sm text-red-800 font-medium">Lỗi</p>
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredSuggestions.length === 0 && (
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-8 text-center">
                    <MapPin className="mx-auto text-zinc-400 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-zinc-900 mb-2">Chưa có đề xuất nào</h3>
                    <p className="text-sm text-zinc-500 mb-4">
                        {filter === 'all'
                            ? 'Bạn chưa gửi đề xuất địa điểm nào. Hãy bắt đầu bằng cách nhấn nút "Đề xuất địa điểm".'
                            : `Không có đề xuất nào ở trạng thái "${filter === 'pending' ? 'Chờ duyệt' : filter === 'approved' ? 'Đã duyệt' : 'Từ chối'
                            }".`}
                    </p>
                    {filter === 'all' && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors"
                        >
                            <Plus size={16} />
                            Đề xuất địa điểm đầu tiên
                        </button>
                    )}
                </div>
            )}

            {/* Suggestions List */}
            {!loading && !error && filteredSuggestions.length > 0 && (
                <div className="grid gap-4">
                    {filteredSuggestions.map((suggestion) => (
                        <div
                            key={suggestion.id}
                            className="bg-white p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                    <div className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <MapPin className="text-zinc-400" size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-zinc-900 truncate">{suggestion.name}</h4>
                                        <p className="text-sm text-zinc-500 truncate">{suggestion.address}</p>
                                        {suggestion.description && (
                                            <p className="text-sm text-zinc-600 mt-1 line-clamp-2">
                                                {suggestion.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 mt-2">
                                            <p className="text-xs text-zinc-400">
                                                Gửi ngày: {formatDate(suggestion.createdAt)}
                                            </p>
                                            {suggestion.reviewedAt && (
                                                <p className="text-xs text-zinc-400">
                                                    Duyệt ngày: {formatDate(suggestion.reviewedAt)}
                                                </p>
                                            )}
                                        </div>
                                        {suggestion.rejectionReason && (
                                            <div className="mt-2 bg-red-50 border border-red-200 rounded p-2 flex items-start gap-2">
                                                <Info size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
                                                <p className="text-xs text-red-700">
                                                    <span className="font-medium">Lý do từ chối:</span>{' '}
                                                    {suggestion.rejectionReason}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-shrink-0">{getStatusBadge(suggestion.status)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Location Modal */}
            {isModalOpen && <AddLocationModal onClose={() => setIsModalOpen(false)} onSuccess={handleAddSuccess} />}
        </div>
    );
};

export default LocationProposals;
