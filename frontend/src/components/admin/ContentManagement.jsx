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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Quản lý Nội dung
          </h2>
          <p className="text-zinc-500">Quản lý bài viết và tin tức.</p>
        </div>
        <button className="bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Viết bài mới
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex items-center justify-between"
          >
            <div>
              <h3 className="font-medium text-zinc-900 text-lg">
                {post.title}
              </h3>
              <div className="flex gap-4 text-sm text-zinc-500 mt-1">
                <span>Tác giả: {post.author}</span>
                <span>Ngày: {post.date}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium
                                    ${
                                      post.status === "PUBLISHED"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-zinc-100 text-zinc-700"
                                    }`}
                >
                  {post.status}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-md hover:text-zinc-900">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-2 text-zinc-500 hover:bg-red-50 rounded-md hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentManagement;
