import React from "react";

const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden ${active
        ? "bg-primary/10 text-primary shadow-sm"
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      }`}
  >
    {/* Active Indicator Bar */}
    <div
      className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-full max-h-[60%] bg-primary rounded-r-full transition-all duration-300 ease-out ${active ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 -translate-x-full'
        }`}
    ></div>

    <span className={`relative z-10 transition-transform duration-300 ${active ? 'translate-x-1.5' : 'group-hover:scale-110'}`}>
      {icon}
    </span>
    <span className={`relative z-10 font-bold transition-all duration-300 ${active ? 'translate-x-1' : ''}`}>
      {label}
    </span>
  </button>
);

export default NavItem;
