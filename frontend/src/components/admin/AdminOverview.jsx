import React from "react";
import { Users, Map, DollarSign, FileText } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import StatCard from "../shared/StatCard";

const data = [
  { name: "T1", revenue: 4000, bookings: 24 },
  { name: "T2", revenue: 3000, bookings: 13 },
  { name: "T3", revenue: 2000, bookings: 98 },
  { name: "T4", revenue: 2780, bookings: 39 },
  { name: "T5", revenue: 1890, bookings: 48 },
  { name: "T6", revenue: 2390, bookings: 38 },
  { name: "T7", revenue: 3490, bookings: 43 },
];

const AdminOverview = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Tổng quan hệ thống
        </h2>
        <p className="text-zinc-500">Báo cáo và thống kê toàn bộ hệ thống.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Tổng người dùng"
          value="1,234"
          change="+12%"
          icon={<Users className="text-blue-600" />}
        />
        <StatCard
          title="Tổng Tour"
          value="56"
          change="+3"
          icon={<Map className="text-purple-600" />}
        />
        <StatCard
          title="Doanh thu"
          value="1.2B VNĐ"
          change="+8%"
          icon={<DollarSign className="text-emerald-600" />}
        />
        <StatCard
          title="Đơn chờ duyệt"
          value="15"
          change="-2"
          icon={<FileText className="text-amber-600" />}
        />
      </div>

      <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">
          Biểu đồ doanh thu & Đơn hàng
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Bar
                yAxisId="left"
                dataKey="revenue"
                fill="#8884d8"
                name="Doanh thu"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="bookings"
                fill="#82ca9d"
                name="Đơn hàng"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
