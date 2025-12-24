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
        <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-xl shadow-primary/20 flex items-center gap-2 group">
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Đề xuất mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {proposals.map((item) => (
          <div
            key={item.id}
            className="group bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40 shadow-xl shadow-black/5 hover:shadow-2xl hover:bg-white/80 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[260px]"
          >


            {/* Content Top */}
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner text-primary mb-3">
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
            <div className="relative z-10 mt-6 pt-6 border-t border-white/20 flex items-center gap-3">
              <button className="flex-1 py-3 px-4 text-sm font-bold text-slate-700 bg-white/50 hover:bg-white border border-slate-200 rounded-xl transition-all flex items-center justify-center gap-2">
                <Pencil size={16} /> Chỉnh sửa
              </button>
              <button className="py-3 px-4 text-sm font-bold text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {/* Empty State / Add New Placeholder */}
        <button className="border-2 border-dashed border-white/60 bg-white/30 backdrop-blur-sm rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all group min-h-[260px] shadow-lg shadow-black/5">
          <div className="w-20 h-20 rounded-full bg-white/50 group-hover:bg-white flex items-center justify-center transition-all duration-300 shadow-sm group-hover:scale-110">
            <Plus className="w-10 h-10" />
          </div>
          <span className="font-bold text-xl">Thêm địa điểm mới</span>
        </button>
      </div>
    </div>
  );
};

export default MyLocationProposals;
