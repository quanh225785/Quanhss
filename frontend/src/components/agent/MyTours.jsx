import React from 'react';
import { Plus, CheckCircle } from 'lucide-react';

const MyTours = () => (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Quản lý Tour</h2>
                <p className="text-zinc-500">Danh sách các tour do bạn tổ chức.</p>
            </div>
            <button className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors">
                <Plus size={16} />
                Tạo Tour mới
            </button>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 text-zinc-500 font-medium border-b border-zinc-200">
                    <tr>
                        <th className="px-6 py-4">Tên Tour</th>
                        <th className="px-6 py-4">Giá</th>
                        <th className="px-6 py-4">Trạng thái</th>
                        <th className="px-6 py-4">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                    {[1, 2, 3].map((item) => (
                        <tr key={item} className="hover:bg-zinc-50/50">
                            <td className="px-6 py-4 font-medium text-zinc-900">Khám phá Hà Giang - Mùa hoa tam giác mạch</td>
                            <td className="px-6 py-4 text-zinc-600">2.500.000 VNĐ</td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                                    <CheckCircle size={12} />
                                    Đang hoạt động
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <button className="text-zinc-600 hover:text-zinc-900 font-medium">Chi tiết</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default MyTours;
