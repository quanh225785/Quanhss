import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, Map, Calendar, FileText, Loader2, AlertCircle, CheckCircle, XCircle, EyeOff, Download, DollarSign, X, TrendingUp, Users, CalendarDays, ArrowRight, Search, Filter } from 'lucide-react';
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
    const [revenueDetails, setRevenueDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingRevenue, setLoadingRevenue] = useState(false);
    const [error, setError] = useState(null);
    const [showRevenueDetails, setShowRevenueDetails] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('revenue-desc'); // revenue-desc, revenue-asc, bookings-desc, bookings-asc, name-asc

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchRevenueDetails = async () => {
        try {
            setLoadingRevenue(true);
            const response = await api.get("/agent/revenue");
            if (response.data && response.data.code === 1000) {
                setRevenueDetails(response.data.result);
            }
        } catch (err) {
            console.error("Error fetching revenue details:", err);
        } finally {
            setLoadingRevenue(false);
        }
    };

    const handleShowRevenueDetails = () => {
        if (!revenueDetails && !loadingRevenue) {
            fetchRevenueDetails();
        }
        setShowRevenueDetails(true);
        // Reset filters when opening
        setSearchQuery('');
        setSortBy('revenue-desc');
    };

    // Filter và sort revenue details
    const filteredRevenueDetails = useMemo(() => {
        if (!revenueDetails) return [];

        let filtered = [...revenueDetails];

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(tour => 
                tour.tourName.toLowerCase().includes(query)
            );
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'revenue-desc':
                    return (b.totalRevenue || 0) - (a.totalRevenue || 0);
                case 'revenue-asc':
                    return (a.totalRevenue || 0) - (b.totalRevenue || 0);
                case 'bookings-desc':
                    return (b.totalBookings || 0) - (a.totalBookings || 0);
                case 'bookings-asc':
                    return (a.totalBookings || 0) - (b.totalBookings || 0);
                case 'name-asc':
                    return a.tourName.localeCompare(b.tourName);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [revenueDetails, searchQuery, sortBy]);

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

    const formatCurrencyForPDF = (num) => {
        if (!num) return "0";
        return new Intl.NumberFormat("vi-VN").format(num);
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

    // Helper function để thêm text với wrap và xử lý ký tự đặc biệt
    const addTextToPDF = (doc, text, x, y, maxWidth = 170) => {
        // Thay thế ký tự Đ bằng D để tránh lỗi font
        const safeText = text.replace(/Đ/g, 'D').replace(/đ/g, 'd');
        const lines = doc.splitTextToSize(safeText, maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * 7);
    };

    // Xuất PDF report
    const exportToPDF = async () => {
        try {
            // Fetch revenue details if not already loaded
            if (!revenueDetails && !loadingRevenue) {
                await fetchRevenueDetails();
            }

            const doc = new jsPDF();
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userName = user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user.firstName || user.lastName || 'Agent';
            
            const currentDate = new Date().toLocaleDateString('vi-VN');
            
            // Header
            doc.setFontSize(18);
            doc.text('BAO CAO THONG KE AGENT', 105, 20, { align: 'center' });
            
            doc.setFontSize(12);
            doc.text(`Nguoi tao: ${userName}`, 20, 35);
            doc.text(`Ngay xuat: ${currentDate}`, 20, 42);
            
            let yPos = 55;
            
            // Tổng quan
            doc.setFontSize(14);
            doc.text('TONG QUAN', 20, yPos);
            yPos += 10;
            doc.setFontSize(11);
            yPos = addTextToPDF(doc, `Tong Tour: ${formatNumber(stats.totalTours)}`, 20, yPos);
            yPos = addTextToPDF(doc, `Tong Chuyen: ${formatNumber(stats.totalTrips)}`, 20, yPos);
            yPos = addTextToPDF(doc, `Tong Dat cho: ${formatNumber(stats.totalBookings)}`, 20, yPos);
            yPos = addTextToPDF(doc, `Tong Doanh thu: ${formatCurrencyForPDF(stats.totalRevenue)} VND`, 20, yPos);
            yPos = addTextToPDF(doc, `Doanh thu thang nay: ${formatCurrencyForPDF(stats.thisMonthRevenue)} VND`, 20, yPos);
            yPos += 3;
            
            // Tours theo trạng thái
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            doc.setFontSize(14);
            doc.text('TOUR THEO TRANG THAI', 20, yPos);
            yPos += 10;
            doc.setFontSize(11);
            yPos = addTextToPDF(doc, `Cho duyet: ${formatNumber(stats.pendingTours)}`, 20, yPos);
            yPos = addTextToPDF(doc, `Da duyet: ${formatNumber(stats.approvedTours)}`, 20, yPos);
            yPos = addTextToPDF(doc, `Da tu choi: ${formatNumber(stats.rejectedTours)}`, 20, yPos);
            yPos = addTextToPDF(doc, `Da an: ${formatNumber(stats.hiddenTours)}`, 20, yPos);
            yPos += 3;
            
            // Thống kê theo tháng
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            doc.setFontSize(14);
            doc.text('THONG KE THEO THANG (6 thang gan nhat)', 20, yPos);
            yPos += 10;
            doc.setFontSize(10);
            
            const toursByMonth = getToursByMonthData();
            const bookingsByMonth = getBookingsByMonthData();
            const revenueByMonth = getRevenueByMonthData();
            
            // Header của bảng
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            yPos = addTextToPDF(doc, 'Thang | Tours | Dat cho | Doanh thu', 20, yPos);
            doc.setFont(undefined, 'normal');
            yPos += 2;
            
            toursByMonth.forEach((item, index) => {
                if (yPos > 280) {
                    doc.addPage();
                    yPos = 20;
                }
                const bookings = bookingsByMonth[index]?.bookings || 0;
                const revenue = revenueByMonth[index]?.revenue || 0;
                const rowText = `${item.name} | ${item.tours} | ${bookings} | ${formatCurrencyForPDF(revenue)} VND`;
                yPos = addTextToPDF(doc, rowText, 20, yPos, 170);
            });
            
            // Doanh thu chi tiết theo tour
            if (revenueDetails && revenueDetails.length > 0) {
                yPos += 5;
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.setFontSize(14);
                doc.text('DOANH THU CHI TIET THEO TOUR', 20, yPos);
                yPos += 10;
                doc.setFontSize(10);
                
                revenueDetails.forEach((tour) => {
                    if (yPos > 280) {
                        doc.addPage();
                        yPos = 20;
                    }
                    
                    // Tour header
                    doc.setFontSize(11);
                    doc.setFont(undefined, 'bold');
                    const tourName = tour.tourName.length > 50 ? tour.tourName.substring(0, 50) + '...' : tour.tourName;
                    yPos = addTextToPDF(doc, tourName, 20, yPos, 170);
                    doc.setFont(undefined, 'normal');
                    doc.setFontSize(10);
                    const tourInfo = `  Dat cho: ${formatNumber(tour.totalBookings)} | Doanh thu: ${formatCurrencyForPDF(tour.totalRevenue)} VND`;
                    yPos = addTextToPDF(doc, tourInfo, 20, yPos, 170);
                    
                    // Trips
                    if (tour.trips && tour.trips.length > 0) {
                        tour.trips.forEach((trip) => {
                            if (yPos > 280) {
                                doc.addPage();
                                yPos = 20;
                            }
                            const startDate = new Date(trip.startDate).toLocaleDateString('vi-VN');
                            const endDate = new Date(trip.endDate).toLocaleDateString('vi-VN');
                            const tripInfo = `    - ${startDate} -> ${endDate}: ${formatNumber(trip.totalBookings)} dat cho, ${formatCurrencyForPDF(trip.totalRevenue)} VND`;
                            yPos = addTextToPDF(doc, tripInfo, 20, yPos, 170);
                        });
                    }
                    yPos += 3;
                });
            }
            
            // Footer
            const pageCount = doc.internal.pages.length - 1;
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(10);
                doc.text(`Trang ${i}/${pageCount}`, 105, 285, { align: 'center' });
            }
            
            // Lưu file
            doc.save(`bao-cao-agent-${currentDate.replace(/\//g, '-')}.pdf`);
        } catch (error) {
            console.error("Error exporting PDF:", error);
            alert("Co loi xay ra khi xuat PDF. Vui long thu lai.");
        }
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
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Doanh thu theo tháng (6 tháng gần nhất)</h3>
                    <button
                        onClick={handleShowRevenueDetails}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                    >
                        <TrendingUp size={16} />
                        <span>Chi tiết theo tour</span>
                    </button>
                </div>
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

            {/* Revenue Details Modal */}
            {showRevenueDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 backdrop-blur-sm">
                    <div className="w-full h-full bg-white overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b border-green-100 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-zinc-900 flex items-center gap-3">
                                        <TrendingUp className="text-green-600" size={32} />
                                        Báo cáo doanh thu chi tiết
                                    </h2>
                                    <p className="text-base text-zinc-600 mt-2">Theo từng tour và chuyến</p>
                                </div>
                                <button
                                    onClick={() => setShowRevenueDetails(false)}
                                    className="p-3 hover:bg-white/80 rounded-lg transition-colors text-zinc-600 hover:text-zinc-900"
                                >
                                    <X size={28} />
                                </button>
                            </div>

                            {/* Search and Filter */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Search Input */}
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo tên tour..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                                    />
                                </div>

                                {/* Sort Filter */}
                                <div className="relative">
                                    <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400" size={20} />
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="pl-12 pr-10 py-3 bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base appearance-none cursor-pointer min-w-[200px]"
                                    >
                                        <option value="revenue-desc">Doanh thu: Cao → Thấp</option>
                                        <option value="revenue-asc">Doanh thu: Thấp → Cao</option>
                                        <option value="bookings-desc">Đặt chỗ: Nhiều → Ít</option>
                                        <option value="bookings-asc">Đặt chỗ: Ít → Nhiều</option>
                                        <option value="name-asc">Tên: A → Z</option>
                                    </select>
                                </div>
                            </div>

                            {/* Results count */}
                            {revenueDetails && (
                                <div className="mt-4 text-sm text-zinc-600">
                                    Hiển thị <strong className="text-zinc-900">{filteredRevenueDetails.length}</strong> / {revenueDetails.length} tour
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto p-8 flex-1 bg-zinc-50">
                            {loadingRevenue ? (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                                </div>
                            ) : revenueDetails && revenueDetails.length > 0 ? (
                                filteredRevenueDetails.length > 0 ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {filteredRevenueDetails.map((tour, index) => (
                                        <div 
                                            key={tour.tourId} 
                                            className="bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden hover:shadow-xl transition-all"
                                        >
                                            {/* Tour Header */}
                                            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-zinc-200">
                                                <div className="flex items-start gap-5">
                                                    {tour.tourImageUrl ? (
                                                        <img
                                                            src={tour.tourImageUrl}
                                                            alt={tour.tourName}
                                                            className="w-32 h-32 object-cover rounded-xl shadow-lg border-2 border-white"
                                                        />
                                                    ) : (
                                                        <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-lg flex items-center justify-center">
                                                            <Map className="text-white" size={48} />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex-1">
                                                                <h3 className="text-2xl font-bold text-zinc-900 mb-3 line-clamp-2">
                                                                    {tour.tourName}
                                                                </h3>
                                                                <div className="flex flex-wrap gap-3">
                                                                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md">
                                                                        <Users size={18} className="text-blue-600" />
                                                                        <span className="text-base font-semibold text-zinc-700">
                                                                            {formatNumber(tour.totalBookings)} đặt chỗ
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg shadow-md border border-green-200">
                                                                        <DollarSign size={18} className="text-green-600" />
                                                                        <span className="text-base font-bold text-green-700">
                                                                            {formatCurrency(tour.totalRevenue)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Trips List */}
                                            {tour.trips && tour.trips.length > 0 && (
                                                <div className="p-6">
                                                    <div className="flex items-center gap-2 mb-5">
                                                        <CalendarDays size={20} className="text-indigo-600" />
                                                        <h4 className="text-base font-semibold text-zinc-700 uppercase tracking-wide">
                                                            Chi tiết theo chuyến ({tour.trips.length} chuyến)
                                                        </h4>
                                                    </div>
                                                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                                        {tour.trips.map((trip) => {
                                                            const startDate = new Date(trip.startDate);
                                                            const endDate = new Date(trip.endDate);
                                                            const hasRevenue = trip.totalRevenue > 0;
                                                            
                                                            return (
                                                                <div 
                                                                    key={trip.tripId} 
                                                                    className={`p-5 rounded-xl border-2 transition-all ${
                                                                        hasRevenue 
                                                                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:border-green-300 hover:shadow-md' 
                                                                            : 'bg-zinc-50 border-zinc-200'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center justify-between gap-4">
                                                                        <div className="flex items-center gap-4 flex-1">
                                                                            <div className={`p-3 rounded-xl ${
                                                                                hasRevenue ? 'bg-green-100' : 'bg-zinc-200'
                                                                            }`}>
                                                                                <Calendar className={hasRevenue ? 'text-green-700' : 'text-zinc-600'} size={24} />
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="flex items-center gap-3 text-base font-semibold text-zinc-900">
                                                                                    <span className="text-zinc-700">
                                                                                        {startDate.toLocaleDateString('vi-VN', { 
                                                                                            day: '2-digit', 
                                                                                            month: '2-digit', 
                                                                                            year: 'numeric' 
                                                                                        })}
                                                                                    </span>
                                                                                    <ArrowRight size={16} className="text-zinc-400" />
                                                                                    <span className="text-zinc-700">
                                                                                        {endDate.toLocaleDateString('vi-VN', { 
                                                                                            day: '2-digit', 
                                                                                            month: '2-digit', 
                                                                                            year: 'numeric' 
                                                                                        })}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-6">
                                                                            <div className="text-right">
                                                                                <div className="flex items-center gap-2 text-base">
                                                                                    <Users size={18} className="text-zinc-500" />
                                                                                    <span className="text-zinc-700 font-semibold">
                                                                                        {formatNumber(trip.totalBookings)}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="text-right min-w-[150px]">
                                                                                <div className="flex items-center gap-2">
                                                                                    <DollarSign size={20} className={hasRevenue ? 'text-green-600' : 'text-zinc-400'} />
                                                                                    <span className={`font-bold text-base ${
                                                                                        hasRevenue ? 'text-green-700' : 'text-zinc-500'
                                                                                    }`}>
                                                                                        {formatCurrency(trip.totalRevenue)}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 mb-4">
                                            <Search className="text-zinc-400" size={32} />
                                        </div>
                                        <p className="text-zinc-500 font-medium">Không tìm thấy tour nào</p>
                                        <p className="text-sm text-zinc-400 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
                                    </div>
                                )
                            ) : (
                                <div className="text-center py-16">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 mb-4">
                                        <TrendingUp className="text-zinc-400" size={32} />
                                    </div>
                                    <p className="text-zinc-500 font-medium">Chưa có dữ liệu doanh thu</p>
                                    <p className="text-sm text-zinc-400 mt-1">Dữ liệu sẽ hiển thị khi có đặt chỗ đã thanh toán</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardOverview;
