import React from 'react';
import { Star } from 'lucide-react';

const Reviews = () => (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Đánh giá & Phản hồi</h2>
            <p className="text-zinc-500">Xem và phản hồi các đánh giá từ khách hàng.</p>
        </div>

        <div className="grid gap-4">
            {[1, 2].map((item) => (
                <div key={item} className="bg-white p-6 rounded-xl border border-zinc-200">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-medium text-zinc-600">
                                KH
                            </div>
                            <div>
                                <h4 className="font-medium text-zinc-900">Nguyễn Văn Khách</h4>
                                <div className="flex items-center gap-1 text-amber-400">
                                    <Star size={14} fill="currentColor" />
                                    <Star size={14} fill="currentColor" />
                                    <Star size={14} fill="currentColor" />
                                    <Star size={14} fill="currentColor" />
                                    <Star size={14} fill="currentColor" />
                                </div>
                            </div>
                        </div>
                        <span className="text-xs text-zinc-400">2 ngày trước</span>
                    </div>
                    <p className="text-zinc-600 text-sm mb-4">
                        Chuyến đi rất tuyệt vời! Hướng dẫn viên nhiệt tình, đồ ăn ngon. Cảm ơn công ty đã tổ chức một trải nghiệm đáng nhớ.
                    </p>
                    <div className="bg-zinc-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-zinc-900">Phản hồi của bạn</span>
                        </div>
                        <textarea
                            className="w-full bg-white border border-zinc-200 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            placeholder="Viết câu trả lời..."
                            rows={2}
                        />
                        <div className="flex justify-end mt-2">
                            <button className="text-xs font-medium text-white bg-zinc-900 px-3 py-1.5 rounded-md hover:bg-zinc-800">
                                Gửi phản hồi
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default Reviews;
