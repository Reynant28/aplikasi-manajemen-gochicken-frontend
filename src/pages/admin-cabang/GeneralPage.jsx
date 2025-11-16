// src/pages/GeneralPage.jsx (Admin Cabang Version)
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Drumstick, 
  ArrowRightLeft, 
  Wallet, 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Plus,
  Trash,
  Pencil,
  BarChart3,
  Calendar,
  Users,
  ShoppingCart,
  History, 
  Filter, 
  RefreshCw, 
  Activity, 
  Clock, 
  FileText,
  Building2,
  CreditCard,
  QrCode
} from "lucide-react";
import axios from "axios";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
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

const processChartData = (rawData = [], filter) => {
  if (!rawData || rawData.length === 0) return [];

  if (filter === "minggu") {
    const days = [
      { name: "Min", value: 0 }, { name: "Sen", value: 0 },
      { name: "Sel", value: 0 }, { name: "Rab", value: 0 },
      { name: "Kam", value: 0 }, { name: "Jum", value: 0 },
      { name: "Sab", value: 0 },
    ];
    rawData.forEach(item => {
      const dayIndex = getDay(parseISO(item.tanggal));
      days[dayIndex].value += parseFloat(item.total);
    });
    return days;
  }
  
  if (filter === "bulan") {
    const weeks = [
      { name: "Minggu 1", value: 0 }, { name: "Minggu 2", value: 0 },
      { name: "Minggu 3", value: 0 }, { name: "Minggu 4", value: 0 },
      { name: "Minggu 5", value: 0 },
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
      value: 0,
    }));
    rawData.forEach(item => {
      const monthIndex = getMonth(parseISO(item.tanggal));
      months[monthIndex].value += parseFloat(item.total);
    });
    return months;
  }

  return [];
};

const GeneralPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({});

  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState(null);
  const [chartMode, setChartMode] = useState("pendapatan");
  const [chartFilter, setChartFilter] = useState("tahun");

  const [recentActivities, setRecentActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState(null);

  const [monthComparison, setMonthComparison] = useState(null);
  const [monthComparisonLoading, setMonthComparisonLoading] = useState(true);

  const [decliningProducts, setDecliningProducts] = useState([]);
  const [decliningLoading, setDecliningLoading] = useState(true);

  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [lowStockLoading, setLowStockLoading] = useState(true);

  const [dailySummary, setDailySummary] = useState(null);
  const [dailySummaryLoading, setDailySummaryLoading] = useState(true);
  const [dailySummaryError, setDailySummaryError] = useState(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const cabang = JSON.parse(localStorage.getItem("cabang") || "null");
  const cabangId = cabang?.id_cabang ?? null;

  // Helper to get payment method icons
  const getPaymentIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'tunai': return <Wallet size={16} className="text-gray-500"/>;
      case 'qris': return <QrCode size={16} className="text-gray-500"/>;
      case 'debit': return <CreditCard size={16} className="text-gray-500"/>;
      default: return <Wallet size={16} className="text-gray-500"/>;
    }
  };

  // Fetch dashboard data for cabang
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
          setDashboardData(res.data.data);
        } else if (!cancelled) {
          setError("Format response tidak sesuai");
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

  // Fetch chart data
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
          const rawData = res.data.data[chartMode] || [];
          const processedData = processChartData(rawData, chartFilter);
          setChartData(processedData);
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

  // Fetch daily summary
  useEffect(() => {
    let cancelled = false;
    const today = new Date().toISOString().split("T")[0];

    const fetchDailySummary = async () => {
      setDailySummaryLoading(true);
      setDailySummaryError(null);

      try {
        const res = await axios.get(`${API_URL}/report/harian`, {
          params: { tanggal: today, cabang_id: cabangId },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res?.data && !cancelled) {
          setDailySummary(res.data);
        } else if (!cancelled) {
          setDailySummaryError("Tidak ada data laporan harian.");
        }
      } catch (err) {
        console.error("fetchDailySummary error:", err);
        if (!cancelled) setDailySummaryError("Gagal memuat laporan harian.");
      } finally {
        if (!cancelled) setDailySummaryLoading(false);
      }
    };

    if (token && cabangId) fetchDailySummary();

    return () => { cancelled = true; };
  }, [token, cabangId]);

  // Fetch recent activities
  useEffect(() => {
    let cancelled = false;

    const fetchRecentActivities = async () => {
      try {
        setActivitiesLoading(true);
        const response = await axios.get(`${API_URL}/dashboard/user/activities`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.status === 'success') {
          setRecentActivities(response.data.data);
        } else {
          setActivitiesError('Gagal memuat aktivitas');
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
        setActivitiesError('Terjadi kesalahan saat memuat aktivitas');
      } finally {
        setActivitiesLoading(false);
      }
    };

    if (token) {
      fetchRecentActivities();
    } else {
      setActivitiesLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [token]);

  // Fetch month comparison for cabang
  useEffect(() => {
    let cancelled = false;

    const fetchMonthComparison = async () => {
      setMonthComparisonLoading(true);

      try {
        const res = await axios.get(`${API_URL}/dashboard/cabang/${cabangId}/month-comparison`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res?.data?.status === "success" && !cancelled) {
          setMonthComparison(res.data.data);
        }
      } catch (err) {
        console.error("fetchMonthComparison error", err);
      } finally {
        if (!cancelled) setMonthComparisonLoading(false);
      }
    };

    if (token && cabangId) fetchMonthComparison();

    return () => { cancelled = true; };
  }, [token, cabangId]);

  // Fetch declining products for cabang
  useEffect(() => {
    let cancelled = false;

    const fetchDecliningProducts = async () => {
      setDecliningLoading(true);

      try {
        const res = await axios.get(`${API_URL}/dashboard/cabang/${cabangId}/declining-products`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res?.data?.status === "success" && !cancelled) {
          setDecliningProducts(res.data.data);
        }
      } catch (err) {
        console.error("fetchDecliningProducts error", err);
      } finally {
        if (!cancelled) setDecliningLoading(false);
      }
    };

    if (token && cabangId) fetchDecliningProducts();

    return () => { cancelled = true; };
  }, [token, cabangId]);

  // Fetch low stock products for cabang
  useEffect(() => {
    let cancelled = false;

    const fetchLowStockProducts = async () => {
      setLowStockLoading(true);

      try {
        const res = await axios.get(`${API_URL}/dashboard/cabang/${cabangId}/low-stock`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res?.data?.status === "success" && !cancelled) {
          setLowStockProducts(res.data.data);
        }
      } catch (err) {
        console.error("fetchLowStockProducts error", err);
      } finally {
        if (!cancelled) setLowStockLoading(false);
      }
    };

    if (token && cabangId) fetchLowStockProducts();

    return () => { cancelled = true; };
  }, [token, cabangId]);

  const handleModeChange = (newMode) => {
    setChartMode(newMode);
    if (newMode === 'pengeluaran' && chartFilter === 'minggu') {
      setChartFilter('tahun');
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const getActivityIcon = (activity) => {
    const type = activity.type || activity.action || activity.activity_type || '';
    
    switch (type.toLowerCase()) {
      case 'created':
        return { emoji: <Plus />, color: 'bg-green-50 text-green-800' };
      case 'updated':
        return { emoji: <Pencil />, color: 'bg-blue-50 text-blue-800' };
      case 'deleted':
        return { emoji: <Trash />, color: 'bg-red-50 text-rose-700' };
      case 'expense':
        return { emoji: '💰', color: 'bg-orange-100 text-orange-600' };
      default:
        return { emoji: '⚪', color: 'bg-gray-100 text-gray-600' };
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Cabang</h1>
          <p className="text-gray-500 mt-1">
            Ringkasan performa {cabang?.nama_cabang || "cabang"} dan aktivitas terkini
          </p>
        </motion.div>
        
        <motion.div 
          className="flex gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 text-white bg-gray-700 rounded-lg hover:bg-gray-800 transition-all font-medium shadow-sm disabled:bg-gray-400"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </motion.div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">{error}</div>
      )}

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Produk Tersedia",
            value: `${dashboardData.produk_tersedia ?? 0} / ${dashboardData.total_produk ?? 0}`,
            icon: <Drumstick size={24} />,
            color: "text-green-600",
            bg: "bg-green-100",
          },
          {
            title: "Transaksi Hari Ini",
            value: dashboardData.transactions_today ?? 0,
            icon: <ArrowRightLeft size={24} />,
            color: "text-blue-600",
            bg: "bg-blue-100",
          },
          {
            title: "Pendapatan Bulan Ini",
            value: formatRupiah(dashboardData.revenue_month),
            icon: <Wallet size={24} />,
            color: "text-purple-600",
            bg: "bg-purple-100",
          },
          {
            title: "Produk Terlaris",
            value: dashboardData.top_product ?? "—",
            icon: <Briefcase size={24} />,
            color: "text-amber-600",
            bg: "bg-amber-100",
          },
        ].map((item, index) => (
          <motion.div 
            key={index}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{item.title}</p>
                {loading ? (
                  <p className="text-2xl font-bold text-gray-800 mt-1 animate-pulse">...</p>
                ) : (
                  <p
                    className={`font-bold mt-1 ${
                      String(item.value).length > 15 ? "text-lg" : "text-2xl"
                    } ${item.color.replace('text-', 'text-')}`}
                    style={{ wordBreak: "break-word" }}
                  >
                    {item.value}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-xl ${item.bg}`}>
                <div className={item.color}>{item.icon}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Month Comparison */}
      <motion.div 
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md border border-gray-100 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="text-blue-600" />
          Perbandingan Bulan Ini vs Bulan Lalu
        </h2>

        {monthComparisonLoading ? (
          <div className="text-gray-500">Memuat data perbandingan...</div>
        ) : monthComparison ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all">
              <p className="text-sm text-gray-600 mb-1">Pendapatan</p>
              <p className="text-2xl font-bold text-gray-800 mb-2">
                {formatRupiah(monthComparison.current_revenue)}
              </p>
              <div className={`flex items-center gap-1 text-sm ${monthComparison.revenue_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {monthComparison.revenue_change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="font-semibold">{Math.abs(monthComparison.revenue_change).toFixed(1)}%</span>
                <span className="text-gray-500">vs bulan lalu</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all">
              <p className="text-sm text-gray-600 mb-1">Transaksi</p>
              <p className="text-2xl font-bold text-gray-800 mb-2">
                {monthComparison.current_transactions}
              </p>
              <div className={`flex items-center gap-1 text-sm ${monthComparison.transaction_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {monthComparison.transaction_change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="font-semibold">{Math.abs(monthComparison.transaction_change).toFixed(1)}%</span>
                <span className="text-gray-500">vs bulan lalu</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all">
              <p className="text-sm text-gray-600 mb-1">Rata-rata per Transaksi</p>
              <p className="text-2xl font-bold text-gray-800 mb-2">
                {formatRupiah(monthComparison.avg_transaction)}
              </p>
              <div className={`flex items-center gap-1 text-sm ${monthComparison.avg_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {monthComparison.avg_change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="font-semibold">{Math.abs(monthComparison.avg_change).toFixed(1)}%</span>
                <span className="text-gray-500">vs bulan lalu</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">Data perbandingan tidak tersedia</div>
        )}
      </motion.div>

      {/* Charts and Financial Summary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Chart */}
        <motion.div 
          className="lg:col-span-2 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md border border-gray-100 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 capitalize flex items-center gap-2">
                <BarChart3 className="text-gray-700" size={24} />
                {chartMode}
              </h2>
              
              <div className="flex bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => handleModeChange("pendapatan")}
                  className={`px-4 py-2 text-sm font-semibold transition-all ${
                    chartMode === "pendapatan"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <TrendingUp className="inline-block h-4 w-4 mr-1" /> 
                  Pendapatan
                </button>
                <button
                  onClick={() => handleModeChange("pengeluaran")}
                  className={`px-4 py-2 text-sm font-semibold transition-all ${
                    chartMode === "pengeluaran"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <TrendingDown className="inline-block h-4 w-4 mr-1" /> 
                  Pengeluaran
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Grafik finansial berdasarkan periode waktu</p>
              
              <div className="flex bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                {["minggu", "bulan", "tahun"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setChartFilter(f)}
                    className={`px-4 py-1.5 text-xs font-semibold capitalize transition-all ${
                      chartFilter === f
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full h-[400px]">
            {chartLoading ? (
              <div className="flex justify-center items-center h-full text-gray-500">Memuat data grafik...</div>
            ) : chartError ? (
              <div className="flex justify-center items-center h-full text-red-500">{chartError}</div>
            ) : chartData.length === 0 ? (
              <div className="flex justify-center items-center h-full text-gray-400">Tidak ada data untuk ditampilkan.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickLine={false}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <YAxis
                    tickFormatter={(value) =>
                      new Intl.NumberFormat("id-ID", { notation: "compact" }).format(value)
                    }
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickLine={false}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      borderRadius: "0.75rem",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value) => formatRupiah(value)}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={chartMode === "pendapatan" ? "Pendapatan" : "Pengeluaran"}
                    stroke={chartMode === "pendapatan" ? "#10b981" : "#ef4444"}
                    strokeWidth={3}
                    dot={{ r: 4, fill: chartMode === "pendapatan" ? "#10b981" : "#ef4444" }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff", fill: chartMode === "pendapatan" ? "#10b981" : "#ef4444" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Financial Summary */}
        <motion.div
          className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Wallet className="text-gray-700" />
            Ringkasan Keuangan Hari Ini
          </h2>

          {loading ? (
            <div className="space-y-4 flex-grow">
              <div className="h-6 bg-gray-200 rounded-md w-3/4 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded-md w-2/3 animate-pulse"></div>
              <div className="h-px bg-gray-200 my-4"></div>
              <div className="h-8 bg-gray-200 rounded-md w-1/2 ml-auto animate-pulse"></div>
            </div>
          ) : (
            <div className="flex flex-col flex-grow">
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Total Pendapatan</p>
                  <p className="font-bold text-green-600 text-lg">
                    {formatRupiah(dashboardData.pendapatan_hari_ini)}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Total Pengeluaran</p>
                  <p className="font-bold text-red-600 text-lg">
                    {formatRupiah(dashboardData.pengeluaran_hari_ini)}
                  </p>
                </div>
              </div>
              
              <hr className="my-4 border-gray-200"/>
              
              <div className="flex justify-between items-center mb-6">
                <p className="font-bold text-gray-700 text-lg">Estimasi Laba</p>
                <p className={`font-bold text-2xl ${dashboardData.estimasi_laba >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                  {formatRupiah(dashboardData.estimasi_laba)}
                </p>
              </div>
              
              {/* Revenue Breakdown Section */}
              <div className="mt-auto">
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Rincian Pendapatan:</h3>
                {(dashboardData.revenue_breakdown && dashboardData.revenue_breakdown.length > 0) ? (
                  <div className="space-y-2">
                    {dashboardData.revenue_breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                        <p className="flex items-center gap-2 text-gray-600">
                          {getPaymentIcon(item.metode_pembayaran)} 
                          {item.metode_pembayaran}
                        </p>
                        <p className="font-medium text-gray-700">{formatRupiah(item.total)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-lg">
                    Belum ada pendapatan hari ini.
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Alerts and Warnings Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Declining Products */}
        <motion.div 
          className="bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all rounded-2xl shadow-md border border-gray-100 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingDown className="text-orange-600" />
            Produk yang Menurun Penjualannya
          </h2>

          {decliningLoading ? (
            <div className="text-gray-500">Memuat data produk menurun...</div>
          ) : decliningProducts.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              Tidak ada produk dengan penurunan penjualan signifikan
            </div>
          ) : (
            <div className="space-y-3">
              {decliningProducts.map((product, index) => (
                <div
                  key={index}
                  className="p-4 bg-orange-50 rounded-xl border border-orange-100 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{product.nama_produk}</h3>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Bulan Ini</p>
                      <p className="font-bold text-orange-600">{product.current_sales} terjual</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Bulan Lalu</p>
                      <p className="font-bold text-gray-600">{product.previous_sales} terjual</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-red-600">
                    <TrendingDown size={16} />
                    <span className="font-semibold">{Math.abs(product.decline_percentage).toFixed(1)}% penurunan</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Low Stock Alert */}
        <motion.div 
          className="bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all rounded-2xl shadow-md border border-gray-100 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-600" />
            Stok Bahan Hampir Habis
          </h2>

          {lowStockLoading ? (
            <div className="text-gray-500">Memuat data stok rendah...</div>
          ) : lowStockProducts.length === 0 ? (
            <div className="text-gray-700 text-center py-8 flex flex-col items-center gap-2">
              <p className="font-semibold">Semua stok aman! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((product, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                    product.jumlah_stok === 0
                      ? "bg-red-50 border-red-200"
                      : product.jumlah_stok <= 2
                      ? "bg-orange-50 border-orange-200"
                      : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{product.nama_produk}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        product.jumlah_stok === 0
                          ? "bg-red-100 text-red-700"
                          : product.jumlah_stok <= 2
                          ? "bg-orange-100 text-orange-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      Stok: {product.jumlah_stok}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      size={16}
                      className={
                        product.jumlah_stok === 0
                          ? "text-red-600"
                          : product.jumlah_stok <= 2
                          ? "text-orange-600"
                          : "text-yellow-600"
                      }
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {product.jumlah_stok === 0
                        ? "Habis! Segera restock"
                        : "Perlu restock segera"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Daily Summary */}
      <motion.div 
        className="bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all rounded-2xl shadow-lg border border-gray-100 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-50 rounded-xl">
              <Calendar className="text-gray-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Laporan Harian</h2>
              <p className="text-gray-600 mt-1">Ringkasan performa cabang hari ini</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Tanggal</p>
            <p className="text-lg font-semibold text-gray-800">
              {format(new Date(), 'dd MMMM yyyy', { locale: id })}
            </p>
          </div>
        </div>

        {dailySummaryLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
              Memuat data harian...
            </div>
          </div>
        ) : dailySummaryError ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-3 bg-red-100 rounded-full mb-3">
              <AlertTriangle className="text-red-500" size={24} />
            </div>
            <p className="text-red-600 font-medium mb-2">Gagal memuat data</p>
            <p className="text-gray-500 text-sm">{dailySummaryError}</p>
          </div>
        ) : dailySummary ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Revenue Card */}
            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <TrendingUp className="text-green-600" size={20} />
                </div>
                <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold">
                  PENDAPATAN
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-2">Total Penjualan</p>
              <p className="text-2xl font-bold text-gray-800 mb-4">
                {formatRupiah(dailySummary.total_penjualan || 0)}
              </p>
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">Modal Bahan Baku</p>
                <p className="text-lg font-semibold text-gray-700">
                  {formatRupiah(dailySummary.modal_bahan_baku || 0)}
                </p>
              </div>
            </div>

            {/* Expenses Card */}
            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <TrendingDown className="text-red-600" size={20} />
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                  PENGELUARAN
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-2">Pengeluaran Harian</p>
              <p className="text-2xl font-bold text-gray-800 mb-4">
                {formatRupiah(dailySummary.pengeluaran_harian || 0)}
              </p>
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">Termasuk operasional</p>
                <p className="text-sm text-gray-600">Semua jenis pengeluaran</p>
              </div>
            </div>

            {/* Profit Card */}
            <div className={`rounded-xl p-5 shadow-md border hover:shadow-lg transition-all ${
              (dailySummary.laba_harian || 0) >= 0 
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100' 
                : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-100'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${
                  (dailySummary.laba_harian || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {(dailySummary.laba_harian || 0) >= 0 ? (
                    <TrendingUp className="text-green-500" size={20} />
                  ) : (
                    <TrendingDown className="text-red-500" size={20} />
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  (dailySummary.laba_harian || 0) >= 0 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {(dailySummary.laba_harian || 0) >= 0 ? 'UNTUNG' : 'RUGI'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-2">Laba Harian</p>
              <p className={`text-3xl font-bold mb-2 ${
                (dailySummary.laba_harian || 0) >= 0 ? 'text-green-600' : 'text-red-500'
              }`}>
                {formatRupiah(dailySummary.laba_harian || 0)}
              </p>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">Net Income</p>
                <p className={`text-lg font-semibold ${
                  (dailySummary.nett_income || 0) >= 0 ? 'text-green-600' : 'text-red-500'
                }`}>
                  {formatRupiah(dailySummary.nett_income || 0)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <Calendar className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 font-medium mb-2">Belum ada data hari ini</p>
            <p className="text-gray-400 text-sm">Data laporan akan muncul setelah ada transaksi</p>
          </div>
        )}
      </motion.div>

      {/* Recent Activities */}
      <motion.div 
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md border border-gray-100 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <History className="text-gray-700" />
              Aktivitas Terbaru
            </h2>
            <p className="text-gray-500 mt-1">Riwayat aktivitas dan perubahan data sistem</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={activitiesLoading}
              className="flex items-center gap-2 px-4 py-2.5 text-white bg-gray-700 rounded-lg hover:bg-gray-800 transition-all font-medium shadow-sm disabled:bg-gray-400"
            >
              <RefreshCw size={18} className={activitiesLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Aktivitas</p>
                <p className="text-xl font-bold text-gray-800 mt-1">{recentActivities.length}</p>
              </div>
              <div className="p-2 bg-white rounded-lg">
                <FileText className="text-gray-700" size={20} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hari Ini</p>
                <p className="text-xl font-bold text-gray-800 mt-1">
                  {recentActivities.filter(activity => {
                    const today = new Date().toDateString();
                    const activityDate = new Date(activity.timestamp).toDateString();
                    return today === activityDate;
                  }).length}
                </p>
              </div>
              <div className="p-2 bg-white rounded-lg">
                <Clock className="text-gray-700" size={20} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktivitas</p>
                <p className="text-xl font-bold text-gray-800 mt-1">
                  {new Set(recentActivities.map(activity => activity.type)).size} jenis
                </p>
              </div>
              <div className="p-2 bg-white rounded-lg">
                <Activity className="text-gray-700" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Activities List */}
        {activitiesLoading ? (
          <div className="flex justify-center items-center h-32 text-gray-500">
            Memuat aktivitas...
          </div>
        ) : activitiesError ? (
          <div className="flex justify-center items-center h-32 text-red-500">
            {activitiesError}
          </div>
        ) : recentActivities.length === 0 ? (
          <div className="flex justify-center items-center h-32 text-gray-500">
            Tidak ada aktivitas terbaru.
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {recentActivities.map((activity, index) => (
              <div
                key={`${activity.timestamp}-${index}`}
                className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all border border-gray-200"
              >
                {(() => {
                  const { emoji, color } = getActivityIcon(activity);
                  return (
                    <div className={`p-2 rounded-lg ${color}`}>
                      {emoji}
                    </div>
                  );
                })()}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 break-words">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {format(parseISO(activity.timestamp), 'dd MMM yyyy, HH:mm', { locale: id })}
                    </span>
                    {activity.user && (
                      <span>Oleh: {activity.user}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default GeneralPage;