import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, ArrowRight, TrendingUp, Compass, Heart, Loader2, Calendar, Route } from "lucide-react";
import { api } from "../../utils/api";
import { formatDistance } from "../../utils/polylineUtils";

const UserOverview = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    fetchApprovedTours();
  }, []);

  const fetchApprovedTours = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tours/approved');
      setTours(response.data.result || []);
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
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

  const getTourImage = (tour, index) => {
    // Default images for tours based on index
    const defaultImages = [
      "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      "https://daivietourist.vn/wp-content/uploads/2025/05/gioi-thieu-ve-pho-co-hoi-an-8.jpg",
      "https://www.dalattrip.com/dulich/media/2017/12/thanh-pho-da-lat.jpg",
    ];
    return defaultImages[index % defaultImages.length];
  };

  const getTourTag = (tour) => {
    if (tour.isOptimized) return "Tối ưu";
    if (tour.numberOfDays >= 3) return "Dài ngày";
    if (tour.points?.length >= 5) return "Nhiều điểm";
    return "Nổi bật";
  };

  // Determine grid layout based on position
  const getColSpan = (index) => {
    const pattern = [2, 1, 1, 2]; // Bento grid pattern
    return `md:col-span-${pattern[index % pattern.length]}`;
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
            Chào mừng bạn trở lại!
          </h2>
          <p className="text-slate-500 mt-2">
            Khám phá những tour du lịch tuyệt vời dành cho bạn.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-white/50 rounded-xl border border-white/50 shadow-sm flex items-center gap-2">
            <div className="p-1.5 bg-secondary/10 text-secondary rounded-lg">
              <TrendingUp size={16} />
            </div>
            <span className="text-sm font-bold text-slate-700">Level 3 Traveler</span>
          </div>
        </div>
      </div>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
            <Compass className="text-primary" size={20} />
            Tour nổi bật
          </h3>
          <button
            className="text-sm font-medium text-primary hover:text-secondary transition-colors flex items-center gap-1 group"
            onClick={() => navigate('/tours')}
          >
            Xem tất cả <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
              <p className="text-slate-500">Đang tải tour...</p>
            </div>
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center py-16 bg-white/50 rounded-[2rem] border border-white/50">
            <Compass className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-slate-700 mb-2">Chưa có tour nào</h4>
            <p className="text-slate-500">Các tour du lịch sẽ sớm được cập nhật.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
            {tours.slice(0, 4).map((tour, index) => (
              <div
                key={tour.id}
                onClick={() => navigate(`/tour/${tour.id}`)}
                className={`group relative rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-white/20 bg-white cursor-pointer ${getColSpan(index)}`}
              >
                <img
                  src={getTourImage(tour, index)}
                  alt={tour.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>

                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold rounded-full">
                    {getTourTag(tour)}
                  </span>
                  <span className="px-3 py-1 bg-primary/80 backdrop-blur-md border border-white/20 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <Calendar size={12} />
                    {tour.numberOfDays || 1} ngày
                  </span>
                </div>
                <button
                  onClick={(e) => toggleFavorite(e, tour.id)}
                  className={`absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center transition-all ${favorites.has(tour.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-white/10 text-white hover:bg-white hover:text-red-500'
                    }`}
                >
                  <Heart size={18} className={favorites.has(tour.id) ? 'fill-current' : ''} />
                </button>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex justify-between items-end">
                    <div className="flex-1 min-w-0 mr-4">
                      <h4 className="text-xl font-display font-bold text-white mb-2 line-clamp-1">{tour.name}</h4>
                      <div className="flex items-center gap-3 text-slate-300 text-sm flex-wrap">
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
                          <Star size={14} className="text-yellow-400 fill-yellow-400" />
                          4.{5 + (tour.id % 5)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="block text-xs text-slate-400 font-medium mb-1">bắt đầu từ</span>
                      <span className="text-lg font-bold text-white">{formatPrice(tour.price)}đ</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Show more tours in a list view */}
        {tours.length > 4 && (
          <div className="mt-8">
            <h4 className="text-lg font-display font-bold text-slate-900 mb-4">Các tour khác</h4>
            <div className="space-y-4">
              {tours.slice(4, 8).map((tour, index) => (
                <div
                  key={tour.id}
                  onClick={() => navigate(`/tour/${tour.id}`)}
                  className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <img
                    src={getTourImage(tour, index + 4)}
                    alt={tour.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-slate-900 line-clamp-1">{tour.name}</h5>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {tour.numberOfDays || 1} ngày
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {tour.points?.length || 0} điểm
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-slate-900">{formatPrice(tour.price)}đ</span>
                    <p className="text-xs text-slate-500">/người</p>
                  </div>
                  <ArrowRight className="text-slate-400 group-hover:text-primary transition-colors" size={20} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default UserOverview;
