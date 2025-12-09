import React from "react";

const StatCard = ({ title, value, change, icon }) => (
  <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <span className="text-zinc-500 text-sm font-medium">{title}</span>
      <div className="p-2 bg-zinc-50 rounded-lg">{icon}</div>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold text-zinc-900">{value}</span>
      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
        {change}
      </span>
    </div>
  </div>
);

export default StatCard;
