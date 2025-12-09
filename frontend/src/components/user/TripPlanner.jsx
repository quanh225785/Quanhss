import React, { useState } from "react";
import { Map, Calendar, Clock, ArrowRight } from "lucide-react";

const TripPlanner = () => {
  const [step, setStep] = useState(1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Lập kế hoạch chuyến đi
        </h2>
        <p className="text-zinc-500">
          Tạo lịch trình cá nhân hóa cho chuyến đi của bạn.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              Bước 1: Chọn điểm đến & Thời gian
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Điểm đến
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-zinc-200 rounded-md"
                  placeholder="Ví dụ: Đà Nẵng"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Số ngày
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-zinc-200 rounded-md"
                  placeholder="3"
                />
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full bg-zinc-900 text-white py-2 rounded-md font-medium hover:bg-zinc-800 mt-4"
            >
              Tiếp tục
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Bước 2: Chọn sở thích</h3>
            <div className="flex gap-2 flex-wrap">
              {["Văn hóa", "Ẩm thực", "Mạo hiểm", "Nghỉ dưỡng", "Check-in"].map(
                (tag) => (
                  <button
                    key={tag}
                    className="px-3 py-1 border border-zinc-200 rounded-full text-sm hover:bg-zinc-50 focus:bg-zinc-900 focus:text-white"
                  >
                    {tag}
                  </button>
                )
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 border border-zinc-200 rounded-md font-medium hover:bg-zinc-50"
              >
                Quay lại
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-zinc-900 text-white py-2 rounded-md font-medium hover:bg-zinc-800"
              >
                Tạo lịch trình
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Lịch trình gợi ý</h3>
              <button
                onClick={() => setStep(1)}
                className="text-sm text-zinc-500 hover:text-zinc-900"
              >
                Làm lại
              </button>
            </div>

            <div className="space-y-4 relative pl-4 border-l-2 border-zinc-100">
              {[
                { time: "08:00", activity: "Ăn sáng tại Mì Quảng 1A" },
                { time: "09:30", activity: "Tham quan Ngũ Hành Sơn" },
                { time: "12:00", activity: "Ăn trưa & Nghỉ ngơi" },
                { time: "14:00", activity: "Tắm biển Mỹ Khê" },
                { time: "18:00", activity: "Dạo phố cổ Hội An" },
              ].map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-zinc-300 border-2 border-white"></div>
                  <div className="text-sm font-medium text-zinc-500">
                    {item.time}
                  </div>
                  <div className="text-zinc-900">{item.activity}</div>
                </div>
              ))}
            </div>

            <button className="w-full bg-emerald-600 text-white py-2 rounded-md font-medium hover:bg-emerald-700">
              Lưu lịch trình
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripPlanner;
