import React from 'react';
import { BarChart3, Map, User, AlertCircle } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import StatCard from './StatCard';

// Mock Data
const revenueData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 2000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
    { name: 'Jul', value: 3490 },
];

const DashboardOverview = () => (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Tổng quan</h2>
            <p className="text-zinc-500">Chào mừng trở lại! Đây là tình hình hoạt động của bạn.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Doanh thu tháng này" value="45.2M VNĐ" change="+12.5%" icon={<BarChart3 className="text-emerald-600" />} />
            <StatCard title="Tour đã tổ chức" value="12" change="+2" icon={<Map className="text-blue-600" />} />
            <StatCard title="Tỉ lệ lấp đầy" value="85%" change="+5%" icon={<User className="text-purple-600" />} />
        </div>

        {/* Account Status Alert */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
                <h3 className="text-sm font-medium text-amber-800">Trạng thái hồ sơ: Đang xét duyệt</h3>
                <p className="text-sm text-amber-700 mt-1">
                    Hồ sơ đăng ký Agent của bạn đang được Admin xem xét. Một số tính năng có thể bị giới hạn.
                </p>
            </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Biểu đồ doanh thu</h3>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a' }} />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#18181b"
                            strokeWidth={2}
                            dot={{ r: 4, fill: '#18181b', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6, fill: '#18181b' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
);

export default DashboardOverview;
