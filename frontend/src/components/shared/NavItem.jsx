import React from "react";

const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
      active
        ? "bg-zinc-900 text-white shadow-sm"
        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
    }`}
  >
    {icon}
    {label}
  </button>
);

export default NavItem;
