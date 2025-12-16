// src/pages/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import DashboardCard from '../../components/DashboardCard.jsx';
import SalesTrendChart from '../../components/SalesTrendChart.jsx';
import TopProductsChart from '../../components/TopProductsChart.jsx';
import { Loader2 } from 'lucide-react';
import ProductReport from '../../components/reports/super-admin-report/ProductReport.jsx';
import SalesReport from '../../components/reports/super-admin-report/SalesReport.jsx';
import EmployeeReport from '../../components/reports/super-admin-report/EmployeeReport.jsx';
import ProfitLossCard from '../../components/reports/super-admin-report/ProfitLossCard.jsx';

const API_URL = "http://localhost:8000/api";

const formatRupiah = (value = 0) => {
    try {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
    } catch {
        return `Rp ${value}`;
    }
};

const ReportsPage = () => {
    const [reportData, setReportData] = useState(null);
    const [profitLossData, setProfitLossData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('bulan');
    const [activeTab, setActiveTab] = useState('products');
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const getThemeColors = (role) => {
        if (role === 'super admin') {
            return {
                bgGradient: "from-orange-50 via-white to-orange-100",
                primaryText: 'text-orange-700',
                primaryAccent: 'text-orange-600',
                primaryBorder: 'border-orange-600',
            };
        }
        return {
            bgGradient: "from-red-50 via-white to-red-100",
            primaryText: 'text-red-700',
            primaryAccent: 'text-red-600',
            primaryBorder: 'border-red-600',
        };
    };
    const theme = getThemeColors(user?.role);

    // Function untuk menghitung profit-loss dari data yang ada
    const calculateProfitLossFromReportData = (reportData) => {
        if (!reportData?.summary) return null;

        const totalRevenue = reportData.summary.totalPendapatan || 0;
        
        // Asumsi bisnis restaurant: 
        // - COGS (Harga Pokok Penjualan) = 50% dari revenue untuk bisnis makanan
        // - Biaya operasional = 25% dari revenue
        const cogsPercentage = 0.5;
        const operationalPercentage = 0.25;
        
        const totalCOGS = totalRevenue * cogsPercentage;
        const operationalCosts = totalRevenue * operationalPercentage;
        const grossProfit = totalRevenue - totalCOGS;
        const netProfit = grossProfit - operationalCosts;

        return {
            totalRevenue,
            totalCOGS,
            grossProfit,
            operationalCosts,
            netProfit,
            profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
        };
    };

    useEffect(() => {
        let cancelled = false;
        
        const fetchReportData = async () => {
            if (user?.role !== 'super admin') {
                setError("Hanya Super Admin yang dapat melihat laporan ini.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Fetch data utama
                const reportRes = await axios.get(`${API_URL}/reports/all?filter=${filter}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000
                });
                
                if (!cancelled && reportRes.data?.status === 'success') {
                    setReportData(reportRes.data.data);
                    
                    // Hitung profit-loss dari data yang ada
                    const calculatedProfitLoss = calculateProfitLossFromReportData(reportRes.data.data);
                    if (calculatedProfitLoss) {
                        setProfitLossData(calculatedProfitLoss);
                    }
                } else {
                    if (!cancelled) {
                        setError("Format data laporan tidak valid.");
                    }
                }

            } catch (err) {
                console.error('Error fetching report data:', err);
                if (!cancelled) {
                    if (err.response?.status === 404) {
                        setError("Endpoint laporan tidak ditemukan. Pastikan backend berjalan dengan benar.");
                    } else if (err.code === 'NETWORK_ERROR' || err.code === 'ECONNREFUSED') {
                        setError("Tidak dapat terhubung ke server. Pastikan backend berjalan di http://localhost:8000");
                    } else if (err.response?.status === 401) {
                        setError("Token tidak valid. Silakan login kembali.");
                    } else {
                        setError("Terjadi kesalahan saat mengambil data laporan.");
                    }
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchReportData();
        return () => { cancelled = true; };
    }, [token, user?.role, filter]);

    const renderActiveTabComponent = () => {
        switch (activeTab) {
            case 'products': return <ProductReport token={token} />;
            case 'sales': return <SalesReport token={token} />;
            case 'employees': return <EmployeeReport token={token} />;
            default: return null;
        }
    };

    return (
        <motion.div 
            className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} p-4 sm:p-6`} 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.5 }}
        >
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Laporan Penjualan</h1>
                    <p className="text-sm sm:text-base text-gray-500">Analisis performa penjualan untuk semua cabang</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg flex-shrink-0">
                    <button 
                        onClick={() => setFilter('minggu')} 
                        className={`px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-colors ${filter === 'minggu' ? `bg-white ${theme.primaryText} shadow` : 'text-gray-600'}`}
                    >
                        Minggu Ini
                    </button>
                    <button 
                        onClick={() => setFilter('bulan')} 
                        className={`px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-colors ${filter === 'bulan' ? `bg-white ${theme.primaryText} shadow` : 'text-gray-600'}`}
                    >
                        Bulan Ini
                    </button>
                    <button 
                        onClick={() => setFilter('tahun')} 
                        className={`px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-colors ${filter === 'tahun' ? `bg-white ${theme.primaryText} shadow` : 'text-gray-600'}`}
                    >
                        Tahun Ini
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md text-center mb-6">
                    {error}
                </div>
            )}
            
            {loading && !error && (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className={`w-8 h-8 ${theme.primaryAccent} animate-spin`} />
                    <p className="ml-3 text-gray-600">Memuat data laporan...</p>
                </div>
            )}
            
            {!loading && !error && reportData && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <SalesTrendChart data={reportData.salesTrend} userRole={user?.role} />
                        </div>
                        <div>
                            <TopProductsChart data={reportData.topProducts} userRole={user?.role} />
                        </div>
                        
                        {/* Grid Summary Cards */}
                        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                            <DashboardCard 
                                title="Total Pendapatan" 
                                value={formatRupiah(reportData.summary.totalPendapatan)} 
                                theme={theme} 
                            />
                            <DashboardCard 
                                title="Total Transaksi" 
                                value={reportData.summary.totalTransaksi.toLocaleString('id-ID')} 
                                theme={theme} 
                            />
                            <DashboardCard 
                                title="Rata-rata Transaksi" 
                                value={formatRupiah(reportData.summary.avgTransaksi)} 
                                theme={theme} 
                            />
                            <DashboardCard 
                                title="Produk Terlaris" 
                                value={reportData.summary.produkTerlaris} 
                                theme={theme} 
                            />
                            <DashboardCard 
                                title="Hari Paling Ramai" 
                                value={reportData.summary.hariTersibuk} 
                                theme={theme}
                            />
                        </div>
                        
                        {/* Profit Loss Card */}
                        {profitLossData && (
                            <div className="lg:col-span-3">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                        Perhitungan Estimasi
                                    </span>
                                </div>
                                <ProfitLossCard data={profitLossData} theme={theme} />
                            </div>
                        )}
                    </div>
                    
                    <div className="pt-4 sm:pt-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Laporan Rinci</h2>
                        <div className="border-b border-gray-200 overflow-x-auto">
                            <nav className="-mb-px flex space-x-4 sm:space-x-6 min-w-max">
                                <button 
                                    onClick={() => setActiveTab('products')} 
                                    className={`py-3 px-1 text-sm font-semibold whitespace-nowrap ${activeTab === 'products' ? `${theme.primaryText} border-b-2 ${theme.primaryBorder}` : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Laporan Produk
                                </button>
                                <button 
                                    onClick={() => setActiveTab('sales')} 
                                    className={`py-3 px-1 text-sm font-semibold whitespace-nowrap ${activeTab === 'sales' ? `${theme.primaryText} border-b-2 ${theme.primaryBorder}` : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Laporan Penjualan
                                </button>
                                <button 
                                    onClick={() => setActiveTab('employees')} 
                                    className={`py-3 px-1 text-sm font-semibold whitespace-nowrap ${activeTab === 'employees' ? `${theme.primaryText} border-b-2 ${theme.primaryBorder}` : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Laporan Karyawan
                                </button>
                            </nav>
                        </div>
                        <div className="mt-6">
                            <motion.div 
                                key={activeTab} 
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                transition={{ duration: 0.3 }}
                            >
                                {renderActiveTabComponent()}
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ReportsPage;