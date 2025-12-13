import React, { useState, useEffect } from 'react';
import { X, MapPin, Loader2, Check, AlertCircle, Plus, Trash2, Route, Sparkles, Car, Bike, Search } from 'lucide-react';
import { api } from '../../utils/api';
import TourMap from './TourMap';

const CreateTourModal = ({ onClose, onSuccess }) => {
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        vehicle: 'car',
        useOptimization: false,
        roundtrip: false,
    });

    // Available approved locations
    const [availableLocations, setAvailableLocations] = useState([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(true);
    const [searchFilter, setSearchFilter] = useState('');

    // Selected locations for tour
    const [selectedLocations, setSelectedLocations] = useState([]);

    // Route preview
    const [routePreview, setRoutePreview] = useState(null);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);

    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Fetch approved locations on mount
    useEffect(() => {
        fetchApprovedLocations();
    }, []);

    const fetchApprovedLocations = async () => {
        setIsLoadingLocations(true);
        try {
            const response = await api.get('/locations');
            if (response.data.code === 1000) {
                setAvailableLocations(response.data.result || []);
            }
        } catch (err) {
            console.error('Error fetching locations:', err);
            setError('Không thể tải danh sách địa điểm');
        } finally {
            setIsLoadingLocations(false);
        }
    };

    // Filter locations by search query
    const filteredLocations = availableLocations.filter(loc => {
        if (!searchFilter.trim()) return true;
        const query = searchFilter.toLowerCase();
        return (
            loc.name?.toLowerCase().includes(query) ||
            loc.address?.toLowerCase().includes(query) ||
            loc.cityName?.toLowerCase().includes(query) ||
            loc.districtName?.toLowerCase().includes(query)
        );
    });

    // Check if location is already selected
    const isLocationSelected = (locationId) => {
        return selectedLocations.some(loc => loc.id === locationId);
    };

    const handleAddLocation = (location) => {
        if (isLocationSelected(location.id)) {
            setError('Địa điểm này đã được thêm');
            return;
        }

        setSelectedLocations(prev => [...prev, {
            id: location.id,
            name: location.name,
            address: location.address,
            latitude: location.latitude,
            longitude: location.longitude,
            orderIndex: prev.length,
        }]);
        setError(null);
        setRoutePreview(null);
    };

    const handleRemoveLocation = (index) => {
        setSelectedLocations(prev => {
            const updated = prev.filter((_, i) => i !== index);
            return updated.map((loc, i) => ({ ...loc, orderIndex: i }));
        });
        setRoutePreview(null);
    };

    const moveLocation = (fromIndex, toIndex) => {
        setSelectedLocations(prev => {
            const updated = [...prev];
            const [removed] = updated.splice(fromIndex, 1);
            updated.splice(toIndex, 0, removed);
            return updated.map((loc, i) => ({ ...loc, orderIndex: i }));
        });
        setRoutePreview(null);
    };

    const handlePreviewRoute = async () => {
        if (selectedLocations.length < 2) {
            setError('Cần ít nhất 2 địa điểm để xem tuyến đường');
            return;
        }

        setIsLoadingRoute(true);
        setError(null);

        try {
            const points = selectedLocations.map(
                loc => `${loc.latitude},${loc.longitude}`
            );

            const endpoint = formData.useOptimization ? '/vietmap/tsp' : '/vietmap/route';
            const response = await api.post(endpoint, {
                points,
                vehicle: formData.vehicle,
                roundtrip: formData.roundtrip,
            });

            if (response.data.code === 1000 && response.data.result?.paths?.[0]) {
                const path = response.data.result.paths[0];
                setRoutePreview({
                    polyline: path.points,
                    distance: path.distance,
                    time: path.time,
                });
            } else {
                setError('Không thể tính toán tuyến đường');
            }
        } catch (err) {
            setError('Lỗi khi tính toán tuyến đường');
        } finally {
            setIsLoadingRoute(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.name.trim()) {
            setError('Vui lòng nhập tên tour');
            return;
        }
        if (selectedLocations.length < 2) {
            setError('Tour cần ít nhất 2 địa điểm');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await api.post('/tours', {
                name: formData.name,
                description: formData.description,
                price: formData.price ? parseFloat(formData.price) : null,
                vehicle: formData.vehicle,
                useOptimization: formData.useOptimization,
                roundtrip: formData.roundtrip,
                points: selectedLocations.map((loc, index) => ({
                    locationId: loc.id,
                    orderIndex: index,
                    note: '',
                    stayDurationMinutes: 30,
                })),
            });

            if (response.data.code === 1000) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess?.();
                }, 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tạo tour. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-zinc-200 p-6 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900">Tạo Tour mới</h2>
                        <p className="text-sm text-zinc-500">Chọn các địa điểm từ danh sách đã duyệt</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-zinc-600 transition-colors"
                        disabled={isSubmitting}
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Tour Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-zinc-900">
                                Tên Tour <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="VD: Khám phá Hà Nội trong ngày"
                                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-zinc-900">Giá (VNĐ)</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                placeholder="VD: 500000"
                                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-zinc-900">Mô tả</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Mô tả về tour, điểm nổi bật..."
                            rows={3}
                            className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Vehicle & Optimization Options */}
                    <div className="flex flex-wrap gap-4 p-4 bg-zinc-50 rounded-lg">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-zinc-700">Phương tiện</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, vehicle: 'car' }))}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${formData.vehicle === 'car'
                                            ? 'bg-zinc-900 text-white'
                                            : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                                        }`}
                                >
                                    <Car size={16} /> Ô tô
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, vehicle: 'motorcycle' }))}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${formData.vehicle === 'motorcycle'
                                            ? 'bg-zinc-900 text-white'
                                            : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                                        }`}
                                >
                                    <Bike size={16} /> Xe máy
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 min-w-[200px] space-y-2">
                            <label className="block text-sm font-medium text-zinc-700">Tùy chọn tuyến đường</label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, useOptimization: !prev.useOptimization }));
                                        setRoutePreview(null);
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${formData.useOptimization
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                                        }`}
                                >
                                    <Sparkles size={16} />
                                    Tối ưu hóa (TSP)
                                </button>
                                {formData.useOptimization && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, roundtrip: !prev.roundtrip }));
                                            setRoutePreview(null);
                                        }}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${formData.roundtrip
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                                            }`}
                                    >
                                        Khứ hồi
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Two Column Layout: Available Locations & Selected Locations */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Available Locations */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-zinc-900">
                                    Địa điểm có sẵn
                                </label>
                                <span className="text-xs text-zinc-500">{availableLocations.length} địa điểm</span>
                            </div>

                            {/* Search filter */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                <input
                                    type="text"
                                    value={searchFilter}
                                    onChange={(e) => setSearchFilter(e.target.value)}
                                    placeholder="Tìm kiếm địa điểm..."
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                />
                            </div>

                            {isLoadingLocations ? (
                                <div className="flex items-center justify-center h-48 bg-zinc-50 rounded-lg">
                                    <Loader2 className="animate-spin text-zinc-400" size={24} />
                                </div>
                            ) : filteredLocations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 bg-zinc-50 rounded-lg text-center p-4">
                                    <MapPin className="text-zinc-300 mb-2" size={32} />
                                    <p className="text-sm text-zinc-500">
                                        {searchFilter ? 'Không tìm thấy địa điểm phù hợp' : 'Chưa có địa điểm nào được duyệt'}
                                    </p>
                                </div>
                            ) : (
                                <div className="h-64 overflow-y-auto border border-zinc-200 rounded-lg divide-y divide-zinc-100">
                                    {filteredLocations.map((location) => (
                                        <button
                                            key={location.id}
                                            type="button"
                                            onClick={() => handleAddLocation(location)}
                                            disabled={isLocationSelected(location.id)}
                                            className={`w-full px-4 py-3 text-left transition-colors ${isLocationSelected(location.id)
                                                    ? 'bg-emerald-50 cursor-not-allowed'
                                                    : 'hover:bg-zinc-50'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <MapPin className={`flex-shrink-0 mt-0.5 ${isLocationSelected(location.id) ? 'text-emerald-500' : 'text-zinc-400'
                                                    }`} size={16} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-zinc-900 truncate">
                                                        {location.name}
                                                    </p>
                                                    <p className="text-xs text-zinc-500 truncate">{location.address}</p>
                                                </div>
                                                {isLocationSelected(location.id) ? (
                                                    <Check className="text-emerald-500 flex-shrink-0" size={16} />
                                                ) : (
                                                    <Plus className="text-zinc-400 flex-shrink-0" size={16} />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected Locations */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-zinc-900">
                                    Địa điểm đã chọn <span className="text-red-500">*</span>
                                </label>
                                <span className="text-xs text-zinc-500">
                                    {selectedLocations.length} điểm
                                    {!formData.useOptimization && selectedLocations.length > 0 && " (kéo để sắp xếp)"}
                                </span>
                            </div>

                            {selectedLocations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 bg-zinc-50 rounded-lg border-2 border-dashed border-zinc-200 text-center p-4">
                                    <Plus className="text-zinc-300 mb-2" size={32} />
                                    <p className="text-sm text-zinc-500">Chọn địa điểm từ danh sách bên trái</p>
                                    <p className="text-xs text-zinc-400 mt-1">Cần ít nhất 2 điểm để tạo tour</p>
                                </div>
                            ) : (
                                <div className="h-64 overflow-y-auto border border-zinc-200 rounded-lg space-y-2 p-2">
                                    {selectedLocations.map((location, index) => (
                                        <div
                                            key={location.id}
                                            className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200"
                                        >
                                            {!formData.useOptimization && (
                                                <div className="flex flex-col gap-0.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => index > 0 && moveLocation(index, index - 1)}
                                                        disabled={index === 0}
                                                        className="text-zinc-400 hover:text-zinc-600 disabled:opacity-30 text-xs"
                                                    >
                                                        ▲
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => index < selectedLocations.length - 1 && moveLocation(index, index + 1)}
                                                        disabled={index === selectedLocations.length - 1}
                                                        className="text-zinc-400 hover:text-zinc-600 disabled:opacity-30 text-xs"
                                                    >
                                                        ▼
                                                    </button>
                                                </div>
                                            )}
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${index === 0 ? 'bg-emerald-500' :
                                                    index === selectedLocations.length - 1 ? 'bg-red-500' : 'bg-blue-500'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-zinc-900 truncate">{location.name}</p>
                                                <p className="text-xs text-zinc-500 truncate">{location.address}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveLocation(index)}
                                                className="text-zinc-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preview Route Button */}
                    {selectedLocations.length >= 2 && (
                        <button
                            type="button"
                            onClick={handlePreviewRoute}
                            disabled={isLoadingRoute}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {isLoadingRoute ? (
                                <Loader2 className="animate-spin" size={16} />
                            ) : (
                                <Route size={16} />
                            )}
                            Xem trước tuyến đường
                        </button>
                    )}

                    {/* Map Preview */}
                    {(selectedLocations.length > 0 || routePreview) && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-zinc-900">Bản đồ</label>
                            <TourMap
                                points={selectedLocations}
                                routePolyline={routePreview?.polyline}
                                totalDistance={routePreview?.distance}
                                totalTime={routePreview?.time}
                                isLoading={isLoadingRoute}
                            />
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
                            <Check className="text-emerald-600 flex-shrink-0" size={20} />
                            <p className="text-sm text-emerald-800">Tour đã được tạo thành công!</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-zinc-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 border border-zinc-300 rounded-lg text-zinc-700 font-medium hover:bg-zinc-50 transition-colors disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || success || selectedLocations.length < 2}
                            className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Đang tạo...
                                </>
                            ) : (
                                'Tạo Tour'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTourModal;
