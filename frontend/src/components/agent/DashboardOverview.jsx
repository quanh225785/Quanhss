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
import { useToast } from '../../context/ToastContext';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Initialize pdfmake with fonts
pdfMake.vfs = pdfFonts.vfs;

const DashboardOverview = () => {
    const [stats, setStats] = useState(null);
    const [revenueDetails, setRevenueDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingRevenue, setLoadingRevenue] = useState(false);
    const [error, setError] = useState(null);
    const [showRevenueDetails, setShowRevenueDetails] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('revenue-desc'); // revenue-desc, revenue-asc, bookings-desc, bookings-asc, name-asc
    const { showToast } = useToast();

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

    // Xuất PDF report với pdfmake (hỗ trợ tiếng Việt)
    const exportToPDF = async () => {
        try {
            // Fetch revenue details if not already loaded
            if (!revenueDetails && !loadingRevenue) {
                await fetchRevenueDetails();
            }

            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userName = user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.firstName || user.lastName || 'Agent';

            const currentDate = new Date().toLocaleDateString('vi-VN');

            const toursByMonth = getToursByMonthData();
            const bookingsByMonth = getBookingsByMonthData();
            const revenueByMonth = getRevenueByMonthData();

            // Build PDF document definition
            const docDefinition = {
                pageSize: 'A4',
                pageMargins: [40, 60, 40, 60],

                // Header
                header: {
                    columns: [
                        {
                            text: 'BÁO CÁO THỐNG KÊ AGENT',
                            style: 'headerTitle',
                            alignment: 'center',
                            margin: [0, 20, 0, 0]
                        }
                    ]
                },

                // Footer with page numbers
                footer: function (currentPage, pageCount) {
                    return {
                        text: `Trang ${currentPage}/${pageCount}`,
                        alignment: 'center',
                        style: 'footer',
                        margin: [0, 20, 0, 0]
                    };
                },

                content: [
                    // Report info
                    {
                        columns: [
                            { text: `Người tạo: ${userName}`, style: 'infoText' },
                            { text: `Ngày xuất: ${currentDate}`, style: 'infoText', alignment: 'right' }
                        ],
                        margin: [0, 0, 0, 20]
                    },

                    // TỔNG QUAN section
                    { text: 'TỔNG QUAN', style: 'sectionHeader' },
                    {
                        table: {
                            widths: ['*', '*'],
                            body: [
                                [
                                    { text: 'Chỉ số', style: 'tableHeader' },
                                    { text: 'Giá trị', style: 'tableHeader', alignment: 'right' }
                                ],
                                ['Tổng Tour', { text: formatNumber(stats.totalTours), alignment: 'right' }],
                                ['Tổng Chuyến', { text: formatNumber(stats.totalTrips), alignment: 'right' }],
                                ['Tổng Đặt chỗ', { text: formatNumber(stats.totalBookings), alignment: 'right' }],
                                ['Tổng Doanh thu', { text: formatCurrency(stats.totalRevenue), alignment: 'right', bold: true, color: '#059669' }],
                                ['Doanh thu tháng này', { text: formatCurrency(stats.thisMonthRevenue), alignment: 'right', color: '#059669' }]
                            ]
                        },
                        layout: {
                            hLineWidth: function (i, node) {
                                return (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5;
                            },
                            vLineWidth: function () { return 0; },
                            hLineColor: function (i) { return i === 1 ? '#3b82f6' : '#e5e7eb'; },
                            paddingLeft: function () { return 10; },
                            paddingRight: function () { return 10; },
                            paddingTop: function () { return 8; },
                            paddingBottom: function () { return 8; }
                        },
                        margin: [0, 0, 0, 20]
                    },

                    // TOUR THEO TRẠNG THÁI section
                    { text: 'TOUR THEO TRẠNG THÁI', style: 'sectionHeader' },
                    {
                        table: {
                            widths: ['*', 'auto'],
                            body: [
                                [
                                    { text: 'Trạng thái', style: 'tableHeader' },
                                    { text: 'Số lượng', style: 'tableHeader', alignment: 'center' }
                                ],
                                [
                                    { text: '⏳ Chờ duyệt', fillColor: '#fef3c7' },
                                    { text: formatNumber(stats.pendingTours), alignment: 'center', fillColor: '#fef3c7' }
                                ],
                                [
                                    { text: '✅ Đã duyệt', fillColor: '#d1fae5' },
                                    { text: formatNumber(stats.approvedTours), alignment: 'center', fillColor: '#d1fae5' }
                                ],
                                [
                                    { text: '❌ Đã từ chối', fillColor: '#fee2e2' },
                                    { text: formatNumber(stats.rejectedTours), alignment: 'center', fillColor: '#fee2e2' }
                                ],
                                [
                                    { text: '👁 Đã ẩn', fillColor: '#f3f4f6' },
                                    { text: formatNumber(stats.hiddenTours), alignment: 'center', fillColor: '#f3f4f6' }
                                ]
                            ]
                        },
                        layout: {
                            hLineWidth: function (i, node) {
                                return (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5;
                            },
                            vLineWidth: function () { return 0; },
                            hLineColor: function (i) { return i === 1 ? '#3b82f6' : '#e5e7eb'; },
                            paddingLeft: function () { return 10; },
                            paddingRight: function () { return 10; },
                            paddingTop: function () { return 8; },
                            paddingBottom: function () { return 8; }
                        },
                        margin: [0, 0, 0, 20]
                    },

                    // THỐNG KÊ THEO THÁNG section
                    { text: 'THỐNG KÊ THEO THÁNG (6 tháng gần nhất)', style: 'sectionHeader' },
                    {
                        table: {
                            widths: ['*', 'auto', 'auto', '*'],
                            body: [
                                [
                                    { text: 'Tháng', style: 'tableHeader' },
                                    { text: 'Tours', style: 'tableHeader', alignment: 'center' },
                                    { text: 'Đặt chỗ', style: 'tableHeader', alignment: 'center' },
                                    { text: 'Doanh thu', style: 'tableHeader', alignment: 'right' }
                                ],
                                ...toursByMonth.map((item, index) => {
                                    const bookings = bookingsByMonth[index]?.bookings || 0;
                                    const revenue = revenueByMonth[index]?.revenue || 0;
                                    const isEven = index % 2 === 0;
                                    return [
                                        { text: item.name, fillColor: isEven ? '#f9fafb' : null },
                                        { text: formatNumber(item.tours), alignment: 'center', fillColor: isEven ? '#f9fafb' : null },
                                        { text: formatNumber(bookings), alignment: 'center', fillColor: isEven ? '#f9fafb' : null },
                                        { text: formatCurrency(revenue), alignment: 'right', fillColor: isEven ? '#f9fafb' : null }
                                    ];
                                })
                            ]
                        },
                        layout: {
                            hLineWidth: function (i, node) {
                                return (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5;
                            },
                            vLineWidth: function () { return 0; },
                            hLineColor: function (i) { return i === 1 ? '#3b82f6' : '#e5e7eb'; },
                            paddingLeft: function () { return 10; },
                            paddingRight: function () { return 10; },
                            paddingTop: function () { return 8; },
                            paddingBottom: function () { return 8; }
                        },
                        margin: [0, 0, 0, 20]
                    }
                ],

                // Styles
                styles: {
                    headerTitle: {
                        fontSize: 18,
                        bold: true,
                        color: '#1e40af'
                    },
                    sectionHeader: {
                        fontSize: 14,
                        bold: true,
                        color: '#1f2937',
                        margin: [0, 10, 0, 10],
                        decoration: 'underline',
                        decorationColor: '#3b82f6'
                    },
                    tableHeader: {
                        bold: true,
                        fontSize: 11,
                        color: '#1e40af',
                        fillColor: '#eff6ff'
                    },
                    infoText: {
                        fontSize: 10,
                        color: '#6b7280'
                    },
                    footer: {
                        fontSize: 9,
                        color: '#9ca3af'
                    }
                },

                defaultStyle: {
                    fontSize: 10,
                    color: '#374151'
                }
            };

            // Add revenue details section if available
            if (revenueDetails && revenueDetails.length > 0) {
                docDefinition.content.push(
                    { text: 'DOANH THU CHI TIẾT THEO TOUR', style: 'sectionHeader', pageBreak: 'before' }
                );

                revenueDetails.forEach((tour, tourIndex) => {
                    // Tour header
                    docDefinition.content.push({
                        text: `${tourIndex + 1}. ${tour.tourName}`,
                        fontSize: 12,
                        bold: true,
                        color: '#1f2937',
                        margin: [0, 15, 0, 5]
                    });

                    docDefinition.content.push({
                        columns: [
                            { text: `Tổng đặt chỗ: ${formatNumber(tour.totalBookings)}`, fontSize: 10, color: '#6b7280' },
                            { text: `Tổng doanh thu: ${formatCurrency(tour.totalRevenue)}`, fontSize: 10, color: '#059669', bold: true, alignment: 'right' }
                        ],
                        margin: [0, 0, 0, 10]
                    });

                    // Trips table
                    if (tour.trips && tour.trips.length > 0) {
                        const tripTableBody = [
                            [
                                { text: 'Ngày bắt đầu', style: 'tableHeader' },
                                { text: 'Ngày kết thúc', style: 'tableHeader' },
                                { text: 'Đặt chỗ', style: 'tableHeader', alignment: 'center' },
                                { text: 'Doanh thu', style: 'tableHeader', alignment: 'right' }
                            ]
                        ];

                        tour.trips.forEach((trip, tripIndex) => {
                            const startDate = new Date(trip.startDate).toLocaleDateString('vi-VN');
                            const endDate = new Date(trip.endDate).toLocaleDateString('vi-VN');
                            const isEven = tripIndex % 2 === 0;
                            tripTableBody.push([
                                { text: startDate, fillColor: isEven ? '#f9fafb' : null },
                                { text: endDate, fillColor: isEven ? '#f9fafb' : null },
                                { text: formatNumber(trip.totalBookings), alignment: 'center', fillColor: isEven ? '#f9fafb' : null },
                                { text: formatCurrency(trip.totalRevenue), alignment: 'right', fillColor: isEven ? '#f9fafb' : null }
                            ]);
                        });

                        docDefinition.content.push({
                            table: {
                                widths: ['*', '*', 'auto', '*'],
                                body: tripTableBody
                            },
                            layout: {
                                hLineWidth: function (i, node) {
                                    return (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5;
                                },
                                vLineWidth: function () { return 0; },
                                hLineColor: function (i) { return i === 1 ? '#10b981' : '#e5e7eb'; },
                                paddingLeft: function () { return 8; },
                                paddingRight: function () { return 8; },
                                paddingTop: function () { return 6; },
                                paddingBottom: function () { return 6; }
                            },
                            margin: [10, 0, 0, 10]
                        });
                    }
                });
            }

            // Generate and download PDF
            pdfMake.createPdf(docDefinition).download(`bao-cao-agent-${currentDate.replace(/\//g, '-')}.pdf`);

            showToast({
                type: 'success',
                message: 'Xuất PDF thành công',
                description: 'Báo cáo đã được tải xuống.'
            });
        } catch (error) {
            console.error("Error exporting PDF:", error);
            showToast({
                type: 'error',
                message: 'Lỗi xuất PDF',
                description: 'Có lỗi xảy ra khi xuất PDF. Vui lòng thử lại.'
            });
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
                <div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/40 shadow-xl shadow-black/5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-zinc-500 text-sm font-medium">Tour chờ duyệt</span>
                        <FileText className="text-amber-600" size={20} />
                    </div>
                    <div className="text-2xl font-bold text-zinc-900">{formatNumber(stats.pendingTours)}</div>
                </div>
                <div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/40 shadow-xl shadow-black/5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-zinc-500 text-sm font-medium">Tour đã duyệt</span>
                        <CheckCircle className="text-emerald-600" size={20} />
                    </div>
                    <div className="text-2xl font-bold text-zinc-900">{formatNumber(stats.approvedTours)}</div>
                </div>
                <div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/40 shadow-xl shadow-black/5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-zinc-500 text-sm font-medium">Tour đã từ chối</span>
                        <XCircle className="text-red-600" size={20} />
                    </div>
                    <div className="text-2xl font-bold text-zinc-900">{formatNumber(stats.rejectedTours)}</div>
                </div>
                <div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/40 shadow-xl shadow-black/5">
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
                <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/40 shadow-xl shadow-black/5">
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
                <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/40 shadow-xl shadow-black/5">
                    <h3 className="text-lg font-semibold mb-4">Đặt chỗ theo tháng (6 tháng gần nhất)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={bookingsByMonthData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(8px)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="bookings"
                                    stroke="#10b981"
                                    strokeWidth={3}
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
            <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/40 shadow-xl shadow-black/5">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Doanh thu theo tháng (6 tháng gần nhất)</h3>
                    <button
                        onClick={handleShowRevenueDetails}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-500/10 text-green-700 rounded-lg hover:bg-green-500/20 transition-colors"
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
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(8px)' }}
                            />
                            <Bar dataKey="revenue" fill="#10b981" name="Doanh thu" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Revenue Details Modal */}
            {showRevenueDetails && (
                <div className="absolute inset-0 bg-black/40 z-40 backdrop-blur-sm">
                    <div className="w-full h-full bg-white/90 backdrop-blur-xl overflow-hidden flex flex-col shadow-2xl">
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
                                                                        className={`p-5 rounded-xl border-2 transition-all ${hasRevenue
                                                                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:border-green-300 hover:shadow-md'
                                                                            : 'bg-zinc-50 border-zinc-200'
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-center justify-between gap-4">
                                                                            <div className="flex items-center gap-4 flex-1">
                                                                                <div className={`p-3 rounded-xl ${hasRevenue ? 'bg-green-100' : 'bg-zinc-200'
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
                                                                                        <span className={`font-bold text-base ${hasRevenue ? 'text-green-700' : 'text-zinc-500'
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
