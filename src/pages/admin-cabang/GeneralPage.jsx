//eslint-disable-next-line no-unused-vars
import React, { useEffect, useState, useCallback } from "react";
//eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Clock, Calendar, TrendingUp, Users, BarChart3, Target, Zap } from "lucide-react";
import { Users as UsersIcon, Package, ShoppingCart, DollarSign, BarChart3 as BarChartIcon, TrendingDown } from "lucide-react";
import axios from "axios";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  BarChart,
  Bar
} from "recharts";
import { format, getDay, getMonth, getWeekOfMonth, parseISO } from "date-fns";
import { id } from "date-fns/locale";

const API_URL = "http://localhost:8000/api";

const formatRupiah = (value = 0) => {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `Rp ${value}`;
  }
};

const formatCompact = (value) => new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 0 }).format(value);

const processChartData = (rawData = [], filter) => {
  if (!rawData || rawData.length === 0) return [];
  if (filter === "minggu") {
    const days = [ 
      { name: "Min", value: 0 }, 
      { name: "Sen", value: 0 }, 
      { name: "Sel", value: 0 }, 
      { name: "Rab", value: 0 }, 
      { name: "Kam", value: 0 }, 
      { name: "Jum", value: 0 }, 
      { name: "Sab", value: 0 } 
    ];
    rawData.forEach(item => { 
      const dayIndex = getDay(parseISO(item.tanggal)); 
      days[dayIndex].value += parseFloat(item.total); 
    });
    return days;
  }
  if (filter === "bulan") {
    const weeks = [ 
      { name: "Minggu 1", value: 0 }, 
      { name: "Minggu 2", value: 0 }, 
      { name: "Minggu 3", value: 0 }, 
      { name: "Minggu 4", value: 0 }, 
      { name: "Minggu 5", value: 0 } 
    ];
    rawData.forEach(item => { 
      const date = parseISO(item.tanggal); 
      const weekOfMonth = getWeekOfMonth(date) - 1; 
      if (weeks[weekOfMonth]) { 
        weeks[weekOfMonth].value += parseFloat(item.total); 
      } 
    });
    return weeks.filter(w => w.value > 0);
  }
  if (filter === "tahun") {
    const months = Array.from({ length: 12 }, (_, i) => ({ 
      name: format(new Date(0, i), "MMM", { locale: id }), 
      value: 0 
    }));
    rawData.forEach(item => { 
      const monthIndex = getMonth(parseISO(item.tanggal)); 
      months[monthIndex].value += parseFloat(item.total); 
    });
    return months;
  }
  return [];
};

// Custom Tooltip untuk Chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 border border-gray-200 rounded-xl shadow-lg">
        <p className="font-bold text-gray-800 mb-1">{label}</p>
        <p className="text-sm text-gray-700">
          Jumlah: <span className="font-semibold">{formatRupiah(payload[0].value)}</span>
        </p>
      </div>
    );
  }
  return null;
};

// Komponen Stat Card yang lebih modern
const StatCard = ({ title, value, subtitle, icon, loading, theme = "red" }) => {
  const themeColors = {
    red: {
      bg: 'from-red-100 to-red-200',
      text: 'text-red-700',
      accent: 'text-red-600'
    },
    green: {
      bg: 'from-green-100 to-green-200',
      text: 'text-green-700',
      accent: 'text-green-600'
    },
    orange: {
      bg: 'from-orange-100 to-orange-200',
      text: 'text-orange-700',
      accent: 'text-orange-600'
    },
    amber: {
      bg: 'from-amber-100 to-amber-200',
      text: 'text-amber-700',
      accent: 'text-amber-600'
    }
  };

  const colors = themeColors[theme] || themeColors.red;

  if (loading) return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );

  return (
    <motion.div 
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden" 
      whileHover={{ y: -4 }} 
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colors.bg} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
          {React.cloneElement(icon, { className: colors.accent })}
        </div>
      </div>
    </motion.div>
  );
};

