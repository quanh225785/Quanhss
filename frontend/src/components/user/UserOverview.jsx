import React from "react";
import { MapPin, Star, ArrowRight } from "lucide-react";

const UserOverview = () => {
  const recommendations = [
    {
      id: 1,
      title: "Khám phá Đà Nẵng",
      image:
        "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=500&q=60",
      rating: 4.8,
      price: "2,500,000",
    },
    {
      id: 2,
      title: "Vịnh Hạ Long",
      image:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=500&q=60",
      rating: 4.9,
      price: "3,200,000",
    },
    {
      id: 3,
      title: "Phố cổ Hội An",
      image:
        "https://images.unsplash.com/photo-1558618007-d5ae471f52e7?auto=format&fit=crop&w=500&q=60",
      rating: 4.7,
      price: "1,800,000",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Chào mừng bạn trở lại!
        </h2>
        <p className="text-zinc-500">
          Khám phá những địa điểm thú vị dành riêng cho bạn.
        </p>
      </div>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Gợi ý cho bạn</h3>
          <button className="text-sm text-zinc-600 hover:text-zinc-900 flex items-center gap-1">
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-xl border border-zinc-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-video overflow-hidden bg-zinc-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-zinc-900">{item.title}</h4>
                  <div className="flex items-center gap-1 text-xs font-medium bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 fill-current" /> {item.rating}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-zinc-500 text-sm mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>Việt Nam</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-zinc-900">
                    {item.price} VNĐ
                  </span>
                  <button className="text-sm font-medium text-zinc-900 hover:underline">
                    Chi tiết
                  </button>
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
