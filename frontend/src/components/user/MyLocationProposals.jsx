import React from "react";
import { Plus, MapPin } from "lucide-react";

const MyLocationProposals = () => {
  const proposals = [
    {
      id: 1,
      name: "Quán Cafe Yên",
      address: "123 Nguyễn Huệ, Đà Nẵng",
      status: "PENDING",
    },
    {
      id: 2,
      name: "Homestay Xanh",
      address: "Sapa, Lào Cai",
      status: "APPROVED",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Đề xuất địa điểm
          </h2>
          <p className="text-zinc-500">
            Chia sẻ những địa điểm thú vị bạn biết.
          </p>
        </div>
        <button className="bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Đề xuất mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {proposals.map((item) => (
          <div
            key={item.id}
            className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-zinc-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-zinc-600" />
                </div>
                <div>
                  <h3 className="font-medium text-zinc-900">{item.name}</h3>
                  <p className="text-xs text-zinc-500">{item.address}</p>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium
                                ${
                                  item.status === "APPROVED"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
              >
                {item.status === "APPROVED" ? "Đã duyệt" : "Chờ duyệt"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyLocationProposals;
