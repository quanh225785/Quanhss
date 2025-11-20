import React, { useState } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  Eye,
  EyeOff,
  PauseCircle,
} from "lucide-react";

const TourManagement = () => {
  const [activeTab, setActiveTab] = useState("all");

  const tours = [
    {
      id: 1,
      name: "Hà Nội - Sapa 3N2Đ",
      agent: "Agent A",
      price: "3,500,000",
      status: "VISIBLE",
    },
    {
      id: 2,
      name: "Đà Nẵng - Hội An",
      agent: "Agent B",
      price: "4,200,000",
      status: "PENDING",
    },
    {
      id: 3,
      name: "Phú Quốc 4N3Đ",
      agent: "Agent A",
      price: "5,500,000",
      status: "HIDDEN",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quản lý Tour</h2>
          <p className="text-zinc-500">Duyệt và quản lý các tour du lịch.</p>
        </div>
        <button className="bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Thêm Tour
        </button>
      </div>

      <div className="flex gap-4 items-center bg-white p-4 rounded-lg border border-zinc-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm tour..."
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
        <div className="flex gap-2">
          {["all", "pending", "visible", "hidden"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md capitalize ${
                activeTab === tab
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {tab === "all" ? "Tất cả" : tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 text-zinc-500 font-medium border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4">Tên Tour</th>
              <th className="px-6 py-4">Agent</th>
              <th className="px-6 py-4">Giá (VNĐ)</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {tours.map((tour) => (
              <tr key={tour.id} className="hover:bg-zinc-50">
                <td className="px-6 py-4 font-medium text-zinc-900">
                  {tour.name}
                </td>
                <td className="px-6 py-4 text-zinc-600">{tour.agent}</td>
                <td className="px-6 py-4 text-zinc-900">{tour.price}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${
                                          tour.status === "VISIBLE"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : tour.status === "PENDING"
                                            ? "bg-amber-100 text-amber-700"
                                            : "bg-zinc-100 text-zinc-700"
                                        }`}
                  >
                    {tour.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-1 hover:bg-zinc-100 rounded text-zinc-500 hover:text-zinc-900">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-zinc-100 rounded text-zinc-500 hover:text-zinc-900">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TourManagement;
