// src/pages/GeneralPage.jsx
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
  Package,
  RefreshCw,
  BarChart3,
  Calendar,
  Users,
  ShoppingCart
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
import TopProductsChart from "../../components/TopProductsChart.jsx";
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
  const [totalProduk, setTotalProduk] = useState(0);
  const [transaksiHariIni, setTransaksiHariIni] = useState(0);
  const [pendapatanBulanIni, setPendapatanBulanIni] = useState(0);
  const [produkTerlaris, setProdukTerlaris] = useState(null);
  const [error, setError] = useState(null);

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

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const cabang = JSON.parse(localStorage.getItem("cabang") || "null");
  const cabangId = cabang?.id_cabang ?? null;

  const [topProducts, setTopProducts] = useState([]);
  const [topProductsLoading, setTopProductsLoading] = useState(true);
  const [topProductsError, setTopProductsError] = useState(null);

  const [dailySummary, setDailySummary] = useState(null);
  const [dailySummaryLoading, setDailySummaryLoading] = useState(true);
  const [dailySummaryError, setDailySummaryError] = useState(null);

  // Fetch top products
  useEffect(() => {
    let cancelled = false;

    const fetchTopProducts = async () => {
      setTopProductsLoading(true);
      setTopProductsError(null);

      try {
        let res;
        if (user?.role === "super admin") {
          res = await axios.get(`${API_URL}/reports/all?filter=bulan`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }

        if (res?.data?.status === "success" && !cancelled) {
          setTopProducts(res.data.data.topProducts || []);
        } else if (!cancelled) {
          setTopProductsError("Gagal memuat produk terlaris.");
        }
      } catch (err) {
        if (!cancelled) setTopProductsError("Terjadi kesalahan saat mengambil data produk terlaris.");
      } finally {
        if (!cancelled) setTopProductsLoading(false);
      }
    };

    if (token) fetchTopProducts();

    return () => {
      cancelled = true;
    };
  }, [token, user?.role, cabangId]);

  // Fetch summary cards
  useEffect(() => {
    let cancelled = false;

    const fetchStatsForCabang = async (id) => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API_URL}/dashboard/cabang/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res?.data?.status === "success" && !cancelled) {
          const d = res.data.data;
          setTotalProduk(d.total_produk ?? 0);
          setTransaksiHariIni(d.transactions_today ?? 0);
          setPendapatanBulanIni(Number(d.revenue_month ?? 0));
          setProdukTerlaris(d.top_product ?? null);
        } else if (!cancelled) {
          setError("Response format unexpected");
        }
      } catch (err) {
        console.error("fetchStatsForCabang error", err);
        if (!cancelled) setError("Gagal mengambil data dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const fetchGlobalStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API_URL}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res?.data?.status === "success" && !cancelled) {
          const d = res.data.data;
          setTotalProduk(d.total_produk ?? 0);
          setTransaksiHariIni(d.transactions_today ?? 0);
          setPendapatanBulanIni(Number(d.revenue_month ?? 0));
          setProdukTerlaris(d.top_product ?? null);
        } else if (!cancelled) {
          setError("Response format unexpected");
        }
      } catch (err) {
        console.error("fetchGlobalStats error", err);
        if (!cancelled) setError("Gagal mengambil data dashboard global");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (!token) {
      setError("Belum login (token tidak ditemukan)");
      setLoading(false);
      return;
    }

    if (user?.role === "admin cabang") {
      if (!cabangId) {
        setError("Data cabang tidak ditemukan. Login ulang atau cek localStorage.");
        setLoading(false);
        return;
      }
      fetchStatsForCabang(cabangId);
    } else {
      fetchGlobalStats();
    }

    return () => {
      cancelled = true;
    };
  }, [token, cabangId, user?.role]);

  // Fetch chart data
  useEffect(() => {
    let cancelled = false;

    const fetchChartData = async () => {
      setChartLoading(true);
      setChartError(null);

      try {
        let res;
        if (user?.role === "super admin") {
          res = await axios.get(
            `${API_URL}/dashboard/chart?filter=${chartFilter}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else if (user?.role === "admin cabang" && cabangId) {
          res = await axios.get(
            `${API_URL}/dashboard/cabang/${cabangId}/chart?filter=${chartFilter}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }

        if (res?.data?.status === "success" && !cancelled) {
          const rawData = res.data.data[chartMode] || [];
          const processedData = processChartData(rawData, chartFilter);
          setChartData(processedData);
        } else if (!cancelled) {
          setChartError("Gagal memuat data chart.");
        }
      } catch (err) {
        console.error("fetchChartData error", err);
        if (!cancelled) setChartError("Terjadi kesalahan saat mengambil data chart.");
      } finally {
        if (!cancelled) setChartLoading(false);
      }
    };

    fetchChartData();

    return () => {
      cancelled = true;
    };
  }, [token, chartMode, chartFilter, user?.role, cabangId]);

  // Fetch daily summary
  useEffect(() => {
    let cancelled = false;
    const today = new Date().toISOString().split("T")[0];

    const fetchDailySummary = async () => {
      setDailySummaryLoading(true);
      setDailySummaryError(null);

      try {
        const res = await axios.get(`${API_URL}/report/harian`, {
          params: { tanggal: today },
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

    if (token) fetchDailySummary();

    return () => { cancelled = true; };
  }, [token]);

  // Fetch recent activities
  useEffect(() => {
    let cancelled = false;

    const fetchRecentActivities = async () => {
      try {
        setActivitiesLoading(true);
        const endpoint = user?.role === 'super admin' 
          ? `${API_URL}/dashboard/activities` 
          : `${API_URL}/dashboard/user/activities`;
        
        const response = await axios.get(endpoint, {
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
  }, [token, user?.role]);

  // Fetch month comparison
  useEffect(() => {
    let cancelled = false;

    const fetchMonthComparison = async () => {
      setMonthComparisonLoading(true);

      try {
        const res = await axios.get(`${API_URL}/dashboard/month-comparison`, {
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

    if (token) fetchMonthComparison();

    return () => { cancelled = true; };
  }, [token]);

  // Fetch declining products
  useEffect(() => {
    let cancelled = false;

    const fetchDecliningProducts = async () => {
      setDecliningLoading(true);

      try {
        const res = await axios.get(`${API_URL}/dashboard/declining-products`, {
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

    if (token) fetchDecliningProducts();

    return () => { cancelled = true; };
  }, [token]);

  // Fetch low stock products
  useEffect(() => {
    let cancelled = false;

    const fetchLowStockProducts = async () => {
      setLowStockLoading(true);

      try {
        const res = await axios.get(`${API_URL}/dashboard/low-stock`, {
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

    if (token) fetchLowStockProducts();

    return () => { cancelled = true; };
  }, [token]);

  const handleModeChange = (newMode) => {
    setChartMode(newMode);
    if (newMode === 'pengeluaran' && chartFilter === 'minggu') {
       setChartFilter('tahun');
    }
  };

  const handleRefresh = () => {
    // Trigger all data refetches
    window.location.reload(); // Simple refresh for demo, you can implement individual refetches
  };

  const getActivityIcon = (type, model) => {
    switch (type) {
      case 'add':
        return '🟢';
      case 'update':
        return '🔵';
      case 'delete':
        return '🔴';
      case 'expense':
        return '💰';
      default:
        return '⚪';
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
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Ringkasan bisnis dan aktivitas terkini</p>
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
            title: "Total Produk",
            value: totalProduk,
            icon: <Drumstick size={24} />,
            color: "text-gray-700",
            bg: "bg-gray-100",
          },
          {
            title: "Transaksi Hari Ini",
            value: transaksiHariIni,
            icon: <ArrowRightLeft size={24} />,
            color: "text-gray-700",
            bg: "bg-gray-100",
          },
          {
            title: "Pendapatan Bulan Ini",
            value: formatRupiah(pendapatanBulanIni),
            icon: <Wallet size={24} />,
            color: "text-gray-700",
            bg: "bg-gray-100",
          },
          {
            title: "Produk Terlaris",
            value: produkTerlaris ?? "—",
            icon: <Briefcase size={24} />,
            color: "text-gray-700",
            bg: "bg-gray-100",
          },
        ].map((item, index) => (
          <motion.div 
            key={index}
            className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all"
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
                  className={`font-bold text-gray-800 mt-1 ${
                      String(item.value).length > 15 ? "text-lg" : "text-2xl"
                    }`}
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
        className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
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
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
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

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
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

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
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

      {/* Charts and Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Chart */}
        <motion.div 
          className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 p-6"
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

        {/* Top Products */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {topProductsLoading ? (
            <div className="flex justify-center items-center h-full bg-white rounded-2xl shadow-md border border-gray-100 text-gray-500">
              Memuat data...
            </div>
          ) : topProductsError ? (
            <div className="flex justify-center items-center h-full bg-white rounded-2xl shadow-md border border-gray-100 text-red-500">
              {topProductsError}
            </div>
          ) : topProducts.length === 0 ? (
            <div className="flex justify-center items-center h-full bg-white rounded-2xl shadow-md border border-gray-100 text-gray-400">
              Tidak ada data produk terlaris.
            </div>
          ) : (
            <TopProductsChart data={topProducts} filter="bulan" />
          )}
        </motion.div>
      </div>

      {/* Alerts and Warnings Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Declining Products */}
        <motion.div 
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
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
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
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
                  {product.nama_cabang && (
                    <p className="text-sm text-gray-600 mb-2">
                      📍 {product.nama_cabang}
                    </p>
                  )}
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
        className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="text-blue-600" />
          Ringkasan Laporan Harian
        </h2>

        {dailySummaryLoading ? (
          <div className="text-gray-500">Memuat ringkasan harian...</div>
        ) : dailySummaryError ? (
          <div className="text-red-500">{dailySummaryError}</div>
        ) : dailySummary ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Total Penjualan</p>
              <p className="text-xl font-semibold text-gray-800">
                {formatRupiah(dailySummary.total_penjualan || 0)}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Modal Bahan Baku</p>
              <p className="text-xl font-semibold text-gray-800">
                {formatRupiah(dailySummary.modal_bahan_baku || 0)}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Pengeluaran Harian</p>
              <p className="text-xl font-semibold text-gray-800">
                {formatRupiah(dailySummary.pengeluaran_harian || 0)}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Laba Harian</p>
              <p className={`text-xl font-semibold ${
                (dailySummary.laba_harian || 0) >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                {formatRupiah(dailySummary.laba_harian || 0)}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Nett Income</p>
              <p className={`text-xl font-semibold ${
                (dailySummary.nett_income || 0) >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                {formatRupiah(dailySummary.nett_income || 0)}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">Tidak ada data hari ini.</div>
        )}
      </motion.div>

      {/* Recent Activities */}
      <motion.div 
        className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="text-gray-700" />
          Aktivitas Terbaru
        </h2>
        {activitiesLoading ? (
          <div className="flex justify-center items-center h-64 text-gray-500">
            Memuat aktivitas...
          </div>
        ) : activitiesError ? (
          <div className="flex justify-center items-center h-64 text-red-500">
            {activitiesError}
          </div>
        ) : recentActivities.length === 0 ? (
          <div className="flex justify-center items-center h-64 text-gray-500">
            Tidak ada aktivitas terbaru.
          </div>
        ) : (
          <ul className="space-y-3 max-h-96 overflow-y-auto">
            {recentActivities.map((activity, index) => (
              <li
                key={`${activity.timestamp}-${index}`}
                className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all border border-gray-200"
              >
                <span className="text-2xl flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type, activity.model)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 break-words">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(parseISO(activity.timestamp), 'dd MMM yyyy, HH:mm', { locale: id })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
};

export default GeneralPage;