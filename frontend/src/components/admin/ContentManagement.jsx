import React from "react";
import { Plus, Edit, Trash2 } from "lucide-react";

const ContentManagement = () => {
  const posts = [
    {
      id: 1,
      title: "Top 10 địa điểm du lịch Đà Nẵng",
      author: "Admin",
      date: "2023-11-15",
      status: "PUBLISHED",
    },
    {
      id: 2,
      title: "Kinh nghiệm đi Sapa mùa đông",
      author: "Admin",
      date: "2023-12-01",
      status: "DRAFT",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white/70 backdrop-blur-2xl border border-white/40 p-10 rounded-[3rem] shadow-2xl shadow-black/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-primary rounded-full"></div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">
              Quản lý Nội dung
            </h2>
          </div>
          <p className="text-slate-500 font-medium ml-5">Quản lý các bài viết, tin tức và truyền thông trên toàn hệ thống.</p>
        </div>
        <button className="flex items-center gap-3 px-8 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95 whitespace-nowrap">
          <Plus size={20} />
          <span>Viết bài mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="group bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40 shadow-xl shadow-black/5 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex-1">
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-3 group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              <div className="flex flex-wrap gap-6 items-center">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black text-[10px]">
                    {post.author.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-slate-500">@{post.author}</span>
                </div>
                <div className="text-xs font-bold text-slate-400">
                  {post.date}
                </div>
                <span
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest
                    ${post.status === "PUBLISHED"
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-100"
                      : "bg-slate-500/10 text-slate-500 border border-slate-100"
                    }`}
                >
                  {post.status}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="p-4 bg-white/50 border border-white/40 text-slate-600 hover:text-primary hover:bg-white rounded-2xl transition-all shadow-sm active:scale-95">
                <Edit size={20} />
              </button>
              <button className="p-4 bg-white/50 border border-white/40 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all shadow-sm active:scale-95">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentManagement;
