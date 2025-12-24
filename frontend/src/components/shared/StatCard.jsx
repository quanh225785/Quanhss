import React from "react";

const StatCard = ({ title, value, change, icon }) => (
  <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40 shadow-xl shadow-black/5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-center justify-between mb-6">
      <span className="text-slate-500 text-sm font-black uppercase tracking-widest">{title}</span>
      <div className="p-3 bg-white/50 border border-white/40 rounded-2xl shadow-sm">{icon}</div>
    </div>
    <div className="flex flex-col gap-2">
      <span className="text-3xl font-black text-slate-900 tracking-tight">{value}</span>
      <div className="flex">
        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50/50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
          {change}
        </span>
      </div>
    </div>
  </div>
);

export default StatCard;
