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
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <div className="bg-white/70 backdrop-blur-2xl p-12 rounded-[3rem] border border-white/40 shadow-2xl text-center">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-6" />
          <p className="text-slate-900 font-black text-2xl tracking-tight">Đang tổng hợp dữ liệu hệ thống...</p>
          <p className="text-slate-500 font-medium">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <div className="bg-white/70 backdrop-blur-2xl p-12 rounded-[3rem] border border-white/40 shadow-2xl text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <p className="text-red-600 font-black text-xl mb-6">{error}</p>
          <button
            onClick={fetchStats}
            className="w-full py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const chartData = getMonthlyData();
  const tourStatusData = getTourStatusData();
  const userRoleData = getUserRoleData();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/70 backdrop-blur-2xl border border-white/40 p-10 rounded-[3rem] shadow-2xl shadow-black/5">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-primary rounded-full"></div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">
              Tổng quan hệ thống
            </h2>
          </div>
          <p className="text-slate-500 font-medium ml-5">Thống kê chi tiết hoạt động trên toàn hệ thống.</p>
        </div>
        <button
          onClick={exportToPDF}
          className="flex items-center gap-3 px-8 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95 whitespace-nowrap"
        >
          <Download size={20} />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white/40 shadow-xl shadow-black/5 flex items-center gap-5 hover:bg-white/80 transition-all">
          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-2xl">
            <Users size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Khách hàng</p>
            <p className="text-xl font-black text-slate-900">{formatNumber(stats.totalGuests)}</p>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white/40 shadow-xl shadow-black/5 flex items-center gap-5 hover:bg-white/80 transition-all">
          <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
            <Users size={24} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Agents</p>
            <p className="text-xl font-black text-slate-900">{formatNumber(stats.totalAgents)}</p>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white/40 shadow-xl shadow-black/5 flex items-center gap-5 hover:bg-white/80 transition-all">
          <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-2xl">
            <FileText size={24} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Tour chờ duyệt</p>
            <p className="text-xl font-black text-slate-900">{formatNumber(stats.pendingTours)}</p>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white/40 shadow-xl shadow-black/5 flex items-center gap-5 hover:bg-white/80 transition-all">
          <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
            <CheckCircle size={24} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Tour đã duyệt</p>
            <p className="text-xl font-black text-slate-900">{formatNumber(stats.approvedTours)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/40 shadow-2xl shadow-black/5">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
              Doanh thu & Đơn hàng
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} dy={10} />
                <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(16px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '16px'
                  }}
                  itemStyle={{ fontWeight: 800 }}
                  formatter={(value, name) => [name === 'revenue' ? formatCurrency(value) : formatNumber(value), name === 'revenue' ? 'Doanh thu' : 'Đơn hàng']}
                />
                <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="revenue" radius={[10, 10, 0, 0]} barSize={32} />
                <Bar yAxisId="right" dataKey="bookings" fill="#10b981" name="bookings" radius={[10, 10, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Trend */}
        <div className="bg-white/70 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/40 shadow-2xl shadow-black/5">
          <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
            Tăng trưởng
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(16px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '16px'
                  }}
                  itemStyle={{ fontWeight: 800 }}
                />
                <Legend verticalAlign="top" height={48} iconType="circle" />
                <Line type="monotone" dataKey="users" name="Người dùng mới" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, strokeWidth: 3, fill: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="tours" name="Tour mới" stroke="#f59e0b" strokeWidth={4} dot={{ r: 6, strokeWidth: 3, fill: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tour Status Breakdown */}
        <div className="bg-white/70 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/40 shadow-2xl shadow-black/5">
          <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
            Trạng thái Tour
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tourStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {tourStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(16px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Role Breakdown */}
        <div className="bg-white/70 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/40 shadow-2xl shadow-black/5">
          <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
            Cơ cấu người dùng
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(16px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
