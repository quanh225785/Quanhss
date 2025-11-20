import React from 'react';

const AgentProfile = ({ user }) => (
    <div className="max-w-2xl">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Hồ sơ Agent</h2>

        <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center text-2xl font-bold text-zinc-400">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div>
                    <button className="text-sm font-medium text-zinc-900 border border-zinc-300 px-3 py-1.5 rounded-md hover:bg-zinc-50">
                        Thay đổi ảnh đại diện
                    </button>
                </div>
            </div>

            <div className="grid gap-4">
                <div className="grid gap-2">
                    <label className="text-sm font-medium text-zinc-700">Tên hiển thị</label>
                    <input
                        type="text"
                        defaultValue={user.name}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                    />
                </div>

                <div className="grid gap-2">
                    <label className="text-sm font-medium text-zinc-700">Email</label>
                    <input
                        type="email"
                        defaultValue={user.email}
                        disabled
                        className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-zinc-50 text-zinc-500"
                    />
                </div>

                <div className="grid gap-2">
                    <label className="text-sm font-medium text-zinc-700">Giới thiệu bản thân</label>
                    <textarea
                        rows={4}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                        placeholder="Mô tả kinh nghiệm dẫn tour của bạn..."
                    />
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button className="bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors">
                    Lưu thay đổi
                </button>
            </div>
        </div>
    </div>
);

export default AgentProfile;
