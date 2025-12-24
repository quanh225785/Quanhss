import React, { useState } from "react";
import { Map, Calendar, Clock, ArrowRight, Check, RotateCcw } from "lucide-react";

const TripPlanner = () => {
  const [step, setStep] = useState(1);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
          Lập kế hoạch chuyến đi
        </h2>
        <p className="text-slate-500 mt-2">
          Tạo lịch trình cá nhân hóa cho chuyến đi của bạn trong 3 bước đơn giản.
        </p>
      </div>

      <div className="bg-white/70 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] border border-white/40 shadow-2xl shadow-black/5 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">1</div>
              <h3 className="text-xl font-bold text-slate-900">Chọn điểm đến & Thời gian</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">
                  Điểm đến
                </label>
                <div className="relative group">
                  <Map className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-white/40 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 font-medium placeholder:text-slate-400"
                    placeholder="Ví dụ: Đà Nẵng"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">
                  Số ngày
                </label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                  <input
                    type="number"
                    className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-white/40 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 font-medium placeholder:text-slate-400"
                    placeholder="Ví dụ: 3"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 mt-4 flex items-center justify-center gap-2 group"
            >
              Tiếp tục <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">2</div>
              <h3 className="text-xl font-bold text-slate-900">Chọn sở thích</h3>
            </div>

            <div className="flex gap-3 flex-wrap">
              {["Văn hóa", "Ẩm thực", "Mạo hiểm", "Nghỉ dưỡng", "Check-in", "Gia đình", "Cặp đôi"].map(
                (tag) => (
                  <button
                    key={tag}
                    className="px-6 py-2.5 border border-white/40 bg-white/50 backdrop-blur-sm rounded-full text-sm font-bold hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                  >
                    {tag}
                  </button>
                )
              )}
            </div>
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-3.5 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 text-slate-600 transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-slate-900 text-white py-3.5 rounded-xl font-medium hover:bg-primary transition-all shadow-lg hover:shadow-primary/30"
              >
                Tạo lịch trình
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xl">
                  <Check />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Lịch trình gợi ý</h3>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-sm font-medium text-slate-500 hover:text-primary flex items-center gap-1 transition-colors"
              >
                <RotateCcw size={14} /> Làm lại
              </button>
            </div>

            <div className="space-y-0 relative pl-4 border-l-2 border-primary/20 ml-6">
              {[
                { time: "08:00", activity: "Ăn sáng tại Mì Quảng 1A" },
                { time: "09:30", activity: "Tham quan Ngũ Hành Sơn" },
                { time: "12:00", activity: "Ăn trưa & Nghỉ ngơi" },
                { time: "14:00", activity: "Tắm biển Mỹ Khê" },
                { time: "18:00", activity: "Dạo phố cổ Hội An" },
              ].map((item, idx) => (
                <div key={idx} className="relative pb-8 last:pb-0 group">
                  <div className="absolute -left-[23px] top-1 w-4 h-4 rounded-full bg-white border-4 border-primary/20 group-hover:bg-primary group-hover:scale-125 transition-all shadow-sm"></div>
                  <div className="bg-white/70 backdrop-blur-xl p-5 rounded-2xl border border-white/40 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all ml-4 shadow-sm">
                    <div className="text-xs font-black text-primary tracking-widest uppercase mb-1">
                      {item.time}
                    </div>
                    <div className="text-slate-800 font-bold">{item.activity}</div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full bg-emerald-500 text-white py-4 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-500/30">
              Lưu lịch trình
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripPlanner;
