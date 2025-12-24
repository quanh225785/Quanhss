import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, Star, Loader2 } from "lucide-react";
import { api } from "../../utils/api";

const ReviewModal = ({ booking, onClose, onSuccess }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            setError("Vui lòng chọn số sao đánh giá");
            return;
        }

        if (!content.trim()) {
            setError("Vui lòng nhập nội dung đánh giá");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await api.post("/reviews", {
                bookingId: booking.id,
                rating,
                content: content.trim(),
            });

            if (response.data.code === 1000) {
                onSuccess?.();
                onClose();
            }
        } catch (err) {
            console.error("Error creating review:", err);
            setError(err.response?.data?.message || "Không thể gửi đánh giá");
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl transform scale-100 animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-xl text-slate-900">Đánh giá tour</h3>
                        <p className="text-sm text-slate-500 mt-1">{booking.tourName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Star Rating */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-3">
                            Chất lượng tour
                        </label>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star
                                        size={40}
                                        className={`transition-colors ${star <= (hoverRating || rating)
                                            ? "text-amber-400 fill-amber-400"
                                            : "text-slate-300"
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="text-center mt-2 text-sm text-slate-500">
                            {rating === 0 && "Chọn số sao"}
                            {rating === 1 && "Rất tệ"}
                            {rating === 2 && "Tệ"}
                            {rating === 3 && "Bình thường"}
                            {rating === 4 && "Tốt"}
                            {rating === 5 && "Tuyệt vời"}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Nội dung đánh giá
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Chia sẻ trải nghiệm của bạn về chuyến đi..."
                            rows={4}
                            className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Đang gửi...
                                </>
                            ) : (
                                "Gửi đánh giá"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default ReviewModal;
