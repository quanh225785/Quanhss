import React from "react";
import { MapPin, Star, ArrowRight, TrendingUp, Compass, Heart } from "lucide-react";

const UserOverview = () => {
  const recommendations = [
    {
      id: 1,
      title: "Khám phá Đà Nẵng",
      image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=500&q=60",
      rating: 4.8,
      price: "2,500,000",
      tag: "Best Seller",
      colSpan: "md:col-span-2"
    },
    {
      id: 2,
      title: "Vịnh Hạ Long",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=500&q=60",
      rating: 4.9,
      price: "3,200,000",
      tag: "Popular",
      colSpan: "md:col-span-1"
    },
    {
      id: 3,
      title: "Phố cổ Hội An",
      image: "https://daivietourist.vn/wp-content/uploads/2025/05/gioi-thieu-ve-pho-co-hoi-an-8.jpg",
      rating: 4.7,
      price: "1,800,000",
      tag: "Must Visit",
      colSpan: "md:col-span-1"
    },
    {
      id: 4,
      title: "Đà Lạt Mộng Mơ",
      image: "https://www.dalattrip.com/dulich/media/2017/12/thanh-pho-da-lat.jpg",
      rating: 4.6,
      price: "2,100,000",
      tag: "Romantic",
      colSpan: "md:col-span-2"
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
            Chào mừng bạn trở lại! 
          </h2>
          <p className="text-slate-500 mt-2">
            Khám phá những địa điểm thú vị dành riêng cho bạn.
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
            Gợi ý cho bạn
          </h3>
          <button className="text-sm font-medium text-primary hover:text-secondary transition-colors flex items-center gap-1 group">
            Xem tất cả <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
          {recommendations.map((item) => (
            <div
              key={item.id}
              className={`group relative rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-white/20 bg-white ${item.colSpan}`}
            >
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>

              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold rounded-full">
                  {item.tag}
                </span>
              </div>
              <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-all">
                <Heart size={18} />
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h4 className="text-xl font-display font-bold text-white mb-2">{item.title}</h4>
                    <div className="flex items-center gap-3 text-slate-300 text-sm">
                      <span className="flex items-center gap-1"><MapPin size={14} className="text-secondary" /> Việt Nam</span>
                      <span className="flex items-center gap-1"><Star size={14} className="text-yellow-400 fill-yellow-400" /> {item.rating}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs text-slate-400 font-medium mb-1">bắt đầu từ</span>
                    <span className="text-lg font-bold text-white">{item.price}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default UserOverview;
