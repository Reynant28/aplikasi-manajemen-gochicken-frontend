// src/pages/GeneralPage.jsx
//eslint-disable-next-line no-unused-vars
import React, { useEffect, useState, useCallback } from "react";
//eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Users, Building2, Wallet, Briefcase, TrendingUp, TrendingDown } from "lucide-react";
import axios from "axios";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend, // Import Legend for multi-line charts if needed
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

// --- ✨ NEW HELPER FUNCTION TO PROCESS CHART DATA ---
const processChartData = (rawData = [], filter) => {
  if (!rawData || rawData.length === 0) return [];

  // For weekly filter: format daily data
  if (filter === "minggu") {
    const days = [
      { name: "Min", value: 0 }, { name: "Sen", value: 0 },
      { name: "Sel", value: 0 }, { name: "Rab", value: 0 },
      { name: "Kam", value: 0 }, { name: "Jum", value: 0 },
      { name: "Sab", value: 0 },
    ];
    rawData.forEach(item => {
      const dayIndex = getDay(parseISO(item.tanggal)); // 0 for Sunday, 1 for Monday...
      days[dayIndex].value += parseFloat(item.total);
    });
    return days;
  }
  
  // For monthly filter: aggregate into weeks
  if (filter === "bulan") {
    const weeks = [
      { name: "Minggu 1", value: 0 }, { name: "Minggu 2", value: 0 },
      { name: "Minggu 3", value: 0 }, { name: "Minggu 4", value: 0 },
      { name: "Minggu 5", value: 0 },
    ];
    rawData.forEach(item => {
      const date = parseISO(item.tanggal);
      const weekOfMonth = getWeekOfMonth(date) - 1; // getWeekOfMonth is 1-based
      if (weeks[weekOfMonth]) {
        weeks[weekOfMonth].value += parseFloat(item.total);
      }
    });
    return weeks.filter(w => w.value > 0); // Only show weeks with data
  }

  // For yearly filter: aggregate into months
  if (filter === "tahun") {
     const months = Array.from({ length: 12 }, (_, i) => ({
      name: format(new Date(0, i), "MMM", { locale: id }), // Jan, Feb, Mar...
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
  // State for summary cards
  const [loading, setLoading] = useState(true);
  const [totalProduk, setTotalProduk] = useState(0);
  const [transaksiHariIni, setTransaksiHariIni] = useState(0);
  const [pendapatanBulanIni, setPendapatanBulanIni] = useState(0);
  const [produkTerlaris, setProdukTerlaris] = useState(null);
  const [error, setError] = useState(null);

  // --- ✨ NEW STATE FOR THE CHART ---
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState(null);
  const [chartMode, setChartMode] = useState("pendapatan"); // 'pendapatan' or 'pengeluaran'
  const [chartFilter, setChartFilter] = useState("tahun"); // 'minggu', 'bulan', 'tahun'

  // --- ✨ NEW STATE FOR RECENT ACTIVITIES ✨ ---
  const [recentActivities, setRecentActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState(null);


  // Ambil token + info cabang dari localStorage
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const cabang = JSON.parse(localStorage.getItem("cabang") || "null");
  const cabangId = cabang?.id_cabang ?? null;

  // --- useEffect for Summary Cards (No changes here) ---
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


  // --- ✨ NEW useEffect FOR DYNAMIC CHART DATA ---
  useEffect(() => {
    let cancelled = false;

    const fetchChartData = async () => {
    setChartLoading(true);
    setChartError(null);

      try {
        let res;
        if (user?.role === "super admin") {
          // untuk super admin (semua cabang)
          res = await axios.get(
            `${API_URL}/dashboard/chart?filter=${chartFilter}`,
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
  }, [token, chartMode, chartFilter]);

  // --- ✨ NEW useEffect TO FETCH RECENT ACTIVITIES ✨ ---
  // --- useEffect TO FETCH RECENT ACTIVITIES ---
  useEffect(() => {
    let cancelled = false;

    const fetchRecentActivities = async () => {
      setActivitiesLoading(true);
      setActivitiesError(null);

      try {
        let res;
        if (user?.role === "super admin") {
          res = await axios.get(`${API_URL}/dashboard/activities`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }

        if (res?.data?.status === "success" && !cancelled) {
          setRecentActivities(res.data.data);
        } else if (!cancelled) {
          setActivitiesError("Gagal memuat aktivitas.");
        }
      } catch (err) {
        console.error("fetchRecentActivities error", err);
        if (!cancelled) setActivitiesError("Terjadi kesalahan saat mengambil data aktivitas.");
      } finally {
        if (!cancelled) setActivitiesLoading(false);
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

  
  const handleModeChange = (newMode) => {
    setChartMode(newMode);
    // Reset filter to 'tahun' as default when mode changes
    // And ensure 'minggu' isn't selected for 'pengeluaran'
    if (newMode === 'pengeluaran' && chartFilter === 'minggu') {
       setChartFilter('tahun');
    }
  };


  return (
    <div className="p-6 space-y-6">
      <motion.h1
        className="text-3xl font-bold text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Dashboard Overview
      </motion.h1>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md">{error}</div>
      )}

      {/* --- Summary Cards Grid (No Changes) --- */}
      {/* --- ✨ REDESIGNED SUMMARY CARDS GRID ✨ --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Produk Tersedia */}
          <motion.div
              className="bg-white rounded-xl shadow-lg p-6 flex items-start gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
          >
              <div className="p-3 rounded-full bg-green-100">
                  <Users size={24} className="text-green-600" />
              </div>
              <div className="flex flex-col">
                  <h2 className="text-sm font-medium text-gray-500">Total Produk</h2>
                  {loading ? (
                      <p className="text-2xl font-bold text-gray-800 animate-pulse">...</p>
                  ) : (
                      <p className="text-2xl font-bold text-green-600">
                          {totalProduk}
                      </p>
                  )}
              </div>
          </motion.div>

          {/* Transaksi Hari Ini */}
          <motion.div
              className="bg-white rounded-xl shadow-lg p-6 flex items-start gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
          >
              <div className="p-3 rounded-full bg-blue-100">
                  <Building2 size={24} className="text-blue-600" />
              </div>
              <div className="flex flex-col">
                  <h2 className="text-sm font-medium text-gray-500">Transaksi Hari Ini</h2>
                  {loading ? (
                      <p className="text-2xl font-bold text-gray-800 animate-pulse">...</p>
                  ) : (
                      <p className="text-2xl font-bold text-blue-600">{transaksiHariIni}</p>
                  )}
              </div>
          </motion.div>

          {/* Pendapatan Bulan Ini */}
          <motion.div
              className="bg-white rounded-xl shadow-lg p-6 flex items-start gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
          >
              <div className="p-3 rounded-full bg-purple-100">
                  <Wallet size={24} className="text-purple-600" />
              </div>
              <div className="flex flex-col">
                  <h2 className="text-sm font-medium text-gray-500">Pendapatan Bulan Ini</h2>
                  {loading ? (
                      <p className="text-2xl font-bold text-gray-800 animate-pulse">...</p>
                  ) : (
                      <p className="text-2xl font-bold text-purple-600">{formatRupiah(pendapatanBulanIni)}</p>
                  )}
              </div>
          </motion.div>

          {/* Produk Terlaris */}
          <motion.div
              className="bg-white rounded-xl shadow-lg p-6 flex items-start gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
          >
              <div className="p-3 rounded-full bg-amber-100">
                  <Briefcase size={24} className="text-amber-600" />
              </div>
              <div className="flex flex-col">
                  <h2 className="text-sm font-medium text-gray-500">Produk Terlaris</h2>
                  {loading ? (
                      <p className="text-2xl font-bold text-gray-800 animate-pulse">...</p>
                  ) : (
                      <p className="text-2xl font-bold text-amber-600">{produkTerlaris ?? "—"}</p>
                  )}
              </div>
          </motion.div>
      </div>

      {/* --- ✨ UPDATED DYNAMIC CHART SECTION --- */}
      <motion.div
        className="bg-white shadow-lg rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-700 capitalize">
                {chartMode}
            </h2>
            <p className="text-sm text-gray-500">Grafik finansial berdasarkan filter waktu</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Mode Buttons */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => handleModeChange('pendapatan')}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                  chartMode === 'pendapatan' ? 'bg-green-500 text-white shadow' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <TrendingUp className="inline-block mr-1 h-4 w-4"/> Pendapatan
              </button>
              <button
                onClick={() => handleModeChange('pengeluaran')}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                  chartMode === 'pengeluaran' ? 'bg-red-500 text-white shadow' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <TrendingDown className="inline-block mr-1 h-4 w-4"/> Pengeluaran
              </button>
            </div>
            {/* Filter Buttons */}
             <div className="flex bg-gray-100 p-1 rounded-lg">
               {chartMode === 'pendapatan' && (
                 <button onClick={() => setChartFilter('minggu')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${chartFilter === 'minggu' ? 'bg-white text-gray-800 shadow' : 'text-gray-500'}`}>Minggu</button>
               )}
               <button onClick={() => setChartFilter('bulan')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${chartFilter === 'bulan' ? 'bg-white text-gray-800 shadow' : 'text-gray-500'}`}>Bulan</button>
               <button onClick={() => setChartFilter('tahun')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${chartFilter === 'tahun' ? 'bg-white text-gray-800 shadow' : 'text-gray-500'}`}>Tahun</button>
             </div>
          </div>
        </div>

        <div style={{ width: '100%', height: 300 }}>
           {chartLoading ? (
            <div className="flex justify-center items-center h-full">Loading chart data...</div>
          ) : chartError ? (
            <div className="flex justify-center items-center h-full text-red-500">{chartError}</div>
          ) : chartData.length === 0 ? (
             <div className="flex justify-center items-center h-full text-gray-500">Tidak ada data untuk ditampilkan.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(value)} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatRupiah(value)} />
                <Line
                  type="monotone"
                  dataKey="value"
                  name={chartMode.charAt(0).toUpperCase() + chartMode.slice(1)} // Capitalize 'pendapatan' or 'pengeluaran'
                  stroke={chartMode === 'pendapatan' ? '#10b981' : '#ef4444'}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      {/* --- ✨ UPDATED DYNAMIC RECENT ACTIVITIES SECTION ✨ --- */}
      <motion.div
          className="bg-white shadow-lg rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
      >
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Aktivitas Terbaru</h2>
          {activitiesLoading ? (
              <div className="flex justify-center items-center h-24 text-gray-500">
                  Memuat aktivitas...
              </div>
          ) : activitiesError ? (
              <div className="flex justify-center items-center h-24 text-red-500">
                  {activitiesError}
              </div>
          ) : recentActivities.length === 0 ? (
              <div className="flex justify-center items-center h-24 text-gray-500">
                  Tidak ada aktivitas terbaru.
              </div>
          ) : (
              <ul className="space-y-4">
                  {recentActivities.map((activity, index) => (
                      <li
                          key={index}
                          className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                          {/* We'll use a simple icon for now, your backend can dictate this */}
                          <span className="text-gray-500">
                              {activity.type === 'add' ? '🟢' : activity.type === 'update' ? '🔵' : '🔴'}
                          </span>
                          
                          <div>
                              <p className="text-sm font-semibold text-gray-700">{activity.description}</p>
                              {/* Format the timestamp from the database */}
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