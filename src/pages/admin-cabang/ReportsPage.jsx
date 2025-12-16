// src/pages/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Loader2, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Package, 
  Calendar, 
  DollarSign, 
  Target,
  AlertCircle 
} from 'lucide-react';

// Import komponen utama dashboard
import DashboardCard from '../../components/DashboardCard.jsx';
import SalesTrendChart from '../../components/SalesTrendChart.jsx';
import TopProductsChart from '../../components/TopProductsChart.jsx';

// Import komponen laporan detail
import ProductReport from '../../components/reports/ProductReport.jsx';
import SalesReport from '../../components/reports/SalesReport.jsx';
import EmployeeReport from '../../components/reports/EmployeeReport.jsx';

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

// Komponen fallback untuk data kosong
const EmptyState = ({ title, description, icon }) => (
  <div className="text-center py-12">
    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 max-w-md mx-auto">{description}</p>
  </div>
);

// Komponen untuk loading tab
const TabLoading = () => (
  <div className="flex justify-center items-center h-64">
    <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
  </div>
);

const ReportsPage = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('bulan');
  const [activeTab, setActiveTab] = useState('products');
  const [tabLoading, setTabLoading] = useState(false);

  // Get user & cabang info
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const cabang = JSON.parse(localStorage.getItem("cabang") || "null");
  const cabangId = cabang?.id_cabang ?? null;

  // Tema warna sesuai sidebar (merah)
  const theme = {
    bgGradient: 'from-red-50 via-white to-red-100',
    primaryText: 'text-red-700',
    primaryAccent: 'text-red-600',
    chartColor: '#ef4444',
    quickActionBg: 'from-red-100 to-red-200',
    quickActionText: 'text-red-700',
    modalBorder: 'border-red-600',
    cardBg: 'bg-white',
    cardBorder: 'border-gray-100',
    headerBg: 'bg-white/80 backdrop-blur-sm',
    headerBorder: 'border-gray-200'
  };

  // Effect untuk loading tab
  useEffect(() => {
    setTabLoading(true);
    const timer = setTimeout(() => setTabLoading(false), 500);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Ambil data laporan
  useEffect(() => {
    let cancelled = false;
    const fetchReportData = async () => {
      if (user?.role !== 'admin cabang' || !cabangId) {
        setError("Hanya Admin Cabang yang dapat melihat laporan ini.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}/reports/cabang/${cabangId}?filter=${filter}`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000 // Timeout 10 detik
        });
        if (res.data?.status === 'success' && !cancelled) {
          setReportData(res.data.data);
        } else if (!cancelled) {
          setError("Format data tidak valid dari server.");
        }
      } catch (err) {
        if (!cancelled) {
          if (err.code === 'ECONNABORTED') {
            setError("Permintaan timeout. Silakan coba lagi.");
          } else if (err.response?.status === 401) {
            setError("Sesi telah berakhir. Silakan login kembali.");
          } else if (err.response?.status === 403) {
            setError("Anda tidak memiliki akses ke laporan ini.");
          } else if (err.response?.status === 404) {
            setError("Data laporan tidak ditemukan.");
          } else {
            setError("Terjadi kesalahan saat mengambil data laporan.");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchReportData();
    return () => {
      cancelled = true;
    };
  }, [cabangId, token, user?.role, filter]);

  const renderActiveTabComponent = () => {
    if (tabLoading) {
      return <TabLoading />;
    }

    switch (activeTab) {
      case 'products':
        return <ProductReport cabangId={cabangId} token={token} />;
      case 'sales':
        return <SalesReport cabangId={cabangId} token={token} />;
      case 'employees':
        return <EmployeeReport cabangId={cabangId} token={token} />;
      default:
        return null;
    }
  };

  // Data default untuk menghindari error
  const safeReportData = reportData || {
    summary: {
      totalPendapatan: 0,
      totalTransaksi: 0,
      avgTransaksi: 0,
      produkTerlaris: '-',
      hariTersibuk: '-'
    },
    salesTrend: [],
    topProducts: []
  };

  return (
    <div className={`min-h-screen p-6 space-y-6 bg-gradient-to-br ${theme.bgGradient}`}>
      {/* === HEADER SECTION === */}
      <motion.div
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">Laporan & Analitik</h1>
          <p className="text-gray-600 text-lg">Analisis performa penjualan cabang Anda</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-3 ${theme.headerBg} border ${theme.headerBorder} rounded-xl shadow-sm`}>
            <span className="text-base font-semibold text-gray-800">
              {cabang?.nama_cabang || 'Cabang Tidak Dikenal'}
            </span>
          </div>
          <div className="flex bg-gray-100 rounded-xl p-1.5 shadow-inner">
            {['minggu', 'bulan', 'tahun'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all capitalize ${
                  filter === filterOption
                    ? `bg-white ${theme.primaryText} shadow-sm`
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {filterOption === 'minggu' ? 'Minggu Ini' : 
                 filterOption === 'bulan' ? 'Bulan Ini' : 'Tahun Ini'}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* === STATUS SECTION === */}
      {error && (
        <motion.div 
          className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-red-100 mr-3">
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-red-700 text-sm font-medium">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="text-red-600 text-sm underline mt-1"
              >
                Coba lagi
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {loading && !error && (
        <motion.div 
          className="flex justify-center items-center h-64 bg-white rounded-2xl border border-gray-100 shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Memuat data laporan...</p>
            <p className="text-sm text-gray-500 mt-1">Sedang mengambil data terbaru</p>
          </div>
        </motion.div>
      )}

      {/* === MAIN CONTENT === */}
      {!loading && !error && (
        <div className="space-y-6">
          {/* === DASHBOARD CARDS === */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <DashboardCard
              title="Total Pendapatan"
              value={formatRupiah(safeReportData.summary.totalPendapatan)}
              subtitle="Pendapatan kotor"
              icon={<DollarSign size={24} />}
              theme="red"
              loading={false}
            />
            <DashboardCard
              title="Total Transaksi"
              value={safeReportData.summary.totalTransaksi.toLocaleString('id-ID')}
              subtitle="Jumlah transaksi"
              icon={<BarChart3 size={24} />}
              theme="red"
              loading={false}
            />
            <DashboardCard
              title="Rata-rata Transaksi"
              value={formatRupiah(safeReportData.summary.avgTransaksi)}
              subtitle="Per transaksi"
              icon={<TrendingUp size={24} />}
              theme="purple"
              loading={false}
            />
            <DashboardCard
              title="Produk Terlaris"
              value={safeReportData.summary.produkTerlaris}
              subtitle="Berdasarkan penjualan"
              icon={<Package size={24} />}
              theme="amber"
              loading={false}
            />
            <DashboardCard
              title="Hari Paling Ramai"
              value={safeReportData.summary.hariTersibuk}
              subtitle="Tingkat keramaian"
              icon={<Users size={24} />}
              theme="blue"
              loading={false}
            />
          </motion.div>

          {/* === CHARTS SECTION === */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <motion.div 
              className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-gray-900">Trend Penjualan</h2>
                  <p className="text-sm text-gray-600">Perkembangan penjualan berdasarkan periode</p>
                </div>
                <div className={`p-2 rounded-lg bg-gradient-to-r ${theme.quickActionBg}`}>
                  <TrendingUp size={20} className={theme.primaryText} />
                </div>
              </div>
              {safeReportData.salesTrend?.length > 0 ? (
                <SalesTrendChart data={safeReportData.salesTrend} />
              ) : (
                <EmptyState
                  title="Data Trend Tidak Tersedia"
                  description="Tidak ada data penjualan untuk periode yang dipilih."
                  icon={<TrendingUp size={24} className="text-gray-400" />}
                />
              )}
            </motion.div>

            <motion.div 
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-gray-900">Produk Terpopuler</h2>
                  <p className="text-sm text-gray-600">Top produk berdasarkan penjualan</p>
                </div>
                <div className={`p-2 rounded-lg bg-gradient-to-r ${theme.quickActionBg}`}>
                  <Package size={20} className={theme.primaryText} />
                </div>
              </div>
              {safeReportData.topProducts?.length > 0 ? (
                <TopProductsChart data={safeReportData.topProducts} />
              ) : (
                <EmptyState
                  title="Data Produk Tidak Tersedia"
                  description="Tidak ada data produk untuk periode yang dipilih."
                  icon={<Package size={24} className="text-gray-400" />}
                />
              )}
            </motion.div>
          </div>

          {/* === DETAILED REPORT SECTION === */}
          <motion.div 
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-gray-900">Laporan Rinci</h2>
                <p className="text-sm text-gray-600">Analisis mendetail untuk pengambilan keputusan</p>
              </div>
              <div className={`p-2 rounded-lg bg-gradient-to-r ${theme.quickActionBg}`}>
                <BarChart3 size={20} className={theme.primaryText} />
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'products', label: 'Laporan Produk', icon: <Package size={18} /> },
                  { id: 'sales', label: 'Laporan Penjualan', icon: <TrendingUp size={18} /> },
                  { id: 'employees', label: 'Laporan Karyawan', icon: <Users size={18} /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-3 px-1 font-semibold border-b-2 transition-all ${
                      activeTab === tab.id
                        ? `${theme.primaryText} border-red-600`
                        : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.icon}
                    <span className="ml-2">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderActiveTabComponent()}
            </motion.div>
          </motion.div>

          {/* === QUICK STATS FOOTER === */}
          <motion.div 
            className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20">
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Performa {filter === 'minggu' ? 'Minggu Ini' : filter === 'bulan' ? 'Bulan Ini' : 'Tahun Ini'}</h3>
                  <p className="text-red-100 text-sm">Data terupdate secara real-time</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{safeReportData.summary.totalTransaksi.toLocaleString('id-ID')}</p>
                <p className="text-red-100 text-sm">Total Transaksi</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;