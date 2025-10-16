//eslint-disable-next-line no-unused-vars
import React, { useEffect, useState, useCallback } from "react";
//eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Users, Building2, Wallet, Briefcase, TrendingUp, TrendingDown, CreditCard, QrCode } from "lucide-react";
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
    const days = [ { name: "Min", value: 0 }, { name: "Sen", value: 0 }, { name: "Sel", value: 0 }, { name: "Rab", value: 0 }, { name: "Kam", value: 0 }, { name: "Jum", value: 0 }, { name: "Sab", value: 0 } ];
    rawData.forEach(item => { const dayIndex = getDay(parseISO(item.tanggal)); days[dayIndex].value += parseFloat(item.total); });
    return days;
  }
  if (filter === "bulan") {
    const weeks = [ { name: "Minggu 1", value: 0 }, { name: "Minggu 2", value: 0 }, { name: "Minggu 3", value: 0 }, { name: "Minggu 4", value: 0 }, { name: "Minggu 5", value: 0 } ];
    rawData.forEach(item => { const date = parseISO(item.tanggal); const weekOfMonth = getWeekOfMonth(date) - 1; if (weeks[weekOfMonth]) { weeks[weekOfMonth].value += parseFloat(item.total); } });
    return weeks.filter(w => w.value > 0);
  }
  if (filter === "tahun") {
    const months = Array.from({ length: 12 }, (_, i) => ({ name: format(new Date(0, i), "MMM", { locale: id }), value: 0 }));
    rawData.forEach(item => { const monthIndex = getMonth(parseISO(item.tanggal)); months[monthIndex].value += parseFloat(item.total); });
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

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const cabang = JSON.parse(localStorage.getItem("cabang") || "null");
  const cabangId = cabang?.id_cabang ?? null;

  useEffect(() => {
    let cancelled = false;
    const fetchStatsForCabang = async (id) => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API_URL}/dashboard/cabang/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res?.data?.status === "success" && !cancelled) {
          setDashboardData(res.data.data);
        } else if (!cancelled) {
          setError("Response format unexpected");
        }
        //eslint-disable-next-line
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

  useEffect(() => {
    let cancelled = false;
    const fetchChartData = async () => {
      if (user?.role !== "admin cabang" || !cabangId) { setChartData([]); setChartLoading(false); return; }
      setChartLoading(true); setChartError(null);
      try {
        const res = await axios.get(`${API_URL}/dashboard/cabang/${cabangId}/chart?filter=${chartFilter}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res?.data?.status === 'success' && !cancelled) {
          setChartData(processChartData(res.data.data[chartMode] || [], chartFilter));
        } else if (!cancelled) {
          setChartError("Gagal memuat data chart.");
        }
        //eslint-disable-next-line
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
  
  // Helper to get an icon for each payment method
  const getPaymentIcon = (method) => {
    switch (method.toLowerCase()) {
      case 'tunai': return <Wallet size={16} className="text-gray-500"/>;
      case 'qris': return <QrCode size={16} className="text-gray-500"/>;
      case 'debit': return <CreditCard size={16} className="text-gray-500"/>;
      default: return <Wallet size={16} className="text-gray-500"/>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <motion.h1 className="text-3xl font-bold text-gray-800" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        Dashboard Overview
      </motion.h1>

      {error && <div className="p-3 bg-red-50 text-red-700 rounded-md">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div className="bg-white rounded-xl shadow-lg p-6 flex items-start gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><div className="p-3 rounded-full bg-green-100"><Users size={24} className="text-green-600" /></div><div className="flex flex-col"><h2 className="text-sm font-medium text-gray-500">Total Produk Tersedia</h2>{loading ? <p className="text-2xl font-bold text-gray-800 animate-pulse">...</p> : <p className="text-2xl font-bold text-green-600">{dashboardData.produk_tersedia ?? 0} / {dashboardData.total_produk ?? 0}</p>}</div></motion.div>
        <motion.div className="bg-white rounded-xl shadow-lg p-6 flex items-start gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><div className="p-3 rounded-full bg-blue-100"><Building2 size={24} className="text-blue-600" /></div><div className="flex flex-col"><h2 className="text-sm font-medium text-gray-500">Transaksi Hari Ini</h2>{loading ? <p className="text-2xl font-bold text-gray-800 animate-pulse">...</p> : <p className="text-2xl font-bold text-blue-600">{dashboardData.transactions_today ?? 0}</p>}</div></motion.div>
        <motion.div className="bg-white rounded-xl shadow-lg p-6 flex items-start gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><div className="p-3 rounded-full bg-purple-100"><Wallet size={24} className="text-purple-600" /></div><div className="flex flex-col"><h2 className="text-sm font-medium text-gray-500">Pendapatan Bulan Ini</h2>{loading ? <p className="text-2xl font-bold text-gray-800 animate-pulse">...</p> : <p className="text-2xl font-bold text-purple-600">{formatRupiah(dashboardData.revenue_month)}</p>}</div></motion.div>
        <motion.div className="bg-white rounded-xl shadow-lg p-6 flex items-start gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><div className="p-3 rounded-full bg-amber-100"><Briefcase size={24} className="text-amber-600" /></div><div className="flex flex-col"><h2 className="text-sm font-medium text-gray-500">Produk Terlaris</h2>{loading ? <p className="text-2xl font-bold text-gray-800 animate-pulse">...</p> : <p className="text-2xl font-bold text-amber-600">{dashboardData.top_product ?? "—"}</p>}</div></motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div className="lg:col-span-2 bg-white shadow-lg rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
             <div><h2 className="text-xl font-semibold text-gray-700 capitalize">{chartMode}</h2><p className="text-sm text-gray-500">Grafik finansial berdasarkan filter waktu</p></div>
             <div className="flex items-center gap-2 flex-wrap"><div className="flex bg-gray-100 p-1 rounded-lg"><button onClick={() => handleModeChange('pendapatan')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${chartMode === 'pendapatan' ? 'bg-green-500 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}><TrendingUp className="inline-block mr-1 h-4 w-4"/> Pendapatan</button><button onClick={() => handleModeChange('pengeluaran')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${chartMode === 'pengeluaran' ? 'bg-red-500 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}><TrendingDown className="inline-block mr-1 h-4 w-4"/> Pengeluaran</button></div><div className="flex bg-gray-100 p-1 rounded-lg">{chartMode === 'pendapatan' && (<button onClick={() => setChartFilter('minggu')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${chartFilter === 'minggu' ? 'bg-white text-gray-800 shadow' : 'text-gray-500'}`}>Minggu</button>)}<button onClick={() => setChartFilter('bulan')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${chartFilter === 'bulan' ? 'bg-white text-gray-800 shadow' : 'text-gray-500'}`}>Bulan</button><button onClick={() => setChartFilter('tahun')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${chartFilter === 'tahun' ? 'bg-white text-gray-800 shadow' : 'text-gray-500'}`}>Tahun</button></div></div>
           </div>
           <div style={{ width: '100%', height: 300 }}>{chartLoading ? <div className="flex justify-center items-center h-full">Loading chart data...</div> : chartError ? <div className="flex justify-center items-center h-full text-red-500">{chartError}</div> : chartData.length === 0 ? <div className="flex justify-center items-center h-full text-gray-500">Tidak ada data untuk ditampilkan.</div> : (<ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(value)} tick={{ fontSize: 12 }} /><Tooltip formatter={(value) => formatRupiah(value)} /><Line type="monotone" dataKey="value" name={chartMode.charAt(0).toUpperCase() + chartMode.slice(1)} stroke={chartMode === 'pendapatan' ? '#10b981' : '#ef4444'} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer>)}</div>
        </motion.div>

        <motion.div className="bg-white shadow-lg rounded-xl p-6 flex flex-col" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Ringkasan Keuangan Hari Ini</h2>
            {loading ? (
                <div className="space-y-4 pt-2 flex-grow"><div className="h-6 bg-gray-200 rounded-md w-3/4 animate-pulse"></div><div className="h-6 bg-gray-200 rounded-md w-2/3 animate-pulse"></div><div className="h-px bg-gray-200 my-4"></div><div className="h-8 bg-gray-200 rounded-md w-1/2 ml-auto animate-pulse"></div></div>
            ) : (
                <div className="flex flex-col flex-grow">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm"><p className="text-gray-600">Total Pendapatan</p><p className="font-semibold text-green-600">{formatRupiah(dashboardData.pendapatan_hari_ini)}</p></div>
                        <div className="flex justify-between items-center text-sm"><p className="text-gray-600">Total Pengeluaran</p><p className="font-semibold text-red-600">{formatRupiah(dashboardData.pengeluaran_hari_ini)}</p></div>
                    </div>
                    <hr className="my-3"/>
                    <div className="flex justify-between items-center">
                        <p className="font-bold text-gray-700">Estimasi Laba</p>
                        <p className={`font-bold text-xl ${dashboardData.estimasi_laba >= 0 ? 'text-gray-800' : 'text-red-600'}`}>{formatRupiah(dashboardData.estimasi_laba)}</p>
                    </div>
                    
                    {/* ✨ NEW: Revenue Breakdown Section */}
                    <div className="mt-auto pt-4">
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">Rincian Pendapatan:</h3>
                        {(dashboardData.revenue_breakdown && dashboardData.revenue_breakdown.length > 0) ? (
                            <div className="space-y-2">
                                {dashboardData.revenue_breakdown.map((item) => (
                                    <div key={item.metode_pembayaran} className="flex justify-between items-center text-sm">
                                        <p className="flex items-center gap-2 text-gray-600">{getPaymentIcon(item.metode_pembayaran)} {item.metode_pembayaran}</p>
                                        <p className="font-medium text-gray-700">{formatRupiah(item.total)}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-2">Belum ada pendapatan hari ini.</p>
                        )}
                    </div>
                </div>
            )}
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
                <Tooltip
                  formatter={(value) => formatRupiah(value)}
                  labelFormatter={(label) => `${label}`}
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    fontSize: "13px",
                  }}
                  itemStyle={{ color: "#111827", fontWeight: 500 }}
                  labelStyle={{ color: "#6b7280", fontWeight: 600 }}
                />
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

