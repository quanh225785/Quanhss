import React, { useState, useEffect } from "react";
import { Users, Map as MapIcon, DollarSign, FileText, Loader2, AlertCircle, TrendingUp, Download, PieChart as PieChartIcon, Package, CheckCircle, XCircle, EyeOff } from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import StatCard from "../shared/StatCard";
import { api } from "../../utils/api";
import { useToast } from "../../context/ToastContext";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Initialize pdfmake with fonts
pdfMake.vfs = pdfFonts.vfs;

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/admin/stats");
      if (response.data && response.data.code === 1000) {
        setStats(response.data.result);
      } else {
        setError("Không thể tải dữ liệu thống kê hệ thống");
      }
    } catch (err) {
      console.error("Error fetching admin stats:", err);
      setError("Lỗi khi kết nối với máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return "0";
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const formatCurrency = (num) => {
    if (!num && num !== 0) return "0 VNĐ";
    return new Intl.NumberFormat("vi-VN").format(num) + " VNĐ";
  };

  const getMonthlyData = () => {
    if (!stats) return [];

    // Get all month keys
    const months = Object.keys(stats.revenueByMonth).sort();

    return months.map(month => ({
      name: month,
      revenue: stats.revenueByMonth[month] || 0,
      bookings: stats.bookingsByMonth[month] || 0,
      users: stats.usersByMonth[month] || 0,
      tours: stats.toursByMonth[month] || 0,
    }));
  };

  const getTourStatusData = () => {
    if (!stats) return [];
    return [
      { name: "Chờ duyệt", value: stats.pendingTours || 0 },
      { name: "Đã duyệt", value: stats.approvedTours || 0 },
      { name: "Từ chối", value: stats.rejectedTours || 0 },
      { name: "Đã ẩn", value: stats.hiddenTours || 0 },
    ].filter(item => item.value > 0);
  };

  const getUserRoleData = () => {
    if (!stats) return [];
    return [
      { name: "Khách hàng", value: stats.totalGuests || 0 },
      { name: "Agent", value: stats.totalAgents || 0 },
      { name: "Admin", value: stats.totalAdmins || 0 },
    ];
  };

  const exportToPDF = () => {
    if (!stats) return;

    const monthlyData = getMonthlyData();
    const currentDate = new Date().toLocaleDateString('vi-VN');

    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      header: {
        text: 'BÁO CÁO TOÀN BỘ HỆ THỐNG',
        alignment: 'center',
        margin: [0, 20, 0, 0],
        style: 'headerTitle'
      },
      footer: (currentPage, pageCount) => ({
        text: `Trang ${currentPage}/${pageCount}`,
        alignment: 'center',
        margin: [0, 20, 0, 0],
        style: 'footer'
      }),
      content: [
        {
          columns: [
            { text: `Ngày xuất: ${currentDate}`, style: 'infoText' },
            { text: `Vai trò: Admin`, style: 'infoText', alignment: 'right' }
          ],
          margin: [0, 0, 0, 24]
        },

        { text: 'CHỈ SỐ TỔNG QUAN', style: 'sectionHeader' },
        {
          table: {
            widths: ['*', 'auto', 'auto', '*'],
            body: [
              [
                { text: 'Người dùng', style: 'tableHeader' },
                { text: 'Tour', style: 'tableHeader' },
                { text: 'Đơn hàng', style: 'tableHeader' },
                { text: 'Doanh thu', style: 'tableHeader', alignment: 'right' }
              ],
              [
                formatNumber(stats.totalUsers),
                formatNumber(stats.totalTours),
                formatNumber(stats.totalBookings),
                { text: formatCurrency(stats.totalRevenue), alignment: 'right', bold: true }
              ]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 24]
        },

        { text: 'CHI TIẾT NGƯỜI DÙNG', style: 'sectionHeader' },
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              ['Khách hàng', 'Agent', 'Admin'],
              [formatNumber(stats.totalGuests), formatNumber(stats.totalAgents), formatNumber(stats.totalAdmins)]
            ]
          },
          margin: [0, 0, 0, 24]
        },

        { text: 'CHI TIẾT TOUR', style: 'sectionHeader' },
        {
          table: {
            widths: ['*', '*', '*', '*'],
            body: [
              ['Chờ duyệt', 'Đã duyệt', 'Đã từ chối', 'Đã ẩn'],
              [formatNumber(stats.pendingTours), formatNumber(stats.approvedTours), formatNumber(stats.rejectedTours), formatNumber(stats.hiddenTours)]
            ]
          },
          margin: [0, 0, 0, 24]
        },

        { text: 'THỐNG KÊ 6 THÁNG GẦN NHẤT', style: 'sectionHeader' },
        {
          table: {
            widths: ['auto', '*', '*', '*', '*'],
            body: [
              [
                { text: 'Tháng', style: 'tableHeader' },
                { text: 'Người dùng mới', style: 'tableHeader' },
                { text: 'Tour mới', style: 'tableHeader' },
                { text: 'Đơn hàng', style: 'tableHeader' },
                { text: 'Doanh thu', style: 'tableHeader', alignment: 'right' }
              ],
              ...monthlyData.map(item => [
                item.name,
                formatNumber(item.users),
                formatNumber(item.tours),
                formatNumber(item.bookings),
                { text: formatCurrency(item.revenue), alignment: 'right' }
              ])
            ]
          },
          layout: 'lightHorizontalLines'
        }
      ],
      styles: {
        headerTitle: { fontSize: 20, bold: true, color: '#1e40af' },
        sectionHeader: { fontSize: 14, bold: true, margin: [0, 10, 0, 10], color: '#1f2937' },
        tableHeader: { bold: true, fontSize: 11, color: '#1e40af', fillColor: '#eff6ff' },
        infoText: { fontSize: 10, color: '#6b7280' },
        footer: { fontSize: 9, color: '#9ca3af' }
      },
      defaultStyle: { fontSize: 10 }
    };

    const fileName = `bao-cao-he-thong-${currentDate.replace(/\//g, '-')}.pdf`;
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    });
    showToast({ type: 'success', message: 'Thành công', description: 'Đã tải xuống báo cáo PDF' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        <p className="text-zinc-500 font-medium">Đang tổng hợp dữ liệu hệ thống...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const chartData = getMonthlyData();
  const tourStatusData = getTourStatusData();
  const userRoleData = getUserRoleData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            Tổng quan hệ thống
          </h2>
          <p className="text-zinc-500">Thống kê chi tiết hoạt động trên toàn hệ thống.</p>
        </div>
        <button
          onClick={exportToPDF}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <Download size={18} />
          <span>Xuất báo cáo PDF</span>
        </button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng người dùng"
          value={formatNumber(stats.totalUsers)}
          change={`+${stats.usersByMonth[Object.keys(stats.usersByMonth).sort().pop()] || 0} tháng này`}
          icon={<Users className="text-blue-600" />}
        />
        <StatCard
          title="Tổng Tour"
          value={formatNumber(stats.totalTours)}
          change={`${stats.approvedTours} đã duyệt`}
          icon={<MapIcon className="text-purple-600" />}
        />
        <StatCard
          title="Đơn hàng"
          value={formatNumber(stats.totalBookings)}
          change={`${stats.pendingBookings} đơn mới`}
          icon={<Package className="text-amber-600" />}
        />
        <StatCard
          title="Doanh thu"
          value={formatCurrency(stats.totalRevenue)}
          change={`T8: ${formatCurrency(stats.thisMonthRevenue)}`}
          icon={<DollarSign className="text-emerald-600" />}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Users size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">Khách hàng</p>
            <p className="text-lg font-bold">{formatNumber(stats.totalGuests)}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Users size={20} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">Agents</p>
            <p className="text-lg font-bold">{formatNumber(stats.totalAgents)}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="p-2 bg-amber-50 rounded-lg">
            <FileText size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">Tour chờ duyệt</p>
            <p className="text-lg font-bold">{formatNumber(stats.pendingTours)}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <CheckCircle size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">Tour đã duyệt</p>
            <p className="text-lg font-bold">{formatNumber(stats.approvedTours)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600" />
              Doanh thu & Đơn hàng theo tháng
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
                <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value, name) => [name === 'revenue' ? formatCurrency(value) : formatNumber(value), name === 'revenue' ? 'Doanh thu' : 'Đơn hàng']}
                />
                <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="revenue" radius={[6, 6, 0, 0]} barSize={40} />
                <Bar yAxisId="right" dataKey="bookings" fill="#10b981" name="bookings" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Trend */}
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
            <Users size={20} className="text-indigo-600" />
            Người dùng & Tour mới
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="top" height={36} />
                <Line type="monotone" dataKey="users" name="Người dùng mới" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="tours" name="Tour mới" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tour Status Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
            <PieChartIcon size={20} className="text-blue-600" />
            Phân bổ trạng thái Tour
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tourStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {tourStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Role Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
            <Users size={20} className="text-indigo-600" />
            Cơ cấu người dùng
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
