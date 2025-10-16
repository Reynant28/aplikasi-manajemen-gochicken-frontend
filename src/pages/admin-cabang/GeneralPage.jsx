//eslint-disable-next-line no-unused-vars
import React, { useEffect, useState, useCallback, useRef } from "react";
//eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Users, BarChart2, Wallet, Briefcase, TrendingUp, TrendingDown, CreditCard, QrCode, RefreshCw, AlertCircle, Activity, Star, Info, BarChart3 } from "lucide-react";
import axios from "axios";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
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
    const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map(name => ({ name, value: 0 }));
    rawData.forEach(item => { const dayIndex = getDay(parseISO(item.tanggal)); days[dayIndex].value += parseFloat(item.total); });
    return days;
  }
  if (filter === "bulan") {
    const weeks = Array.from({ length: 5 }, (_, i) => ({ name: `W${i + 1}`, value: 0 }));
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

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const mode = payload[0].name;
        const value = payload[0].value;
        return (
            <div className="bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-gray-200">
                <p className="text-sm font-bold text-gray-800">{label}</p>
                <p className={`text-sm font-semibold ${mode === 'Pendapatan' ? 'text-red-500' : 'text-orange-500'}`}>
                    {mode}: {formatRupiah(value)}
                </p>
            </div>
        );
    }
    return null;
};

