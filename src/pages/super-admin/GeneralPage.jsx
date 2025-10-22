//eslint-disable-next-line no-unused-vars
import React, { useEffect, useState, useCallback, useRef } from "react";
//eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Users, BarChart2, TrendingUp, TrendingDown, RefreshCw, AlertCircle, BarChart3, Star, Building2, Info, Activity, Wallet, QrCode, CreditCard, DollarSign, Briefcase } from "lucide-react";
import axios from "axios";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { format, getDay, getMonth, getWeekOfMonth, parseISO } from "date-fns";
import { id } from "date-fns/locale";

const API_URL = "http://localhost:8000/api";

const formatRupiah = (value = 0) => {
  try {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
  } catch { return `Rp ${value}`; }
};

const processChartData = (rawData = [], filter) => {
  if (!rawData || rawData.length === 0) return [];
  const dataMap = new Map();
  rawData.forEach(item => {
    const date = parseISO(item.tanggal);
    let key; let label;
    if (filter === "minggu") { key = getDay(date); label = format(date, "EEE", { locale: id }); } 
    else if (filter === "bulan") { key = getWeekOfMonth(date); label = `W${key}`; } 
    else { key = getMonth(date); label = format(date, "MMM", { locale: id }); }
    if (!dataMap.has(key)) dataMap.set(key, { name: label, value: 0 });
    dataMap.get(key).value += parseFloat(item.total);
  });
  return Array.from(dataMap.values());
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const mode = payload[0].name;
        const value = payload[0].value;
        return (
            <div className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-gray-200">
                <p className="text-sm font-bold text-gray-800">{label}</p>
                <p className={`text-sm font-semibold ${mode === 'Pendapatan' ? 'text-red-500' : 'text-orange-500'}`}>{mode}: {formatRupiah(value)}</p>
            </div>
        );
    }
    return null;
};

