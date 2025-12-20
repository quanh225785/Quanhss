import React, { useState, useEffect } from 'react';
import { BarChart3, Map, Calendar, FileText, Loader2, AlertCircle, CheckCircle, XCircle, EyeOff, Download, DollarSign } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from 'recharts';
import StatCard from './StatCard';
import { api } from '../../utils/api';
import jsPDF from 'jspdf';

const DashboardOverview = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get("/agent/stats");
            if (response.data && response.data.code === 1000) {
                setStats(response.data.result);
            } else {
                setError("Không thể tải dữ liệu thống kê");
            }
        } catch (err) {
            console.error("Error fetching stats:", err);
            setError("Lỗi khi tải dữ liệu thống kê");
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num) => {
        if (!num) return "0";
        return new Intl.NumberFormat("vi-VN").format(num);
    };

    const formatCurrency = (num) => {
        if (!num) return "0 VNĐ";
        return new Intl.NumberFormat("vi-VN").format(num) + " VNĐ";
    };

    // Chuẩn bị dữ liệu cho biểu đồ doanh thu theo tháng
    const getRevenueByMonthData = () => {
        if (!stats?.revenueByMonth) return [];
        return Object.entries(stats.revenueByMonth)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, revenue]) => ({
                name: month,
                revenue: revenue || 0,
            }));
    };

    // Xuất PDF report
    const exportToPDF = () => {
        const doc = new jsPDF();
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userName = user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.firstName || user.lastName || 'Agent';
        
        const currentDate = new Date().toLocaleDateString('vi-VN');
        
        // Header
        doc.setFontSize(18);
        doc.text('BÁO CÁO THỐNG KÊ AGENT', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`Người tạo: ${userName}`, 20, 35);
        doc.text(`Ngày xuất: ${currentDate}`, 20, 42);
        
        // Tổng quan
        doc.setFontSize(14);
        doc.text('TỔNG QUAN', 20, 55);
        doc.setFontSize(11);
        doc.text(`Tổng Tour: ${formatNumber(stats.totalTours)}`, 20, 65);
        doc.text(`Tổng Chuyến: ${formatNumber(stats.totalTrips)}`, 20, 72);
        doc.text(`Tổng Đặt chỗ: ${formatNumber(stats.totalBookings)}`, 20, 79);
        doc.text(`Tổng Doanh thu: ${formatCurrency(stats.totalRevenue)}`, 20, 86);
        doc.text(`Doanh thu tháng này: ${formatCurrency(stats.thisMonthRevenue)}`, 20, 93);
        
        // Tours theo trạng thái
        doc.setFontSize(14);
        doc.text('TOUR THEO TRẠNG THÁI', 20, 105);
        doc.setFontSize(11);
        doc.text(`Chờ duyệt: ${formatNumber(stats.pendingTours)}`, 20, 115);
        doc.text(`Đã duyệt: ${formatNumber(stats.approvedTours)}`, 20, 122);
        doc.text(`Đã từ chối: ${formatNumber(stats.rejectedTours)}`, 20, 129);
        doc.text(`Đã ẩn: ${formatNumber(stats.hiddenTours)}`, 20, 136);
        
        // Thống kê theo tháng
        doc.setFontSize(14);
        doc.text('THỐNG KÊ THEO THÁNG (6 tháng gần nhất)', 20, 148);
        doc.setFontSize(10);
        
        let yPos = 158;
        const toursByMonth = getToursByMonthData();
        const bookingsByMonth = getBookingsByMonthData();
        const revenueByMonth = getRevenueByMonthData();
        
        doc.text('Tháng | Tours | Đặt chỗ | Doanh thu', 20, yPos);
        yPos += 7;
        
        toursByMonth.forEach((item, index) => {
            const bookings = bookingsByMonth[index]?.bookings || 0;
            const revenue = revenueByMonth[index]?.revenue || 0;
            doc.text(`${item.name} | ${item.tours} | ${bookings} | ${formatCurrency(revenue)}`, 20, yPos);
            yPos += 7;
            
            if (yPos > 280) {
                doc.addPage();
                yPos = 20;
            }
        });
        
        // Footer
        const pageCount = doc.internal.pages.length - 1;
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.text(`Trang ${i}/${pageCount}`, 105, 285, { align: 'center' });
        }
        
        // Lưu file
        doc.save(`bao-cao-agent-${currentDate.replace(/\//g, '-')}.pdf`);
    };

    // Chuẩn bị dữ liệu cho biểu đồ tours theo tháng
    const getToursByMonthData = () => {
        if (!stats?.toursByMonth) return [];
        return Object.entries(stats.toursByMonth)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, count]) => ({
                name: month,
                tours: count,
            }));
    };

    // Chuẩn bị dữ liệu cho biểu đồ bookings theo tháng
    const getBookingsByMonthData = () => {
        if (!stats?.bookingsByMonth) return [];
        return Object.entries(stats.bookingsByMonth)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, count]) => ({
                name: month,
                bookings: count,
            }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-zinc-500">Đang tải dữ liệu thống kê...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center">
                    <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={fetchStats}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    const toursByMonthData = getToursByMonthData();
    const bookingsByMonthData = getBookingsByMonthData();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Tổng quan</h2>
                    <p className="text-zinc-500">Chào mừng trở lại! Đây là tình hình hoạt động của bạn.</p>
                </div>
                <button
                    onClick={exportToPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Download size={18} />
                    <span>Xuất PDF</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="Tổng Tour"
                    value={formatNumber(stats.totalTours)}
                    change={`${stats.pendingTours || 0} chờ duyệt`}
                    icon={<Map className="text-blue-600" />}
                />
                <StatCard
                    title="Tổng Chuyến"
                    value={formatNumber(stats.totalTrips)}
                    change=""
                    icon={<Calendar className="text-purple-600" />}
                />
                <StatCard
                    title="Tổng Đặt chỗ"
                    value={formatNumber(stats.totalBookings)}
                    change=""
                    icon={<BarChart3 className="text-emerald-600" />}
                />
                <StatCard
                    title="Tổng Doanh thu"
                    value={formatCurrency(stats.totalRevenue)}
                    change={stats.thisMonthRevenue ? `Tháng này: ${formatCurrency(stats.thisMonthRevenue)}` : ''}
                    icon={<DollarSign className="text-green-600" />}
                />
            </div>

            {/* Tour Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-zinc-500 text-sm font-medium">Tour chờ duyệt</span>
                        <FileText className="text-amber-600" size={20} />
                    </div>
                    <div className="text-2xl font-bold text-zinc-900">{formatNumber(stats.pendingTours)}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-zinc-500 text-sm font-medium">Tour đã duyệt</span>
                        <CheckCircle className="text-emerald-600" size={20} />
                    </div>
                    <div className="text-2xl font-bold text-zinc-900">{formatNumber(stats.approvedTours)}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-zinc-500 text-sm font-medium">Tour đã từ chối</span>
                        <XCircle className="text-red-600" size={20} />
                    </div>
                    <div className="text-2xl font-bold text-zinc-900">{formatNumber(stats.rejectedTours)}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-zinc-500 text-sm font-medium">Tour đã ẩn</span>
                        <EyeOff className="text-gray-600" size={20} />
                    </div>
                    <div className="text-2xl font-bold text-zinc-900">{formatNumber(stats.hiddenTours)}</div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tours by Month Chart */}
                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Tour theo tháng (6 tháng gần nhất)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={toursByMonthData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="tours" fill="#3b82f6" name="Số tour" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bookings by Month Chart */}
                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Đặt chỗ theo tháng (6 tháng gần nhất)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={bookingsByMonthData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="bookings"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, fill: '#10b981' }}
                                    name="Số đặt chỗ"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Doanh thu theo tháng (6 tháng gần nhất)</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getRevenueByMonthData()}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis 
                                tickFormatter={(value) => {
                                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                                    return value.toString();
                                }}
                            />
                            <Tooltip 
                                formatter={(value) => formatCurrency(value)}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="revenue" fill="#10b981" name="Doanh thu" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
