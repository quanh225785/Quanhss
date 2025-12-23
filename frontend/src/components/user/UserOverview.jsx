import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, ArrowRight, TrendingUp, Compass, Heart, Loader2, Calendar, Route } from "lucide-react";
import { api } from "../../utils/api";
import { formatDistance } from "../../utils/polylineUtils";

const UserOverview = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const trendingScrollRef = useRef(null);

  useEffect(() => {
    fetchApprovedTours();
    fetchMyFavorites();
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

  const fetchMyFavorites = async () => {
    try {
      const response = await api.get('/favorites/ids');
      if (response.data.result) {
        setFavorites(new Set(response.data.result));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async (e, tourId) => {
    e.stopPropagation();

    const isFav = favorites.has(tourId);

    // Optimistic update
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (isFav) {
        newFavorites.delete(tourId);
      } else {
        newFavorites.add(tourId);
      }
      return newFavorites;
    });

    try {
      if (isFav) {
        await api.delete(`/favorites/${tourId}`);
      } else {
        await api.post(`/favorites/${tourId}`);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert on error
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        if (isFav) {
          newFavorites.add(tourId);
        } else {
          newFavorites.delete(tourId);
        }
        return newFavorites;
      });
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const getTourImage = (tour) => {
    if (tour.imageUrl) return tour.imageUrl;
    if (tour.imageUrls && tour.imageUrls.length > 0) return tour.imageUrls[0];

    // Fallback images if no actual image exists
    const defaultImages = [
      "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      "https://daivietourist.vn/wp-content/uploads/2025/05/gioi-thieu-ve-pho-co-hoi-an-8.jpg",
      "https://www.dalattrip.com/dulich/media/2017/12/thanh-pho-da-lat.jpg",
    ];
    return defaultImages[tour.id % defaultImages.length];
  };

  const getTourTag = (tour) => {
    if (tour.isOptimized) return "Tối ưu";
    if (tour.numberOfDays >= 3) return "Dài ngày";
    if (tour.points?.length >= 5) return "Nhiều điểm";
    if (tour.reviewCount > 5) return "Phổ biến";
    return "Nổi bật";
  };

  // Trending tours (sorted by rating and reviews if available, or just take first 10)
  const trendingTours = [...tours]
    .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0) || (b.averageRating || 0) - (a.averageRating || 0))
    .slice(0, 10);

  const handleScrollTrendingNext = () => {
    if (!trendingScrollRef.current) return;
    const container = trendingScrollRef.current;
    const cardWidth = container.firstElementChild?.getBoundingClientRect().width || 320;
    container.scrollBy({ left: cardWidth + 24, behavior: "smooth" });
  };

  return (
    <div className="space-y-12 animate-fade-in-up pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-display font-black text-slate-900 tracking-tight">
            Khám phá trải nghiệm mới
          </h2>
          <p className="text-slate-500 mt-2 text-lg">
            Những hành trình độc đáo được thiết kế riêng cho bạn.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-5 py-2.5 bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Star size={18} className="fill-current" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hạng thành viên</p>
              <p className="text-sm font-black text-slate-700">Crystal Explorer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top 10 Trending Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-display font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="text-rose-500" size={24} />
            Top 10 Xu hướng
          </h3>
          <button
            type="button"
            onClick={handleScrollTrendingNext}
            className="flex items-center gap-2 text-slate-400 text-sm font-medium hover:text-primary transition-colors"
          >
            <span>Vuốt để xem thêm</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex gap-6 overflow-x-hidden p-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="min-w-[300px] h-[400px] bg-slate-100 animate-pulse rounded-[2.5rem]"></div>
            ))}
          </div>
        ) : trendingTours.length === 0 ? (
          <div className="text-center py-16 bg-white/50 rounded-[2.5rem] border border-white/50 border-dashed">
            <Compass className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-slate-700 mb-2">Chưa có xu hướng mới</h4>
            <p className="text-slate-500">Chúng tôi đang cập nhật những điểm đến hot nhất.</p>
          </div>
        ) : (
          <div
            ref={trendingScrollRef}
            className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar -mx-2 px-2"
          >
            {trendingTours.map((tour, index) => (
              <div
                key={tour.id}
                onClick={() => navigate(`/tour/${tour.id}`)}
                className="min-w-[280px] md:min-w-[340px] h-[450px] snap-start group relative rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-white/20 bg-white cursor-pointer"
              >
                <div className="absolute top-6 left-6 z-10">
                  <div className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-primary font-black text-xl shadow-lg border border-white/50">
                    #{index + 1}
                  </div>
                </div>

                <img
                  src={getTourImage(tour)}
                  alt={tour.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>

                <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
                  <button
                    onClick={(e) => toggleFavorite(e, tour.id)}
                    className={`w-10 h-10 rounded-xl backdrop-blur-md border border-white/20 flex items-center justify-center transition-all ${favorites.has(tour.id)
                      ? 'bg-rose-500 text-white'
                      : 'bg-black/20 text-white hover:bg-white hover:text-rose-500'
                      }`}
                  >
                    <Heart size={18} className={favorites.has(tour.id) ? 'fill-current' : ''} />
                  </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] uppercase tracking-widest font-black rounded-lg">
                        {getTourTag(tour)}
                      </span>
                      <span className="px-3 py-1 bg-primary/80 backdrop-blur-md border border-white/20 text-white text-[10px] uppercase tracking-widest font-black rounded-lg flex items-center gap-1">
                        <Calendar size={10} />
                        {tour.numberOfDays || 1} Ngày
                      </span>
                    </div>

                    <h4 className="text-2xl font-display font-black text-white leading-tight line-clamp-2 drop-shadow-lg">{tour.name}</h4>

                    <div className="pt-4 border-t border-white/20 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        {tour.averageRating ? (
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-white font-bold text-sm">{tour.averageRating.toFixed(1)}</span>
                            {tour.reviewCount > 0 && (
                              <span className="text-white/60 text-xs">({tour.reviewCount})</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-white/60 text-xs">Chưa có đánh giá</span>
                        )}
                        <span className="w-1 h-1 bg-white/40 rounded-full"></span>
                        <div className="flex items-center gap-1 text-white/80 text-sm">
                          <MapPin size={14} className="text-secondary" />
                          <span>{tour.points?.length || 0} điểm</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-white/60 font-bold uppercase">Chỉ từ</p>
                        <p className="text-xl font-black text-white">{formatPrice(tour.price)}đ</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Đề xuất cho bạn - Random tours in list view */}
      {tours.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
              <Compass className="text-primary" size={20} />
              Đề xuất cho bạn
            </h3>
            <button
              className="text-sm font-medium text-primary hover:text-secondary transition-colors flex items-center gap-1 group"
              onClick={() => navigate('/tours')}
            >
              Xem tất cả <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="space-y-4">
            {[...tours]
              .sort(() => Math.random() - 0.5)
              .slice(0, 6)
              .map((tour) => (
                <div
                  key={tour.id}
                  onClick={() => navigate(`/tour/${tour.id}`)}
                  className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
                >
                  <img
                    src={getTourImage(tour)}
                    alt={tour.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-slate-900 line-clamp-1 group-hover:text-primary transition-colors">{tour.name}</h5>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {tour.numberOfDays || 1} ngày
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {tour.points?.length || 0} điểm
                      </span>
                      {tour.averageRating ? (
                        <span className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-400 fill-yellow-400" />
                          {tour.averageRating.toFixed(1)} ({tour.reviewCount || 0})
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Chưa có đánh giá</span>
                      )}
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
        </section>
      )}
    </div>
  );
};

export default UserOverview;