// ✨ PERBAIKAN UTAMA: Komponen SummaryCard didefinisikan DI LUAR GeneralPage
const SummaryCard = ({ icon, title, value, loading }) => {
    const textRef = useRef(null);
    const [isTruncated, setIsTruncated] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        // Hanya jalankan pengecekan jika tidak sedang loading dan value sudah ada
        if (textRef.current && !loading && value) {
            const checkTruncation = () => {
                setIsTruncated(textRef.current.scrollWidth > textRef.current.clientWidth);
            };
            
            // Sedikit delay untuk memastikan UI sudah selesai render sebelum mengecek
            const timer = setTimeout(checkTruncation, 50);
            
            window.addEventListener('resize', checkTruncation);
            return () => {
                clearTimeout(timer);
                window.removeEventListener('resize', checkTruncation);
            };
        }
    }, [value, loading]);

    return (
        <motion.div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-4">
                {icon}
                <div className="flex-grow">
                    <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
                    {loading ? 
                        <div className="mt-1 h-7 w-24 bg-gray-200 rounded-md animate-pulse"></div> 
                        : 
                        <div className="flex items-center gap-2 mt-1">
                            <p ref={textRef} className="text-2xl font-bold text-gray-800 truncate">
                                {value}
                            </p>
                            {isTruncated && (
                                <div 
                                    className="relative flex-shrink-0"
                                    onMouseEnter={() => setShowTooltip(true)}
                                    onMouseLeave={() => setShowTooltip(false)}
                                >
                                    <Info size={16} className="text-gray-400 cursor-pointer" />
                                    {showTooltip && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-gray-800 text-white text-xs rounded py-1 px-2 z-50 shadow-lg">
                                            {value}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    }
                </div>
            </div>
        </motion.div>
    );
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
    const fetchDashboardData = async () => {
      if (!cabangId || user?.role !== "admin cabang") {
        setError("Hanya Admin Cabang yang dapat melihat halaman ini.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}/dashboard/cabang/${cabangId}`, { headers: { Authorization: `Bearer ${token}` } });
        setDashboardData(res.data.data);
        //eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Gagal mengambil data dashboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [token, cabangId, user?.role]);

  useEffect(() => {
    const fetchChartData = async () => {
      if (!cabangId || user?.role !== "admin cabang") { setChartLoading(false); return; }
      setChartLoading(true); setChartError(null);
      try {
        const res = await axios.get(`${API_URL}/dashboard/cabang/${cabangId}/chart?filter=${chartFilter}`, { headers: { Authorization: `Bearer ${token}` } });
        setChartData(processChartData(res.data.data[chartMode] || [], chartFilter));
        //eslint-disable-next-line no-unused-vars
      } catch (err) {
        setChartError("Terjadi kesalahan saat mengambil data chart.");
      } finally {
        setChartLoading(false);
      }
    };
    fetchChartData();
  }, [cabangId, token, user?.role, chartMode, chartFilter]);

  const handleModeChange = (newMode) => {
    setChartMode(newMode);
    if (newMode === 'pengeluaran' && chartFilter === 'minggu') {
       setChartFilter('tahun');
    }
  };
  
  const getPaymentIcon = (method) => {
    switch (method.toLowerCase()) {
      case 'tunai': return <Wallet size={16} className="text-gray-500"/>;
      case 'qris': return <QrCode size={16} className="text-gray-500"/>;
      case 'debit': return <CreditCard size={16} className="text-gray-500"/>;
      default: return <Wallet size={16} className="text-gray-500"/>;
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm sm:text-base">Ringkasan performa untuk cabang <strong>{cabang?.nama_cabang || 'N/A'}</strong></p>
      </motion.div>

      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div className="lg:col-span-2 bg-white shadow-lg rounded-xl p-4 sm:p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
             <div>
                <h2 className="text-xl font-semibold text-gray-700 capitalize">Grafik {chartMode}</h2>
                <p className="text-sm text-gray-500">Visualisasi data finansial berdasarkan waktu.</p>
             </div>
             <div className="flex items-center gap-2 flex-wrap">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => handleModeChange('pendapatan')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${chartMode === 'pendapatan' ? 'bg-red-500 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}><TrendingUp className="inline-block mr-1 h-4 w-4"/> Pendapatan</button>
                    <button onClick={() => handleModeChange('pengeluaran')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${chartMode === 'pengeluaran' ? 'bg-orange-500 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}><TrendingDown className="inline-block mr-1 h-4 w-4"/> Pengeluaran</button>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {chartMode === 'pendapatan' && (<button onClick={() => setChartFilter('minggu')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${chartFilter === 'minggu' ? 'bg-white text-gray-800 shadow' : 'text-gray-500'}`}>Minggu</button>)}
                    <button onClick={() => setChartFilter('bulan')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${chartFilter === 'bulan' ? 'bg-white text-gray-800 shadow' : 'text-gray-500'}`}>Bulan</button>
                    <button onClick={() => setChartFilter('tahun')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${chartFilter === 'tahun' ? 'bg-white text-gray-800 shadow' : 'text-gray-500'}`}>Tahun</button>
                </div>
             </div>
           </div>
           <div className="w-full h-80">
                {chartLoading ? <div className="flex justify-center items-center h-full text-gray-500"><RefreshCw className="w-6 h-6 animate-spin mr-2" /></div>
                : chartError ? <div className="flex justify-center items-center h-full text-red-500"><AlertCircle className="w-6 h-6 mr-2"/> {chartError}</div>
                : chartData.length === 0 ? <div className="flex justify-center items-center h-full text-gray-500"><BarChart3 className="w-6 h-6 mr-2"/> Tidak ada data.</div>
                : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                            <defs><linearGradient id="colorChart" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={chartMode === 'pendapatan' ? '#ef4444' : '#f97316'} stopOpacity={0.8}/><stop offset="95%" stopColor={chartMode === 'pendapatan' ? '#ef4444' : '#f97316'} stopOpacity={0}/></linearGradient></defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(value)} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="value" name={chartMode === 'pendapatan' ? 'Pendapatan' : 'Pengeluaran'} stroke={chartMode === 'pendapatan' ? '#ef4444' : '#f97316'} fill="url(#colorChart)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
           </div>
        </motion.div>

        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <SummaryCard title="Pendapatan Bulan Ini" value={formatRupiah(dashboardData.revenue_month)} icon={<TrendingUp size={24} className="text-red-500"/>} loading={loading} />
                <SummaryCard title="Transaksi Hari Ini" value={dashboardData.transactions_today ?? '0'} icon={<BarChart2 size={24} className="text-orange-500"/>} loading={loading} />
                <SummaryCard title="Produk Tersedia" value={`${dashboardData.produk_tersedia ?? '0'} / ${dashboardData.total_produk ?? '0'}`} icon={<Users size={24} className="text-red-500"/>} loading={loading} />
                <SummaryCard title="Produk Terlaris" value={dashboardData.top_product ?? '—'} icon={<Star size={24} className="text-orange-500"/>} loading={loading} />
            </div>

            <motion.div className="bg-white shadow-lg rounded-xl p-6 flex flex-col" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-700">Ringkasan Hari Ini</h2>
                    <Activity className="text-gray-400" size={20} />
                </div>
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
                            ) : (<p className="text-sm text-gray-400 text-center py-2">Belum ada pendapatan hari ini.</p>)}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GeneralPage;