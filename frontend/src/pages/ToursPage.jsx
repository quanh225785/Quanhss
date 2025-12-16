import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  Route,
  Heart,
  Car,
  Bike,
  Loader2,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';
import { api } from '../utils/api';
import { formatDistance } from '../utils/polylineUtils';

const ToursPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [numberOfDays, setNumberOfDays] = useState(searchParams.get('numberOfDays') || '');
  const [vehicle, setVehicle] = useState(searchParams.get('vehicle') || '');
  const [locationId, setLocationId] = useState(searchParams.get('locationId') || '');

  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchLocations();
    fetchTours();
  }, []);

  useEffect(() => {
    fetchTours();
  }, [searchParams]);

  const fetchLocations = async () => {
    try {
      const response = await api.get('/locations');
      if (response.data.code === 1000) {
        setLocations(response.data.result || []);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchTours = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (keyword) params.append('keyword', keyword);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (numberOfDays) params.append('numberOfDays', numberOfDays);
      if (vehicle) params.append('vehicle', vehicle);
      if (locationId) params.append('locationId', locationId);

      const url = `/tours/search${params.toString() ? '?' + params.toString() : ''}`;

      const response = await api.get(url);

      if (response.data && response.data.code === 1000) {
        setTours(response.data.result || []);
      } else {
        console.error('Unexpected response format:', response.data);
        setTours([]);
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);

      // Show error message to user
      if (error.response?.data?.message) {
        console.error('Backend error:', error.response.data.message);
      }

      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (numberOfDays) params.set('numberOfDays', numberOfDays);
    if (vehicle) params.set('vehicle', vehicle);
    if (locationId) params.set('locationId', locationId);

    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setKeyword('');
    setMinPrice('');
    setMaxPrice('');
    setNumberOfDays('');
    setVehicle('');
    setLocationId('');
    setSearchParams({});
  };

  const toggleFavorite = (e, tourId) => {
    e.stopPropagation();
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(tourId)) {
        newFavorites.delete(tourId);
      } else {
        newFavorites.add(tourId);
      }
      return newFavorites;
    });
  };

  const formatPrice = (price) => {
    if (!price) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const getTourImage = (tour) => {
    if (tour.imageUrl) return tour.imageUrl;
    const defaultImages = [
      "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      "https://daivietourist.vn/wp-content/uploads/2025/05/gioi-thieu-ve-pho-co-hoi-an-8.jpg",
      "https://www.dalattrip.com/dulich/media/2017/12/thanh-pho-da-lat.jpg",
    ];
    return defaultImages[tour.id % defaultImages.length] || defaultImages[0];
  };

  const activeFiltersCount = [
    keyword,
    minPrice,
    maxPrice,
    numberOfDays,
    vehicle,
    locationId,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-surface font-sans">
      {/* Ambient Background */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/5 blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header - Search Bar và Filters ở trên cùng */}
      <header className="sticky top-0 bg-white/70 backdrop-blur-xl border-b border-white/40 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          {/* Row 1: Search Input và Buttons */}
          <div className="flex items-center gap-3 mb-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm tour, địa điểm..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-3 bg-white/60 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-colors ${activeFiltersCount > 0
                ? 'bg-primary/10 border-primary text-primary hover:bg-primary/20'
                : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white hover:border-primary'
                }`}
            >
              <SlidersHorizontal size={18} />
              <span className="hidden md:inline">Bộ lọc</span>
              {activeFiltersCount > 0 && (
                <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-xl whitespace-nowrap hover:from-primary/90 hover:to-secondary/90 transition-colors"
            >
              Tìm kiếm
            </button>
          </div>

          {/* Row 2: Quick Filters (hiển thị khi showFilters = true) */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-4 border-t border-white/40">
              {/* Price Range */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Giá từ</label>
                <input
                  type="number"
                  placeholder="Từ"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white/80 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-slate-900"
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Đến</label>
                <input
                  type="number"
                  placeholder="Đến"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white/80 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-slate-900"
                />
              </div>

              {/* Number of Days */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Số ngày</label>
                <select
                  value={numberOfDays}
                  onChange={(e) => setNumberOfDays(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white/80 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-slate-900"
                >
                  <option value="">Tất cả</option>
                  <option value="1">1 ngày</option>
                  <option value="2">2 ngày</option>
                  <option value="3">3 ngày</option>
                  <option value="4">4 ngày</option>
                  <option value="5">5+ ngày</option>
                </select>
              </div>

              {/* Vehicle */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Phương tiện</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setVehicle(vehicle === 'car' ? '' : 'car')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm rounded-lg border-2 transition-colors ${vehicle === 'car'
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-white/80 border-slate-200 text-slate-700 hover:border-primary hover:bg-primary/5'
                      }`}
                  >
                    <Car size={16} />
                    <span>Ô tô</span>
                  </button>
                  <button
                    onClick={() => setVehicle(vehicle === 'motorcycle' ? '' : 'motorcycle')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm rounded-lg border-2 transition-colors ${vehicle === 'motorcycle'
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-white/80 border-slate-200 text-slate-700 hover:border-primary hover:bg-primary/5'
                      }`}
                  >
                    <Bike size={16} />
                    <span>Xe máy</span>
                  </button>
                </div>
              </div>

              {/* Location */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Địa điểm</label>
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white/80 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-slate-900"
                >
                  <option value="">Tất cả</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Button */}
              <div className="col-span-2 md:col-span-1 flex items-end">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleResetFilters}
                    className="w-full px-4 py-2 text-sm text-primary border-2 border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* Tours List */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
                <p className="text-slate-500">Đang tải tour...</p>
              </div>
            </div>
          ) : tours.length === 0 ? (
            <div className="text-center py-16 bg-white/50 rounded-[2rem] border border-white/50">
              <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h4 className="text-lg font-bold text-slate-700 mb-2">Không tìm thấy tour nào</h4>
              <p className="text-slate-500 mb-4">Thử thay đổi bộ lọc để tìm thêm tour.</p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-slate-600">
                Tìm thấy <span className="font-bold text-slate-900">{tours.length}</span> tour
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tours.map((tour) => (
                  <div
                    key={tour.id}
                    onClick={() => navigate(`/tour/${tour.id}`)}
                    className="group bg-white/60 backdrop-blur-md border-2 border-slate-200 rounded-[2rem] overflow-hidden cursor-pointer hover:bg-white hover:border-primary transition-colors"
                  >
                    {/* Tour Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={getTourImage(tour)}
                        alt={tour.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>

                      {/* Tags */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold rounded-full">
                          {tour.numberOfDays || 1} ngày
                        </span>
                        {tour.isOptimized && (
                          <span className="px-3 py-1 bg-primary/80 backdrop-blur-md border border-white/20 text-white text-xs font-bold rounded-full">
                            Tối ưu
                          </span>
                        )}
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => toggleFavorite(e, tour.id)}
                        className={`absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center ${favorites.has(tour.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white/10 text-white'
                          }`}
                      >
                        <Heart size={18} className={favorites.has(tour.id) ? 'fill-current' : ''} />
                      </button>
                    </div>

                    {/* Tour Info */}
                    <div className="p-5">
                      <h3 className="text-lg font-display font-bold text-slate-900 mb-2 line-clamp-1">
                        {tour.name}
                      </h3>
                      {tour.description && (
                        <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                          {tour.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-sm text-slate-500 mb-4 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} className="text-secondary" />
                          {tour.points?.length || 0} điểm
                        </span>
                        {tour.totalDistance && (
                          <span className="flex items-center gap-1">
                            <Route size={14} className="text-primary" />
                            {formatDistance(tour.totalDistance)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {tour.numberOfDays || 1} ngày
                        </span>
                        <span className="flex items-center gap-1 capitalize">
                          {tour.vehicle === 'car' ? <Car size={14} /> : <Bike size={14} />}
                          {tour.vehicle || 'N/A'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/60">
                        <div>
                          <span className="block text-xs text-slate-400 font-medium mb-1">bắt đầu từ</span>
                          <span className="text-xl font-bold text-slate-900">
                            {formatPrice(tour.price)}đ
                          </span>
                        </div>
                        <button className="flex items-center gap-1 text-primary font-medium group-hover:text-secondary transition-colors">
                          Xem chi tiết
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ToursPage;
