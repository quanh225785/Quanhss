import React from "react";
import { Search, Filter } from "lucide-react";

const BookingManagement = () => {
  const bookings = [
    {
      id: "BK001",
      user: "Nguyễn Văn A",
      tour: "Hà Nội - Sapa",
      date: "2023-12-20",
      amount: "3,500,000",
      status: "CONFIRMED",
      payment: "PAID",
    },
    {
      id: "BK002",
      user: "Trần Thị B",
      tour: "Đà Nẵng - Hội An",
      date: "2023-12-25",
      amount: "4,200,000",
      status: "PENDING",
      payment: "UNPAID",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white/70 backdrop-blur-2xl border border-white/40 p-10 rounded-[3rem] shadow-2xl shadow-black/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-primary rounded-full"></div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">
              Quản lý Đơn đặt tour
            </h2>
          </div>
          <p className="text-slate-500 font-medium ml-5">Theo dõi và quản lý mọi giao dịch đặt tour trên hệ thống.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-center bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40 shadow-xl shadow-black/5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm mã đơn, khách hàng, tour..."
            className="w-full pl-12 pr-6 py-4 bg-white/50 border border-white/40 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400"
          />
        </div>
        <button className="flex items-center gap-3 px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-700 bg-white/50 border border-white/40 hover:bg-white rounded-2xl transition-all shadow-sm">
          <Filter className="w-4 h-4" /> Bộ lọc
        </button>
      </div>

      <div className="bg-white/70 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-white/50 border-b border-white/40">
                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500">Mã đơn</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500">Khách hàng</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500">Tour</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500">Ngày đi</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500">Tổng tiền</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500">Trạng thái</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500 text-right">Thanh toán</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {bookings.map((booking) => (
                <tr key={booking.id} className="group hover:bg-white/80 transition-all border-b border-white/20 last:border-0">
                  <td className="px-8 py-6 font-black text-slate-900">
                    {booking.id}
                  </td>
                  <td className="px-8 py-6 font-bold text-slate-700">{booking.user}</td>
                  <td className="px-8 py-6 font-bold text-slate-700">{booking.tour}</td>
                  <td className="px-8 py-6 font-bold text-slate-500">{booking.date}</td>
                  <td className="px-8 py-6 font-black text-primary text-base">{booking.amount} VNĐ</td>
                  <td className="px-8 py-6">
                    <span
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider
                                        ${booking.status === "CONFIRMED"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-100"
                          : "bg-amber-500/10 text-amber-600 border border-amber-100"
                        }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider
                                        ${booking.payment === "PAID"
                          ? "bg-blue-500/10 text-blue-600 border border-blue-100"
                          : "bg-slate-500/10 text-slate-500 border border-slate-100"
                        }`}
                    >
                      {booking.payment}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingManagement;
