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
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Quản lý Đơn đặt tour
        </h2>
        <p className="text-zinc-500">Theo dõi và xử lý các đơn đặt tour.</p>
      </div>

      <div className="flex gap-4 items-center bg-white p-4 rounded-lg border border-zinc-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm mã đơn, khách hàng..."
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-50 hover:bg-zinc-100 rounded-md border border-zinc-200">
          <Filter className="w-4 h-4" /> Bộ lọc
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 text-zinc-500 font-medium border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4">Mã đơn</th>
              <th className="px-6 py-4">Khách hàng</th>
              <th className="px-6 py-4">Tour</th>
              <th className="px-6 py-4">Ngày đi</th>
              <th className="px-6 py-4">Tổng tiền</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4">Thanh toán</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-zinc-50">
                <td className="px-6 py-4 font-medium text-zinc-900">
                  {booking.id}
                </td>
                <td className="px-6 py-4">{booking.user}</td>
                <td className="px-6 py-4">{booking.tour}</td>
                <td className="px-6 py-4">{booking.date}</td>
                <td className="px-6 py-4 font-medium">{booking.amount}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${
                                          booking.status === "CONFIRMED"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-amber-100 text-amber-700"
                                        }`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${
                                          booking.payment === "PAID"
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-zinc-100 text-zinc-700"
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
  );
};

export default BookingManagement;
