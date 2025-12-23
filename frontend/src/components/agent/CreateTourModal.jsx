import React, { useState, useEffect } from 'react';
import { X, MapPin, Loader2, Check, AlertCircle, Plus, Trash2, Route, Sparkles, Car, Bike, Search, Calendar, Clock, Coffee, Sun, Moon, Image as ImageIcon, Images } from 'lucide-react';
import { api } from '../../utils/api';
import TourMap from './TourMap';
import ImageUpload from '../common/ImageUpload';
import MultipleImageUpload from '../common/MultipleImageUpload';

const CreateTourModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        numberOfDays: 1,
        vehicle: 'car',
        useOptimization: false,
        roundtrip: false,
        imageUrls: [],  // Multiple tour images
    });

    // Available approved locations
    const [availableLocations, setAvailableLocations] = useState([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(true);
    const [searchFilter, setSearchFilter] = useState('');

    // Selected locations for tour with itinerary info
    const [selectedLocations, setSelectedLocations] = useState([]);

    // Active day for adding locations
    const [activeDay, setActiveDay] = useState(1);

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

    // Get locations for a specific day
    const getLocationsForDay = (day) => {
        return selectedLocations.filter(loc => loc.dayNumber === day);
    };

    const handleAddLocation = (location) => {
        if (isLocationSelected(location.id)) {
            setError('Địa điểm này đã được thêm');
            return;
        }

        // Find the highest orderIndex for the current day
        const dayLocations = getLocationsForDay(activeDay);
        const maxOrderIndex = dayLocations.length > 0
            ? Math.max(...dayLocations.map(l => l.orderIndex)) + 1
            : 0;

        // Generate a suggested time based on existing locations
        const suggestedTime = generateSuggestedTime(dayLocations.length);

        // Use unique ID combining location id with timestamp to allow same location on different days
        const uniqueId = `loc_${location.id}_${Date.now()}`;

        setSelectedLocations(prev => [...prev, {
            id: uniqueId,
            locationId: location.id,  // Store original locationId for API
            name: location.name,
            address: location.address,
            latitude: location.latitude,
            longitude: location.longitude,
            orderIndex: maxOrderIndex,
            dayNumber: activeDay,
            startTime: suggestedTime,
            activity: location.name, // Default activity is location name
            isFreeActivity: false,
            imageUrl: '',  // Tour point image
        }]);
        setError(null);
        setRoutePreview(null);
    };

    // Add a free activity (no location required)
    const handleAddFreeActivity = () => {
        const dayLocations = getLocationsForDay(activeDay);
        const maxOrderIndex = dayLocations.length > 0
            ? Math.max(...dayLocations.map(l => l.orderIndex)) + 1
            : 0;
        const suggestedTime = generateSuggestedTime(dayLocations.length);

        const uniqueId = `free_${Date.now()}`;

        setSelectedLocations(prev => [...prev, {
            id: uniqueId,
            locationId: null,  // No location for free activities
            name: null,
            address: null,
            latitude: null,
            longitude: null,
            orderIndex: maxOrderIndex,
            dayNumber: activeDay,
            startTime: suggestedTime,
            activity: '', // User will fill this in
            isFreeActivity: true,
        }]);
        setError(null);
    };

    // Generate a suggested time based on the number of existing locations
    const generateSuggestedTime = (existingCount) => {
        const baseTimes = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
        if (existingCount < baseTimes.length) {
            return baseTimes[existingCount];
        }
        return '09:00';
    };

    const handleRemoveLocation = (locationId) => {
        setSelectedLocations(prev => {
            const updated = prev.filter(loc => loc.id !== locationId);
            // Reorder within each day
            const reordered = [];
            for (let day = 1; day <= formData.numberOfDays; day++) {
                const dayLocs = updated.filter(l => l.dayNumber === day);
                dayLocs.forEach((loc, idx) => {
                    reordered.push({ ...loc, orderIndex: idx });
                });
            }
            return reordered;
        });
        setRoutePreview(null);
    };

    const handleUpdateItinerary = (locationId, field, value) => {
        setSelectedLocations(prev =>
            prev.map(loc =>
                loc.id === locationId ? { ...loc, [field]: value } : loc
            )
        );
    };

    const moveLocation = (locationId, direction) => {
        setSelectedLocations(prev => {
            const location = prev.find(l => l.id === locationId);
            if (!location) return prev;

            const dayLocs = prev.filter(l => l.dayNumber === location.dayNumber);
            const otherLocs = prev.filter(l => l.dayNumber !== location.dayNumber);

            const currentIndex = dayLocs.findIndex(l => l.id === locationId);
            const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

            if (newIndex < 0 || newIndex >= dayLocs.length) return prev;

            // Swap positions
            const reordered = [...dayLocs];
            [reordered[currentIndex], reordered[newIndex]] = [reordered[newIndex], reordered[currentIndex]];

            // Update orderIndex
            reordered.forEach((loc, idx) => {
                loc.orderIndex = idx;
            });

            return [...otherLocs, ...reordered];
        });
        setRoutePreview(null);
    };

    const handleNumberOfDaysChange = (newDays) => {
        const oldDays = formData.numberOfDays;
        setFormData(prev => ({ ...prev, numberOfDays: newDays }));

        if (newDays < oldDays) {
            // Remove locations from days that no longer exist
            setSelectedLocations(prev => prev.filter(loc => loc.dayNumber <= newDays));
            if (activeDay > newDays) {
                setActiveDay(newDays);
            }
        }
    };

    // Calculate distance between two points using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Optimize order of locations for current day using Nearest Neighbor algorithm
    const handleOptimizeOrder = () => {
        const dayLocs = getLocationsForDay(activeDay).filter(loc => loc.latitude && loc.longitude);
        const otherLocs = selectedLocations.filter(l => l.dayNumber !== activeDay || !l.latitude || !l.longitude);

        if (dayLocs.length < 2) {
            setError('Cần ít nhất 2 địa điểm có tọa độ để tối ưu');
            return;
        }

        // Nearest Neighbor algorithm - start from first point
        const optimized = [dayLocs[0]];
        const remaining = dayLocs.slice(1);

        while (remaining.length > 0) {
            const current = optimized[optimized.length - 1];
            let nearestIndex = 0;
            let minDistance = calculateDistance(
                current.latitude, current.longitude,
                remaining[0].latitude, remaining[0].longitude
            );

            for (let i = 1; i < remaining.length; i++) {
                const dist = calculateDistance(
                    current.latitude, current.longitude,
                    remaining[i].latitude, remaining[i].longitude
                );
                if (dist < minDistance) {
                    minDistance = dist;
                    nearestIndex = i;
                }
            }

            optimized.push(remaining[nearestIndex]);
            remaining.splice(nearestIndex, 1);
        }

        // Update orderIndex for optimized locations
        optimized.forEach((loc, idx) => {
            loc.orderIndex = idx;
        });

        // Combine with other locations and update state
        setSelectedLocations([...otherLocs, ...optimized]);
        setRoutePreview(null);
        setError(null);
    };

    const handlePreviewRoute = async () => {
        const dayLocations = getLocationsForDay(activeDay);
        if (dayLocations.length < 2) {
            setError(`Ngày ${activeDay} cần ít nhất 2 địa điểm để xem tuyến đường`);
            return;
        }

        setIsLoadingRoute(true);
        setError(null);

        try {
            // Only include locations with coordinates for route preview (for active day only)
            const locationPoints = dayLocations
                .filter(loc => loc.latitude && loc.longitude)
                .sort((a, b) => a.orderIndex - b.orderIndex);

            if (locationPoints.length < 2) {
                setError('Cần ít nhất 2 địa điểm có vị trí để xem tuyến đường');
                setIsLoadingRoute(false);
                return;
            }

            const points = locationPoints.map(loc => `${loc.latitude},${loc.longitude}`);

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
            // Sort locations by day and orderIndex before submitting
            const sortedLocations = selectedLocations.sort((a, b) => {
                if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber;
                return a.orderIndex - b.orderIndex;
            });

            const response = await api.post('/tours', {
                name: formData.name,
                description: formData.description,
                price: formData.price ? parseFloat(formData.price) : null,
                numberOfDays: formData.numberOfDays,
                vehicle: formData.vehicle,
                useOptimization: formData.useOptimization,
                roundtrip: formData.roundtrip,
                imageUrl: formData.imageUrls.length > 0 ? formData.imageUrls[0] : null,  // First image as thumbnail
                imageUrls: formData.imageUrls,  // All images
                points: sortedLocations.map((loc, index) => ({
                    locationId: loc.locationId || null,  // Can be null for free activities
                    orderIndex: index,
                    note: '',
                    stayDurationMinutes: 30,
                    dayNumber: loc.dayNumber,
                    startTime: loc.startTime,
                    activity: loc.activity,
                    imageUrl: loc.imageUrl || null,  // Tour point image
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
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-zinc-200 p-6 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900">Tạo Tour mới</h2>
                        <p className="text-sm text-zinc-500">Tạo lịch trình tour theo ngày và khung giờ</p>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-zinc-900">
                                Tên Tour <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="VD: Khám phá Đà Nẵng 2N1Đ"
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
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-zinc-900">Số ngày</label>
                            <div className="flex gap-2 items-center">
                                {[1, 2, 3, 5, 7].map(day => (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => handleNumberOfDaysChange(day)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${formData.numberOfDays === day
                                            ? 'bg-zinc-900 text-white'
                                            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                                            }`}
                                    >
                                        {day}N
                                    </button>
                                ))}
                                <input
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={formData.numberOfDays}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 1;
                                        handleNumberOfDaysChange(Math.max(1, Math.min(30, val)));
                                    }}
                                    className="w-16 px-2 py-2 text-center border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-zinc-900">Mô tả</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Mô tả về tour, điểm nổi bật..."
                            rows={2}
                            className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Info note about trips */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Lưu ý:</strong> Sau khi tour được Admin duyệt, bạn có thể tạo các <strong>"Chuyến"</strong> với ngày cụ thể và số lượng người tham gia. Khách hàng sẽ đặt chỗ theo từng chuyến.
                        </p>
                    </div>

                    {/* Tour Images (Multiple) */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-zinc-900">
                            <div className="flex items-center gap-2">
                                <Images size={16} />
                                Ảnh Tour
                                <span className="text-xs text-zinc-500 font-normal">(Ảnh đầu tiên sẽ là ảnh bìa)</span>
                            </div>
                        </label>
                        <MultipleImageUpload
                            folder="tours"
                            imageUrls={formData.imageUrls}
                            onImagesChange={(urls) => setFormData(prev => ({ ...prev, imageUrls: urls }))}
                            maxImages={10}
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

                    {/* Day Tabs */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                            <Calendar size={18} className="text-zinc-500 flex-shrink-0" />
                            {Array.from({ length: formData.numberOfDays }, (_, i) => i + 1).map(day => (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => {
                                        setActiveDay(day);
                                        setRoutePreview(null); // Clear route preview when switching days
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeDay === day
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                                        }`}
                                >
                                    Ngày {day}
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeDay === day ? 'bg-blue-500' : 'bg-zinc-200'
                                        }`}>
                                        {getLocationsForDay(day).length}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Two Column Layout: Available Locations & Day Itinerary */}
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

                        {/* Day Itinerary */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-zinc-900">
                                    Lịch trình Ngày {activeDay} <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-zinc-500">
                                        {getLocationsForDay(activeDay).length} điểm
                                    </span>
                                    {getLocationsForDay(activeDay).filter(loc => loc.latitude && loc.longitude).length >= 2 && (
                                        <button
                                            type="button"
                                            onClick={handleOptimizeOrder}
                                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
                                        >
                                            <Sparkles size={12} />
                                            Tối ưu thứ tự
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleAddFreeActivity}
                                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded transition-colors"
                                    >
                                        <Coffee size={12} />
                                        + Hoạt động tự do
                                    </button>
                                </div>
                            </div>

                            {getLocationsForDay(activeDay).length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 bg-zinc-50 rounded-lg border-2 border-dashed border-zinc-200 text-center p-4">
                                    <Clock className="text-zinc-300 mb-2" size={32} />
                                    <p className="text-sm text-zinc-500">Chọn địa điểm từ danh sách bên trái</p>
                                    <p className="text-xs text-zinc-400 mt-1">hoặc thêm hoạt động tự do (nghỉ ngơi, ăn trưa...)</p>
                                </div>
                            ) : (
                                <div className="h-64 overflow-y-auto border border-zinc-200 rounded-lg p-3 space-y-3">
                                    {getLocationsForDay(activeDay)
                                        .sort((a, b) => a.orderIndex - b.orderIndex)
                                        .map((location, index) => (
                                            <div
                                                key={location.id}
                                                className={`border rounded-lg p-3 shadow-sm ${location.isFreeActivity
                                                    ? 'bg-amber-50 border-amber-200'
                                                    : 'bg-white border-zinc-200'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {/* Move buttons */}
                                                    <div className="flex flex-col gap-0.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => moveLocation(location.id, 'up')}
                                                            disabled={index === 0}
                                                            className="text-zinc-400 hover:text-zinc-600 disabled:opacity-30 text-xs"
                                                        >
                                                            ▲
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => moveLocation(location.id, 'down')}
                                                            disabled={index === getLocationsForDay(activeDay).length - 1}
                                                            className="text-zinc-400 hover:text-zinc-600 disabled:opacity-30 text-xs"
                                                        >
                                                            ▼
                                                        </button>
                                                    </div>

                                                    {/* Time input */}
                                                    <div className="flex-shrink-0">
                                                        <input
                                                            type="time"
                                                            value={location.startTime || ''}
                                                            onChange={(e) => handleUpdateItinerary(location.id, 'startTime', e.target.value)}
                                                            className="w-24 px-2 py-1 text-sm font-medium border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        />
                                                    </div>

                                                    {/* Location info and activity */}
                                                    <div className="flex-1 min-w-0 space-y-1">
                                                        {location.isFreeActivity ? (
                                                            <div className="flex items-center gap-1 text-amber-600 text-xs mb-1">
                                                                <Coffee size={12} />
                                                                <span>Hoạt động tự do</span>
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm font-medium text-zinc-900 truncate flex items-center gap-1">
                                                                <MapPin size={12} className="text-zinc-400" />
                                                                {location.name}
                                                            </p>
                                                        )}
                                                        <input
                                                            type="text"
                                                            value={location.activity || ''}
                                                            onChange={(e) => handleUpdateItinerary(location.id, 'activity', e.target.value)}
                                                            placeholder={location.isFreeActivity ? "VD: Nghỉ ngơi, Ăn trưa..." : "Hoạt động tại đây..."}
                                                            className={`w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${location.isFreeActivity
                                                                ? 'border-amber-200 bg-white'
                                                                : 'border-zinc-200'
                                                                }`}
                                                        />
                                                    </div>

                                                    {/* Image upload for tour point */}
                                                    <ImageUpload
                                                        folder="tour-points"
                                                        currentImageUrl={location.imageUrl}
                                                        onUploadComplete={(url) => handleUpdateItinerary(location.id, 'imageUrl', url)}
                                                        onRemove={() => handleUpdateItinerary(location.id, 'imageUrl', '')}
                                                        compact={true}
                                                    />

                                                    {/* Delete button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveLocation(location.id)}
                                                        className="text-zinc-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* All Days Summary */}
                    {selectedLocations.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-zinc-800 mb-3">Tổng quan lịch trình</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Array.from({ length: formData.numberOfDays }, (_, i) => i + 1).map(day => {
                                    const dayLocs = getLocationsForDay(day).sort((a, b) => a.orderIndex - b.orderIndex);
                                    return (
                                        <div key={day} className="bg-white rounded-lg p-3 shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-blue-600">Ngày {day}</span>
                                                <span className="text-xs text-zinc-500">{dayLocs.length} điểm</span>
                                            </div>
                                            <div className="space-y-1">
                                                {dayLocs.length === 0 ? (
                                                    <p className="text-xs text-zinc-400 italic">Chưa có lịch trình</p>
                                                ) : (
                                                    dayLocs.map(loc => (
                                                        <div key={loc.id} className="flex items-center gap-2 text-xs">
                                                            <span className="text-blue-500 font-medium w-12">{loc.startTime || '--:--'}</span>
                                                            {loc.isFreeActivity ? (
                                                                <span className="text-amber-600 truncate flex items-center gap-1">
                                                                    <Coffee size={10} />
                                                                    {loc.activity || 'Hoạt động tự do'}
                                                                </span>
                                                            ) : (
                                                                <span className="text-zinc-600 truncate">{loc.activity || loc.name}</span>
                                                            )}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Preview Route Button - Only show when active day has 2+ locations */}
                    {getLocationsForDay(activeDay).length >= 2 && (
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
                            Xem trước tuyến đường Ngày {activeDay}
                        </button>
                    )}

                    {/* Map Preview - Shows only active day's locations */}
                    {(getLocationsForDay(activeDay).length > 0 || routePreview) && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-zinc-900">
                                Bản đồ - Ngày {activeDay}
                            </label>
                            <TourMap
                                points={getLocationsForDay(activeDay).sort((a, b) => a.orderIndex - b.orderIndex)}
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
