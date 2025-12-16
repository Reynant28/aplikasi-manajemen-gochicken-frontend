// src/pages/GeneralPage.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import axios from "axios";
import { format, getDay, getMonth, getWeekOfMonth, parseISO } from "date-fns";
import { id } from "date-fns/locale";

// 🆕 IMPOR KOMPONEN BARU
import DashboardStatCard from "../../components/General/DashboardStatCard";
import DashboardChartPanel from "../../components/General/DashboardChartPanel";
import DashboardStokKritis from "../../components/General/DashboardStokKritis";
import DashboardQuickActions from "../../components/General/DashboardQuickActions";
import DashboardPerformance from "../../components/General/DashboardPerformance"; // <--- TAMBAHAN BARU

const API_URL = "http://localhost:8000/api";

// --- Helper Functions ---
const formatRupiah = (value = 0) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

const processChartData = (rawData = [], filter) => {
    if (!rawData || rawData.length === 0) return [];
    
    const cleanData = rawData.map(item => ({
        tanggal: parseISO(item.tanggal),
        total: parseFloat(item.total) || 0
    }));

    if (filter === "minggu") {
        const days = Array.from({ length: 7 }, (_, i) => ({ name: format(new Date(2023, 0, i + 1), "EEE", { locale: id }), value: 0 }));
        cleanData.forEach(item => {
            const dayIndex = getDay(item.tanggal);
            days[dayIndex].value += item.total;
        });
        return days;
    }
    if (filter === "bulan") {
        const weeks = Array.from({ length: 5 }, (_, i) => ({ name: `Minggu ${i + 1}`, value: 0 }));
        cleanData.forEach(item => {
            const weekOfMonth = getWeekOfMonth(item.tanggal) - 1;
            if (weeks[weekOfMonth]) weeks[weekOfMonth].value += item.total;
        });
        return weeks.filter((w) => w.value > 0);
    }
    if (filter === "tahun") {
        const months = Array.from({ length: 12 }, (_, i) => ({ name: format(new Date(0, i), "MMM", { locale: id }), value: 0 }));
        cleanData.forEach(item => {
            const monthIndex = getMonth(item.tanggal);
            months[monthIndex].value += item.total;
        });
        return months;
    }
    return [];
};

