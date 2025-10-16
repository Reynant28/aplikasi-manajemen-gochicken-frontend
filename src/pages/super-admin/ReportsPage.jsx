// src/pages/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
//eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';


// Import our main dashboard components
import DashboardCard from '../../components/DashboardCard.jsx';
import SalesTrendChart from '../../components/SalesTrendChart.jsx';
import TopProductsChart from '../../components/TopProductsChart.jsx';
import { Loader2 } from 'lucide-react';

// Import our NEW detailed report components
import ProductReport from '../../components/reports/super-admin-report/ProductReport.jsx';
import SalesReport from '../../components/reports/super-admin-report/SalesReport.jsx';
import EmployeeReport from '../../components/reports/super-admin-report/EmployeeReport.jsx';

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

const ReportsPage = () => {
  // State for the top dashboard section
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('bulan');

  // NEW state for the bottom detailed reports section
  const [activeTab, setActiveTab] = useState('products');

  // Get user and branch info from localStorage
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // This useEffect still fetches data for the top charts and cards
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
        const res = await axios.get(`${API_URL}/reports/all?filter=${filter}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.status === 'success' && !cancelled) {
          setReportData(res.data.data);
        }
      } catch {
        if (!cancelled) setError("Terjadi kesalahan saat mengambil data laporan.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchReportData();
    return () => { cancelled = true; };
  }, [token, user?.role, filter]);


  const renderActiveTabComponent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductReport token={token} />;
      case 'sales':
        return <SalesReport token={token} />;
      case 'employees':
        return <EmployeeReport token={token} />;
      default:
        return null;
    }
  };

  return (
    <motion.div 
      className="p-4 sm:p-6" // Menyesuaikan padding agar lebih kecil di layar hp (sm:p-6 adalah default di layar lebih besar)
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* --- TOP SECTION: VISUAL DASHBOARD --- */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Laporan Penjualan</h1> {/* Ukuran font responsif */}
          <p className="text-sm sm:text-base text-gray-500">Analisis performa penjualan untuk cabang Anda.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg flex-shrink-0">
          <button onClick={() => setFilter('minggu')} className={`px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-colors ${filter === 'minggu' ? 'bg-white text-green-700 shadow' : 'text-gray-600'}`}>Minggu Ini</button>
          <button onClick={() => setFilter('bulan')} className={`px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-colors ${filter === 'bulan' ? 'bg-white text-green-700 shadow' : 'text-gray-600'}`}>Bulan Ini</button>
          <button onClick={() => setFilter('tahun')} className={`px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-colors ${filter === 'tahun' ? 'bg-white text-green-700 shadow' : 'text-gray-600'}`}>Tahun Ini</button>
        </div>
      </div>
      
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-center mb-6">{error}</div>}
      {loading && !error && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <p className="ml-3 text-gray-600">Memuat data laporan...</p>
        </div>
      )}
      {!loading && !error && reportData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2"> <SalesTrendChart data={reportData.salesTrend} /> </div>
            <div> <TopProductsChart data={reportData.topProducts} /> </div>
            {/* PENYESUAIAN DI SINI: Dashboard Cards */}
            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                <DashboardCard title="Total Pendapatan" value={formatRupiah(reportData.summary.totalPendapatan)} />
                <DashboardCard title="Total Transaksi" value={reportData.summary.totalTransaksi.toLocaleString('id-ID')} />
                {/* Menambahkan breakpoint di md:grid-cols-3 untuk layar tablet */}
                <DashboardCard title="Rata-rata Transaksi" value={formatRupiah(reportData.summary.avgTransaksi)} />
                {/* Memberi responsivitas yang lebih baik untuk 5 card */}
                <DashboardCard title="Produk Terlaris" value={reportData.summary.produkTerlaris} />
                <DashboardCard title="Hari Paling Ramai" value={reportData.summary.hariTersibuk} />
            </div>
          </div>

          {/* --- NEW SECTION: DETAILED REPORTS --- */}
          <div className="pt-4 sm:pt-8"> {/* Menyesuaikan padding atas */}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Laporan Rinci</h2>
            <div className="border-b border-gray-200 overflow-x-auto"> {/* Menambahkan overflow-x-auto agar tab bisa di-scroll di layar kecil */}
              <nav className="-mb-px flex space-x-4 sm:space-x-6 min-w-max"> {/* min-w-max untuk mencegah tab berbaris ke bawah */}
                <button onClick={() => setActiveTab('products')} className={`py-3 px-1 text-sm font-semibold whitespace-nowrap ${activeTab === 'products' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}>Laporan Produk</button>
                <button onClick={() => setActiveTab('sales')} className={`py-3 px-1 text-sm font-semibold whitespace-nowrap ${activeTab === 'sales' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}>Laporan Penjualan</button>
                <button onClick={() => setActiveTab('employees')} className={`py-3 px-1 text-sm font-semibold whitespace-nowrap ${activeTab === 'employees' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}>Laporan Karyawan</button>
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