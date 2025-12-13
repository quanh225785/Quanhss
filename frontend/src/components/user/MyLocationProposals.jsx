import React from "react";
import { Plus, MapPin, CheckCircle2, Clock, Pencil, Trash2 } from "lucide-react";

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
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
            Đề xuất địa điểm
          </h2>
          <p className="text-slate-500 mt-2">
            Chia sẻ những địa điểm thú vị bạn biết với cộng đồng.
          </p>
        </div>
        <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary transition-all shadow-lg hover:shadow-primary/30 flex items-center gap-2 group">
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Đề xuất mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {proposals.map((item) => (
          <div
            key={item.id}
            className="group bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[240px]"
          >


            {/* Content Top */}
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-primary mb-3">
                  <MapPin className="w-6 h-6" />
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 border
                                        ${item.status === "APPROVED"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                      : "bg-amber-50 text-amber-600 border-amber-100"
                    }`}
                >
                  {item.status === "APPROVED" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  {item.status === "APPROVED" ? "Đã duyệt" : "Chờ duyệt"}
                </span>
              </div>

              <h3 className="font-display font-bold text-xl text-slate-900 mb-1">{item.name}</h3>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <MapPin size={14} className="flex-shrink-0" /> {item.address}
              </p>
            </div>

            {/* Actions Bottom */}
            <div className="relative z-10 mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-3">
              <button className="flex-1 py-2.5 px-4 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                <Pencil size={14} /> Chỉnh sửa
              </button>
              <button className="py-2.5 px-4 text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-all flex items-center justify-center gap-2">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {/* Empty State / Add New Placeholder */}
        <button className="border-2 border-dashed border-slate-200 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all group min-h-[240px]">
          <div className="w-16 h-16 rounded-full bg-slate-50 group-hover:bg-white flex items-center justify-center transition-colors shadow-sm">
            <Plus className="w-8 h-8" />
          </div>
          <span className="font-bold text-lg">Thêm địa điểm mới</span>
        </button>
      </div>
    </div>
  );
};

export default MyLocationProposals;