const SummaryCard = ({ icon, title, value, loading }) => {
    const textRef = useRef(null);
    const [isTruncated, setIsTruncated] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        if (textRef.current && !loading && typeof value === 'string') {
            const check = () => {
                const element = textRef.current;
                setIsTruncated(element.scrollWidth > element.clientWidth);
            };
            const timer = setTimeout(check, 50);
            window.addEventListener('resize', check);
            return () => { 
                clearTimeout(timer); 
                window.removeEventListener('resize', check); 
            };
        }
    }, [value, loading]);

    return (
        <motion.div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-4">
                {icon}
                <div className="flex-grow min-w-0">
                    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                    {loading ? (
                        <div className="mt-1 h-7 w-24 bg-gray-200 rounded-md animate-pulse"></div>
                    ) : (
                        <div className="flex items-center gap-2 mt-1">
                            <p 
                                ref={textRef} 
                                className="text-2xl font-bold text-gray-800 truncate min-w-0"
                            >
                                {value}
                            </p>
                            {isTruncated && (
                                <div className="relative flex-shrink-0" 
                                     onMouseEnter={() => setShowTooltip(true)} 
                                     onMouseLeave={() => setShowTooltip(false)}>
                                    <Info size={16} className="text-gray-400 cursor-pointer" />
                                    {showTooltip && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-gray-800 text-white text-xs rounded py-1 px-2 z-50 shadow-lg">
                                            {value}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// Payment method mapping utilities
const mapPaymentMethodToUI = (dbMethod) => {
    switch (dbMethod?.toLowerCase()) {
        case 'cash': return 'Tunai';
        case 'transfer': return 'Debit';
        case 'e-wallet': return 'QRIS';
        default: return dbMethod;
    }
};

//eslint-disable-next-line no-unused-vars
const mapPaymentMethodToDB = (uiMethod) => {
    switch (uiMethod?.toLowerCase()) {
        case 'tunai': return 'Cash';
        case 'debit': return 'Transfer';
        case 'qris': return 'E-Wallet';
        default: return uiMethod;
    }
};

const getPaymentIcon = (uiMethod) => {
    switch (uiMethod?.toLowerCase()) {
        case 'tunai': return <Wallet size={16} className="text-gray-500"/>;
        case 'debit': return <CreditCard size={16} className="text-gray-500"/>;
        case 'qris': return <QrCode size={16} className="text-gray-500"/>;
        default: return <Wallet size={16} className="text-gray-500"/>;
    }
};

const DailySummaryWidget = ({ token }) => {
    const [summaries, setSummaries] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState('all');
    const [loading, setLoading] = useState(true);
    const [revenueBreakdown, setRevenueBreakdown] = useState([]);
    const [revenueLoading, setRevenueLoading] = useState(false);

    useEffect(() => {
        const fetchSummaries = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_URL}/dashboard/branch-summaries`, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                setSummaries(res.data.data || []);
            } catch (error) {
                console.error("Failed to fetch branch summaries", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSummaries();
    }, [token]);

    useEffect(() => {
        const fetchRevenueBreakdown = async () => {
            if (!selectedBranchId) return;
            
            setRevenueLoading(true);
            try {
                let url = `${API_URL}/dashboard/revenue-breakdown`;
                if (selectedBranchId !== 'all') {
                    url += `?cabang=${selectedBranchId}`;
                }

                const res = await axios.get(url, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                
                if (res.data.status === 'success') {
                    // Process the revenue breakdown to map database names to UI names
                    const processedBreakdown = processRevenueBreakdown(res.data.data || []);
                    setRevenueBreakdown(processedBreakdown);
                }
            } catch (error) {
                console.error("Failed to fetch revenue breakdown", error);
                setRevenueBreakdown([]);
            } finally {
                setRevenueLoading(false);
            }
        };

        if (!loading) {
            fetchRevenueBreakdown();
        }
    }, [selectedBranchId, token, loading]);

    // Process revenue breakdown to combine and map payment methods
    const processRevenueBreakdown = (rawData) => {
        const breakdownMap = new Map();
        
        // Initialize with all three payment methods set to 0
        const allPaymentMethods = ['Tunai', 'Debit', 'QRIS'];
        allPaymentMethods.forEach(method => {
            breakdownMap.set(method, 0);
        });

        // Accumulate amounts from raw data
        rawData.forEach(item => {
            const uiMethod = mapPaymentMethodToUI(item.metode_pembayaran);
            const currentTotal = breakdownMap.get(uiMethod) || 0;
            breakdownMap.set(uiMethod, currentTotal + parseFloat(item.total));
        });

        // Convert map to array and filter out methods with 0 value if needed
        return Array.from(breakdownMap.entries())
            .map(([metode_pembayaran, total]) => ({
                metode_pembayaran,
                total
            }))
            .filter(item => item.total > 0); // Only show methods with actual revenue
    };

    const selectedData = summaries.find(s => s.id_cabang == selectedBranchId) || summaries.find(s => s.id_cabang === 'all');

    return (
        <motion.div className="bg-white shadow-lg rounded-xl p-6 flex flex-col" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
                <h2 className="text-lg font-semibold text-gray-700">Ringkasan Harian</h2>
                <div className="relative w-full sm:w-48">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Cabang</label>
                    <select 
                        value={selectedBranchId} 
                        onChange={(e) => setSelectedBranchId(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 appearance-none bg-white pr-10"
                        disabled={loading}
                    >
                        {summaries.map(s => (
                            <option key={s.id_cabang} value={s.id_cabang}>{s.nama_cabang}</option>
                        ))}
                    </select>
                    {/* Dropdown arrow icon */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 pt-5 text-gray-700">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>
            {loading ? (
                <div className="space-y-4 pt-2 flex-grow">
                    <div className="h-6 bg-gray-200 rounded-md w-3/4 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded-md w-2/3 animate-pulse"></div>
                    <div className="h-px bg-gray-200 my-4"></div>
                    <div className="h-8 bg-gray-200 rounded-md w-1/2 ml-auto animate-pulse"></div>
                </div>
            ) : (
                selectedData && (
                    <div className="flex flex-col flex-grow">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <p className="text-gray-600">Total Pendapatan</p>
                                <p className="font-semibold text-green-600">{formatRupiah(selectedData.pendapatan_hari_ini)}</p>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <p className="text-gray-600">Total Pengeluaran</p>
                                <p className="font-semibold text-red-600">{formatRupiah(selectedData.pengeluaran_hari_ini)}</p>
                            </div>
                        </div>
                        <hr className="my-3"/>
                        <div className="flex justify-between items-center">
                            <p className="font-bold text-gray-700">Estimasi Laba</p>
                            <p className={`font-bold text-xl ${selectedData.estimasi_laba >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                                {formatRupiah(selectedData.estimasi_laba)}
                            </p>
                        </div>
                        <div className="mt-auto pt-4">
                            <h3 className="text-sm font-semibold text-gray-500 mb-2">Rincian Pendapatan:</h3>
                            {revenueLoading ? (
                                <div className="flex flex-col items-center justify-center py-4">
                                    <RefreshCw className="w-4 h-4 animate-spin text-gray-400 mb-2" />
                                    <p className="text-xs text-gray-400">Memuat rincian...</p>
                                </div>
                            ) : revenueBreakdown.length > 0 ? (
                                <div className="space-y-2">
                                    {revenueBreakdown.map((item) => (
                                        <div key={item.metode_pembayaran} className="flex justify-between items-center text-sm">
                                            <p className="flex items-center gap-2 text-gray-600">
                                                {getPaymentIcon(item.metode_pembayaran)} 
                                                {item.metode_pembayaran}
                                            </p>
                                            <p className="font-medium text-gray-700">{formatRupiah(item.total)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 text-center py-2">Belum ada pendapatan hari ini.</p>
                            )}
                        </div>
                    </div>
                )
            )}
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

  useEffect(() => {
    const fetchGlobalData = async () => {
      if (user?.role !== "super admin") { 
        setError("Hanya Super Admin yang dapat melihat halaman ini."); 
        setLoading(false); 
        return; 
      }
      setLoading(true); 
      setError(null);
      try {
        const res = await axios.get(`${API_URL}/dashboard`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setDashboardData(res.data.data);
        //eslint-disable-next-line no-unused-vars
      } catch (err) { 
        setError("Gagal mengambil data global dashboard.");
      } finally { 
        setLoading(false); 
      }
    };
    fetchGlobalData();
  }, [token, user?.role]);

  useEffect(() => {
    const fetchChartData = async () => {
      if (user?.role !== "super admin") { 
        setChartLoading(false); 
        return; 
      }
      setChartLoading(true); 
      setChartError(null);
      try {
        const res = await axios.get(`${API_URL}/dashboard/chart?filter=${chartFilter}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setChartData(processChartData(res.data.data[chartMode] || [], chartFilter));
        //eslint-disable-next-line no-unused-vars
      } catch (err) { 
        setChartError("Terjadi kesalahan saat mengambil data chart.");
      } finally { 
        setChartLoading(false); 
      }
    };
    fetchChartData();
  }, [token, user?.role, chartMode, chartFilter]);

  const handleModeChange = (newMode) => {
    setChartMode(newMode);
    if (newMode === 'pengeluaran' && chartFilter === 'minggu') {
       setChartFilter('tahun');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Global Dashboard</h1>
        <p className="text-gray-500 text-sm sm:text-base">Ringkasan performa untuk seluruh cabang GoChicken.</p>
      </motion.div>

      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div className="lg:col-span-2 bg-white shadow-lg rounded-xl p-4 sm:p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
             <div>
                <h2 className="text-xl font-semibold text-gray-700 capitalize">Grafik {chartMode} Global</h2>
                <p className="text-sm text-gray-500">Visualisasi data finansial gabungan.</p>
             </div>
             <div className="flex items-center gap-2 flex-wrap">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                      onClick={() => handleModeChange('pendapatan')} 
                      className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${chartMode === 'pendapatan' ? 'bg-red-500 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                      <TrendingUp className="inline-block mr-1 h-4 w-4"/> Pendapatan
                    </button>
                    <button 
                      onClick={() => handleModeChange('pengeluaran')} 
                      className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${chartMode === 'pengeluaran' ? 'bg-orange-500 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                      <TrendingDown className="inline-block mr-1 h-4 w-4"/> Pengeluaran
                    </button>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                      onClick={() => setChartFilter('minggu')} 
                      className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${chartFilter === 'minggu' ? 'bg-white text-gray-800 shadow' : 'text-gray-500'}`}
                    >
                      Minggu
                    </button>
                    <button 
                      onClick={() => setChartFilter('bulan')} 
                      className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${chartFilter === 'bulan' ? 'bg-white text-gray-800 shadow' : 'text-gray-500'}`}
                    >
                      Bulan
                    </button>
                    <button 
                      onClick={() => setChartFilter('tahun')} 
                      className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${chartFilter === 'tahun' ? 'bg-white text-gray-800 shadow' : 'text-gray-500'}`}
                    >
                      Tahun
                    </button>
                </div>
             </div>
           </div>
           <div className="w-full h-80">
                {chartLoading ? (
                  <div className="flex justify-center items-center h-full text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                  </div>
                ) : chartError ? (
                  <div className="flex flex-col justify-center items-center h-full text-red-500">
                    <AlertCircle className="w-6 h-6 mb-2"/> 
                    {chartError}
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="flex flex-col justify-center items-center h-full text-gray-500">
                    <BarChart3 className="w-6 h-6 mb-2"/> 
                    Tidak ada data.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorChart" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartMode === 'pendapatan' ? '#ef4444' : '#f97316'} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={chartMode === 'pendapatan' ? '#ef4444' : '#f97316'} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis 
                        tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(value)} 
                        tick={{ fontSize: 12 }} 
                        axisLine={false} 
                        tickLine={false} 
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        name={chartMode === 'pendapatan' ? 'Pendapatan' : 'Pengeluaran'} 
                        stroke={chartMode === 'pendapatan' ? '#ef4444' : '#f97316'} 
                        fill="url(#colorChart)" 
                        strokeWidth={2} 
                        dot={{ r: 3 }} 
                        activeDot={{ r: 6 }} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
           </div>

        </motion.div>

        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <SummaryCard 
                  title="Pendapatan Bulanan" 
                  value={formatRupiah(dashboardData.revenue_month)} 
                  icon={<DollarSign size={24} className="text-red-500"/>} 
                  loading={loading} 
                />
                <SummaryCard 
                  title="Transaksi Hari Ini" 
                  value={dashboardData.transactions_today ?? '0'} 
                  icon={<BarChart2 size={24} className="text-orange-500"/>} 
                  loading={loading} 
                />
                <SummaryCard 
                  title="Produk Tersedia" 
                  value={dashboardData.produk_tersedia ? `${dashboardData.produk_tersedia} / ${dashboardData.total_produk}` : '0 / 0'} 
                  icon={<Briefcase size={24} className="text-red-500"/>} 
                  loading={loading} 
                />
                <SummaryCard 
                  title="Total Cabang Aktif" 
                  value={dashboardData.total_cabang ?? '0'} 
                  icon={<Building2 size={24} className="text-orange-500"/>} 
                  loading={loading} 
                />
            </div>

            <DailySummaryWidget token={token} />
        </div>
      </div>
    </div>
  );
};

export default GeneralPage;