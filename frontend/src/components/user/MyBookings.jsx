import React from "react";
import { Calendar, MapPin, Clock } from "lucide-react";

const MyBookings = () => {
  const bookings = [
    {
      id: "BK001",
      tour: "Hà Nội - Sapa 3N2Đ",
      date: "20/12/2023",
      status: "UPCOMING",
      image:
        "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=200&q=60",
    },
    {
      id: "BK002",
      tour: "Đà Nẵng - Hội An",
      date: "15/10/2023",
      status: "COMPLETED",
      image:
        "https://images.unsplash.com/photo-1558618007-d5ae471f52e7?auto=format&fit=crop&w=200&q=60",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Chuyến đi của tôi</h2>
        <p className="text-zinc-500">
          Quản lý các tour đã đặt và lịch sử chuyến đi.
        </p>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white p-4 rounded-xl border border-zinc-200 flex gap-4 items-center"
          >
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
              <img
                src={booking.image}
                alt={booking.tour}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-zinc-900 text-lg">
                    {booking.tour}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-zinc-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> {booking.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> 3 ngày 2 đêm
                    </span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium
                                    ${
                                      booking.status === "UPCOMING"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-zinc-100 text-zinc-700"
                                    }`}
                >
                  {booking.status === "UPCOMING"
                    ? "Sắp diễn ra"
                    : "Đã hoàn thành"}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="px-3 py-1.5 text-sm font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 rounded-md border border-zinc-200">
                  Xem chi tiết
                </button>
                {booking.status === "COMPLETED" && (
                  <button className="px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200">
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
