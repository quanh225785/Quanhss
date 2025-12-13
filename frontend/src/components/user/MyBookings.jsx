import React from "react";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";

const MyBookings = () => {
  const bookings = [
    {
      id: "BK001",
      tour: "Hà Nội - Sapa 3N2Đ",
      date: "20/12/2023",
      status: "UPCOMING",
      image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=200&q=60",
    },
    {
      id: "BK002",
      tour: "Đà Nẵng - Hội An",
      date: "15/10/2023",
      status: "COMPLETED",
      image: "https://images.unsplash.com/photo-1558618007-d5ae471f52e7?auto=format&fit=crop&w=200&q=60",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Chuyến đi của tôi</h2>
        <p className="text-slate-500 mt-2">
          Quản lý các tour đã đặt và lịch sử chuyến đi.
        </p>
      </div>

      <div className="grid gap-6">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="group bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row gap-6 items-center"
          >
            <div className="w-full md:w-32 h-32 rounded-3xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-inner relative">
              <img
                src={booking.image}
                alt={booking.tour}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
            </div>

            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-xl mb-2 group-hover:text-primary transition-colors">
                    {booking.tour}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5 bg-white/50 px-3 py-1 rounded-full border border-white/50">
                      <Calendar className="w-4 h-4 text-primary" /> {booking.date}
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/50 px-3 py-1 rounded-full border border-white/50">
                      <Clock className="w-4 h-4 text-secondary" /> 3 ngày 2 đêm
                    </span>
                  </div>
                </div>

                <span
                  className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide uppercase border
                      ${booking.status === "UPCOMING"
                      ? "bg-blue-50 text-blue-600 border-blue-100"
                      : "bg-slate-50 text-slate-600 border-slate-100"
                    }`}
                >
                  {booking.status === "UPCOMING" ? "Sắp diễn ra" : "Đã hoàn thành"}
                </span>
              </div>

              <div className="mt-6 flex gap-3">
                <button className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center gap-2">
                  Xem chi tiết <ArrowRight size={14} />
                </button>
                {booking.status === "COMPLETED" && (
                  <button className="px-5 py-2.5 text-sm font-medium text-secondary bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-100 transition-all">
                    Viết đánh giá
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookings;