const GeneralPage = () => {
  // State for general stats
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({});

  // State for chart
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState(null);
  const [chartMode, setChartMode] = useState("pendapatan");
  const [chartFilter, setChartFilter] = useState("tahun");
  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // State untuk waktu real-time
  const [currentTime, setCurrentTime] = useState(new Date());

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const cabang = JSON.parse(localStorage.getItem("cabang") || "null");
  const cabangId = cabang?.id_cabang ?? null;

  // Warna tema berdasarkan sidebar (merah)
  const theme = {
    bgGradient: 'from-red-50 via-white to-red-100',
    primaryText: 'text-red-700',
    primaryAccent: 'text-red-600',
    chartRevenue: '#ef4444',
    chartExpense: '#dc2626', // Diubah dari #71717a menjadi merah yang lebih gelap
    quickActionBg: 'from-red-100 to-red-200',
    quickActionHoverBg: 'hover:bg-red-200/80',
    quickActionText: 'text-red-700',
    modalBorder: 'border-red-600',
    badgeGradient: 'from-red-500 to-red-600'
  };

  useEffect(() => {
    let cancelled = false;
    const fetchRecentOrders = async () => {
      if (user?.role !== "admin cabang" || !cabangId) return;
      
      try {
        setOrdersLoading(true);
        const res = await axios.get(
          `${API_URL}/dashboard/cabang/${cabangId}/recent-orders`, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res?.data?.status === 'success' && !cancelled) {
          setRecentOrders(res.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching recent orders:', err);
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    };

    fetchRecentOrders();
    return () => { cancelled = true; };
  }, [cabangId, token, user?.role]);

  // Update waktu real-time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  //useEffect for general dashboard stats
    useEffect(() => {
    let cancelled = false;
    const fetchStatsForCabang = async (id) => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API_URL}/dashboard/cabang/${id}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (res?.data?.status === "success" && !cancelled) {
          console.log('Dashboard Data:', res.data.data); // DEBUG
          setDashboardData(res.data.data);
        } else if (!cancelled) {
          setError("Response format unexpected");
        }
      } catch (err) {
        if (!cancelled) setError("Gagal mengambil data dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (user?.role === "admin cabang" && cabangId) {
      fetchStatsForCabang(cabangId);
    } else {
      setLoading(false);
      setError(user?.role !== "admin cabang" ? "Halaman ini khusus untuk Admin Cabang." : "Data cabang tidak ditemukan.");
    }
    return () => { cancelled = true; };
  }, [token, cabangId, user?.role]);

  // useEffect for chart data
  useEffect(() => {
    let cancelled = false;
    const fetchChartData = async () => {
      if (user?.role !== "admin cabang" || !cabangId) { 
        setChartData([]); 
        setChartLoading(false); 
        return; 
      }
      setChartLoading(true); 
      setChartError(null);
      try {
        const res = await axios.get(
          `${API_URL}/dashboard/cabang/${cabangId}/chart?filter=${chartFilter}`, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res?.data?.status === 'success' && !cancelled) {
          setChartData(processChartData(res.data.data[chartMode] || [], chartFilter));
        } else if (!cancelled) {
          setChartError("Gagal memuat data chart.");
        }
      } catch (err) {
        if (!cancelled) setChartError("Terjadi kesalahan saat mengambil data chart.");
      } finally {
        if (!cancelled) setChartLoading(false);
      }
    };
    fetchChartData();
    return () => { cancelled = true; };
  }, [cabangId, token, user?.role, chartMode, chartFilter]);

  const handleModeChange = (newMode) => {
    setChartMode(newMode);
    if (newMode === 'pengeluaran' && chartFilter === 'minggu') {
       setChartFilter('tahun');
    }
  };

  const useBarChart = !chartLoading && !chartError && chartData.length === 1;

  // Fungsi untuk menentukan status operasional berdasarkan waktu real-time
  const getOperationalStatus = () => {
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    
    // Jam operasional: 06:00 - 14:00
    const openHour = 6;
    const closeHour = 14;
    
    const isOpen = currentHour >= openHour && currentHour < closeHour;
    const status = isOpen ? 'Buka' : 'Tutup';
    const color = isOpen ? 'green' : 'red';
    
    return { status, color, currentHour, currentMinute };
  };

  const operationalStatus = getOperationalStatus();

  // Komponen RecentOrders - tambahkan sebelum Quick Actions
  const RecentOrders = ({ orders, loading }) => {
    if (loading) {
      return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Pemesanan Terbaru</h3>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 animate-pulse">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Pemesanan Terbaru</h3>
        <div className="space-y-3">
          {orders && orders.length > 0 ? (
            orders.slice(0, 5).map((order, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {order.nama_pelanggan?.charAt(0) || 'C'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {order.nama_pelanggan || 'Pelanggan'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {order.id_transaksi || 'TRX-XXXX'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatRupiah(order.total_harga)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.tanggal ? format(parseISO(order.tanggal), 'dd MMM yy, HH:mm') : '-'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>Tidak ada pemesanan hari ini</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Quick Actions
  const quickActions = [
    { label: "Laporan", path: `/admin-cabang/${cabangId}/dashboard/reports`, icon: <BarChartIcon size={20} /> },
    { label: "Pengeluaran", path: `/admin-cabang/${cabangId}/dashboard/pengeluaran`, icon: <TrendingDown size={20} /> },
    { label: "Karyawan", path: `/admin-cabang/${cabangId}/dashboard/karyawan`, icon: <UsersIcon size={20} /> },
    { label: "Produk", path: `/admin-cabang/${cabangId}/dashboard/produk`, icon: <Package size={20} /> },
  ];

  return (
    <div className={`min-h-screen p-6 space-y-6 bg-gradient-to-br ${theme.bgGradient}`}>
      {/* Header Section */}
      <motion.div 
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4" 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 text-lg">
            {format(currentTime, "EEEE, d MMMM yyyy  |  HH:mm:ss", { locale: id })}
          </p>
        </div>
        <div className="px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm">
          <span className="text-base font-semibold text-gray-800">
            {cabang?.nama_cabang || 'Cabang Cimahi'}
          </span>
        </div>
      </motion.div>

      {error && (
        <motion.div 
          className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          loading={loading} 
          title="Total Produk" 
          value={dashboardData.total_produk || 0} 
          icon={<Package size={24} />} 
          theme="red"
        />
        <StatCard 
          loading={loading} 
          title="Transaksi Hari Ini" 
          value={dashboardData.transactions_today || 0} 
          icon={<ShoppingCart size={24} />} 
          theme="green"
        />
        <StatCard 
          loading={loading} 
          title="Pendapatan Bulan Ini" 
          value={formatRupiah(dashboardData.revenue_month)} 
          icon={<DollarSign size={24} />} 
          theme="orange"
        />
        <StatCard 
          loading={loading} 
          title="Produk Terlaris" 
          value={dashboardData.top_product || "-"} 
          icon={<TrendingUp size={24} />} 
          theme="amber"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart Panel */}
        <motion.div 
          className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm" 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900">Analisis Finansial</h2>
              <p className="text-sm text-gray-600">
                Performa {chartMode} berdasarkan periode waktu
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex bg-gray-100 rounded-xl p-1.5 shadow-inner">
                <button 
                  onClick={() => handleModeChange('pendapatan')} 
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                    chartMode === 'pendapatan' 
                      ? `bg-white ${theme.primaryText} shadow-sm` 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Pendapatan
                </button>
                <button 
                  onClick={() => handleModeChange('pengeluaran')} 
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                    chartMode === 'pengeluaran' 
                      ? 'bg-white text-red-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Pengeluaran
                </button>
              </div>
              <div className="flex bg-gray-100 rounded-xl p-1.5 shadow-inner">
                {['minggu', 'bulan', 'tahun'].map((filter) => (
                  <button 
                    key={filter}
                    onClick={() => setChartFilter(filter)} 
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all capitalize ${
                      chartFilter === filter 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="h-80">
            {chartLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className={`animate-spin rounded-full h-10 w-10 border-b-2 ${theme.modalBorder}`}></div>
              </div>
            ) : chartError ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-3">
                <BarChart3 size={56} className="text-gray-300" />
                <p className="text-gray-600 font-medium">{chartError}</p>
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-3">
                <BarChart3 size={56} className="text-gray-300" />
                <p className="text-gray-600 font-medium">Tidak ada data tersedia</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {useBarChart ? (
                  <BarChart 
                    data={chartData} 
                    margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12, fill: '#64748b' }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <YAxis 
                      tickFormatter={formatCompact} 
                      tick={{ fontSize: 12, fill: '#64748b' }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip 
                      content={<CustomTooltip />} 
                      cursor={{ fill: 'rgba(0,0,0,0.03)' }} 
                    />
                    <Bar 
                      dataKey="value" 
                      fill={chartMode === 'pendapatan' ? theme.chartRevenue : theme.chartExpense} 
                      barSize={50} 
                      radius={[8, 8, 0, 0]} 
                    />
                  </BarChart>
                ) : (
                  <AreaChart 
                    data={chartData} 
                    margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop 
                          offset="5%" 
                          stopColor={chartMode === 'pendapatan' ? theme.chartRevenue : theme.chartExpense} 
                          stopOpacity={0.4}
                        />
                        <stop 
                          offset="95%" 
                          stopColor={chartMode === 'pendapatan' ? theme.chartRevenue : theme.chartExpense} 
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12, fill: '#64748b' }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <YAxis 
                      tickFormatter={formatCompact} 
                      tick={{ fontSize: 12, fill: '#64748b' }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip 
                      content={<CustomTooltip />} 
                      cursor={{ fill: 'rgba(0,0,0,0.03)' }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={chartMode === 'pendapatan' ? theme.chartRevenue : theme.chartExpense} 
                      strokeWidth={3}
                      fill="url(#chartGradient)" 
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
        
        {/* Performance Metrics Panel */}
        <motion.div 
          className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm" 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900">Performance Metrics</h2>
              <p className="text-sm text-gray-600">Status real-time cabang</p>
            </div>
            <div className={`p-2 rounded-lg bg-gradient-to-r ${theme.quickActionBg}`}>
              <Zap size={20} className={theme.primaryText} />
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Status Operasional Real-time */}
            <div className={`flex items-center justify-between p-3 rounded-xl border ${
              operationalStatus.color === 'green' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  operationalStatus.color === 'green' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <Clock size={18} className={
                    operationalStatus.color === 'green' ? 'text-green-600' : 'text-red-600'
                  } />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${
                    operationalStatus.color === 'green' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    Status Operasional
                  </p>
                  <p className={`text-xs ${
                    operationalStatus.color === 'green' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {operationalStatus.status} • 06:00 - 14:00
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                operationalStatus.color === 'green' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                {operationalStatus.status}
              </span>
            </div>

            {/* Customer Traffic */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50 border border-orange-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <Users size={18} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-orange-800">Customer Traffic</p>
                  <p className="text-xs text-orange-600">Pelanggan hari ini</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-orange-700">
                  {loading ? "-" : (dashboardData.unique_customers_today || dashboardData.unique_customers_count || dashboardData.transactions_today || 0)}
                </span>
                <p className="text-xs text-orange-600">Orang/hari</p>
              </div>
            </div>

            {/* Performance Trend */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-100 mt-0.5">
                  <TrendingUp size={16} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-800">Performance Trend</p>
                  <p className="text-xs text-amber-700 mt-1">
                    {dashboardData.transactions_today > 10 ? 
                      "📈 Performa hari ini lebih baik dari rata-rata" : 
                      "📊 Performa stabil, pertahankan konsistensi"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Bottom Row - Quick Actions */}
      <motion.div 
        className="grid grid-cols-1 gap-6" 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2 }}
      >
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Aksi Cepat</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.button 
                key={index}
                onClick={() => window.location.href = action.path}
                className={`p-4 bg-gradient-to-br ${theme.quickActionBg} rounded-xl transition-all duration-300 group cursor-pointer flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md border border-gray-100`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className={theme.primaryText}>{action.icon}</span>
                <span className={`text-sm font-semibold ${theme.quickActionText}`}>
                  {action.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GeneralPage;