const GeneralPage = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ 
        totalProduk: 0, 
        transaksiHariIni: 0, 
        pendapatanBulanIni: 0, 
        produkTerlaris: null 
    });
    
    // 🆕 STATE UNTUK PERFORMA (New)
    const [performanceData, setPerformanceData] = useState({
        revenueLastMonth: 0,
        productTrend: null 
    });

    const [error, setError] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [chartLoading, setChartLoading] = useState(true);
    const [chartError, setChartError] = useState(null);
    const [chartMode, setChartMode] = useState("pendapatan");
    const [chartFilter, setChartFilter] = useState("bulan");
    const [stokKritis, setStokKritis] = useState([]);
    const [stokLoading, setStokLoading] = useState(true);
    const [stokError, setStokError] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const cabang = JSON.parse(localStorage.getItem("cabang") || "null");
    const cabangId = cabang?.id_cabang ?? null;

    // 🔴 LOGIKA THEME
    const getThemeColors = (role) => {
        if (role === 'super admin') {
            return {
                bgGradient: 'from-orange-50 via-white to-orange-100',
                primaryText: 'text-orange-700',
                primaryAccent: 'text-orange-600',
                chartRevenue: '#f97316',
                chartExpense: '#ef4444',
                quickActionBg: 'from-orange-100 to-orange-200',
                quickActionHoverBg: 'hover:bg-orange-200/80',
                quickActionText: 'text-orange-700',
                modalBorder: 'border-orange-600',
            };
        }
        return {
            bgGradient: 'from-red-50 via-white to-red-100',
            primaryText: 'text-red-700',
            primaryAccent: 'text-red-600',
            chartRevenue: '#ef4444',
            chartExpense: '#71717a',
            quickActionBg: 'from-red-100 to-red-200',
            quickActionHoverBg: 'hover:bg-red-200/80',
            quickActionText: 'text-red-700',
            modalBorder: 'border-red-600',
        };
    };
    const theme = getThemeColors(user?.role);

    // 🔴 LOGIKA FETCH DASHBOARD DATA
    useEffect(() => {
        let cancelled = false;
        const fetchDashboardData = async () => {
            try {
                setLoading(true); 
                setError(null);
                const endpoint = user?.role === "admin cabang" && cabangId 
                    ? `${API_URL}/dashboard/cabang/${cabangId}` 
                    : `${API_URL}/dashboard`;
                
                const res = await axios.get(endpoint, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });

                if (res?.data?.status === "success" && !cancelled) {
                    const d = res.data.data;
                    setStats({ 
                        totalProduk: d.total_produk ?? 0, 
                        transaksiHariIni: d.transactions_today ?? 0, 
                        pendapatanBulanIni: Number(d.revenue_month ?? 0), 
                        produkTerlaris: d.top_product ?? null 
                    });

                    // 🆕 MENGISI DATA PERFORMA
                    // Note: Backend perlu mengirim field 'revenue_last_month' dan 'trending_insight'
                    // Jika belum ada, UI akan aman karena default value 0/null
                    setPerformanceData({
                        revenueLastMonth: Number(d.revenue_last_month ?? 0), 
                        productTrend: d.trending_insight ?? null 
                        // Contoh format trending_insight: { name: "Ayam Geprek", change: -25, status: "declining" }
                    });
                }
            } catch (err) {
                if (!cancelled) setError(user?.role === "admin cabang" 
                    ? "Gagal mengambil data dashboard cabang" 
                    : "Gagal mengambil data dashboard global");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        if (token) { fetchDashboardData(); } else { setError("Authentication required"); setLoading(false); }
        return () => { cancelled = true; };
    }, [token, cabangId, user?.role]);

    // 🔴 LOGIKA FETCH CHART DATA
    useEffect(() => {
        let cancelled = false;
        const fetchChartData = async () => {
            setChartLoading(true); setChartError(null);
            try {
                const endpoint = user?.role === "admin cabang" && cabangId 
                    ? `${API_URL}/dashboard/cabang/${cabangId}/chart?filter=${chartFilter}` 
                    : `${API_URL}/dashboard/chart?filter=${chartFilter}`;
                const res = await axios.get(endpoint, { headers: { Authorization: `Bearer ${token}` } });
                if (res?.data?.status === "success" && !cancelled) {
                    const rawData = res.data.data[chartMode] || [];
                    const processedData = processChartData(rawData, chartFilter);
                    setChartData(processedData);
                }
            } catch (err) {
                if (!cancelled) setChartError("Gagal memuat data visualisasi");
            } finally {
                if (!cancelled) setChartLoading(false);
            }
        };
        if (token) { fetchChartData(); }
        return () => { cancelled = true; };
    }, [token, chartMode, chartFilter, user?.role, cabangId]);

    // 🔴 LOGIKA FETCH STOK KRITIS
    useEffect(() => {
        let cancelled = false;
        const fetchStokKritis = async () => {
            setStokLoading(true); setStokError(null);
            try {
                const endpoint = `${API_URL}/dashboard/stok-kritis`; 
                const res = await axios.get(endpoint, { headers: { Authorization: `Bearer ${token}` } });
                
                if (res?.data?.status === "success" && !cancelled) {
                    const cleanedData = res.data.data.map(item => {
                        const cleanValue = (value) => {
                            if (!value && value !== 0) return 0;
                            const num = typeof value === 'string' ? parseFloat(value.replace(/\s/g, '').replace(',', '.')) : Number(value);
                            return isNaN(num) ? 0 : Math.floor(num);
                        };
                        return { ...item, jumlah_stok: cleanValue(item.jumlah_stok), stok_minimum: cleanValue(item.stok_minimum) };
                    });
                    setStokKritis(cleanedData);
                } else if (res?.data?.status === "error" && !cancelled) {
                    setStokError(res.data.message || "Gagal memuat data stok.");
                }
            } catch (err) { 
                if (!cancelled) { setStokError("Gagal terhubung ke server untuk data stok."); }
            } finally {
                if (!cancelled) setStokLoading(false);
            }
        };
        if (token) { fetchStokKritis(); } else { setStokLoading(false); }
        return () => { cancelled = true; };
    }, [token]);

    // 🔴 LOGIKA CLOCK
    useEffect(() => {
        const timerId = setInterval(() => { setCurrentTime(new Date()); }, 1000);
        return () => { clearInterval(timerId); };
    }, []);


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
                        {cabang?.nama_cabang || 'Semua Cabang'}
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
                <DashboardStatCard loading={loading} title="Total Produk" value={stats.totalProduk} icon={<Package size={24} />} theme={theme} />
                <DashboardStatCard loading={loading} title="Transaksi Hari Ini" value={stats.transaksiHariIni} icon={<ShoppingCart size={24} />} theme={theme} />
                <DashboardStatCard loading={loading} title="Pendapatan Bulan Ini" value={formatRupiah(stats.pendapatanBulanIni)} icon={<DollarSign size={24} />} theme={theme} />
                <DashboardStatCard loading={loading} title="Produk Terlaris" value={stats.produkTerlaris || "-"} icon={<TrendingUp size={24} />} theme={theme} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Chart Panel */}
                <DashboardChartPanel
                    chartData={chartData}
                    chartLoading={chartLoading}
                    chartError={chartError}
                    chartMode={chartMode}
                    chartFilter={chartFilter}
                    setChartMode={setChartMode}
                    setChartFilter={setChartFilter}
                    theme={theme}
                />
                
                {/* Stok Segera Habis Panel */}
                <DashboardStokKritis
                    stokKritis={stokKritis}
                    stokLoading={stokLoading}
                    stokError={stokError}
                    theme={theme}
                    user={user}
                    cabangId={cabangId}
                />
            </div>
            
            {/* Bottom Row - Performa & Aksi Cepat */}
            <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-6" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2 }}
            >
                {/* 🆕 GANTI PANEL STATUS LAMA DENGAN KOMPONEN PERFORMA BARU */}
                <DashboardPerformance 
                    loading={loading}
                    revenueCurrent={stats.pendapatanBulanIni}
                    revenueLastMonth={performanceData.revenueLastMonth} 
                    productTrend={performanceData.productTrend}
                />

                {/* Aksi Cepat Panel */}
                <DashboardQuickActions
                    theme={theme}
                    user={user}
                    cabangId={cabangId}
                />
            </motion.div>
        </div>
    );
};

export default GeneralPage;