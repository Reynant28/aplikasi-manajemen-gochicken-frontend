// src/pages/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, TrendingUp, Users, Package, DollarSign, Calendar, LoaderCircle } from 'lucide-react';

// Import our main dashboard components
import DashboardCard from '../../components/DashboardCard.jsx';
import SalesTrendChart from '../../components/SalesTrendChart.jsx';
import TopProductsChart from '../../components/TopProductsChart.jsx';

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

  const FilterButton = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
        active 
          ? 'bg-gray-700 text-white shadow-md' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );

  const TabButton = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`py-3 px-4 text-sm font-semibold transition-all ${
        active 
          ? 'text-gray-800 border-b-2 border-gray-700' 
          : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  );

  const exportRef = React.useRef(null);

  const exportPDF = async () => {
    const element = exportRef.current;
    if (!element) return;

    const html2canvas = (await import("html2canvas")).default;
    const jsPDF = (await import("jspdf")).default;

    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "p",
      unit: "px",
      format: "a4"
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("Laporan.pdf");
  };


  return (
    <div id="report-export-wrapper" ref={exportRef}>
      <motion.div 
        className="p-6 space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-gray-800">Laporan Penjualan</h1>
            <p className="text-gray-500 mt-1">Analisis performa penjualan untuk cabang Anda.</p>
          </motion.div>
          
          <motion.div 
            className="flex gap-2 bg-gray-100 p-1.5 rounded-xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <FilterButton active={filter === 'minggu'} onClick={() => setFilter('minggu')}>
              Minggu Ini
            </FilterButton>
            <FilterButton active={filter === 'bulan'} onClick={() => setFilter('bulan')}>
              Bulan Ini
            </FilterButton>
            <FilterButton active={filter === 'tahun'} onClick={() => setFilter('tahun')}>
              Tahun Ini
            </FilterButton>
          </motion.div>
          <button 
            onClick={exportPDF}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg"
          >
            Export PDF
          </button>
        </div>
        
        {/* --- ERROR STATE --- */}
        {error && (
          <motion.div 
            className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {error}
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-md border border-gray-100">
            <div className="text-center">
                <div className="flex items-center justify-center h-64 text-gray-500"><LoaderCircle className="animate-spin h-6 w-6 mr-3" /> Memuat...</div>
            </div>
          </div>
        )}

        {/* === ERROR === */}
        {error && !loading && (
          <motion.div 
            className="p-5 bg-red-50 text-red-700 rounded-2xl border-2 border-red-200 flex items-start gap-3 shadow-md"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg mb-1">Terjadi Kesalahan</p>
              <p className="text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* --- MAIN CONTENT --- */}
        {!loading && !error && reportData && (
          <div className="space-y-6">
            {/* --- CHARTS SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sales Trend Chart */}
              <motion.div 
                className="lg:col-span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <SalesTrendChart data={reportData.salesTrend} />
              </motion.div>
              
              {/* Top Products Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <TopProductsChart data={reportData.topProducts} filter={filter}/>
              </motion.div>
            </div>

            {/* --- SUMMARY CARDS --- */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <DashboardCard 
                title="Total Pendapatan" 
                value={formatRupiah(reportData.summary.totalPendapatan)}
                icon={<DollarSign className="text-gray-600" size={20} />}
              />
              <DashboardCard 
                title="Total Transaksi" 
                value={reportData.summary.totalTransaksi.toLocaleString('id-ID')}
                icon={<TrendingUp className="text-gray-600" size={20} />}
              />
              <DashboardCard 
                title="Rata-rata Transaksi" 
                value={formatRupiah(reportData.summary.avgTransaksi)}
                icon={<DollarSign className="text-gray-600" size={20} />}
              />
              <DashboardCard 
                title="Produk Terlaris" 
                value={reportData.summary.produkTerlaris}
                icon={<Package className="text-gray-600" size={20} />}
              />
              <DashboardCard 
                title="Hari Paling Ramai" 
                value={reportData.summary.hariTersibuk}
                icon={<Calendar className="text-gray-600" size={20} />}
              />
            </motion.div>

            {/* --- DETAILED REPORTS SECTION --- */}
            <motion.div 
              className="pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Laporan Rinci</h2>
                
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-2">
                    <TabButton 
                      active={activeTab === 'products'} 
                      onClick={() => setActiveTab('products')}
                    >
                      Laporan Produk
                    </TabButton>
                    <TabButton 
                      active={activeTab === 'sales'} 
                      onClick={() => setActiveTab('sales')}
                    >
                      Laporan Penjualan
                    </TabButton>
                    <TabButton 
                      active={activeTab === 'employees'} 
                      onClick={() => setActiveTab('employees')}
                    >
                      Laporan Karyawan
                    </TabButton>
                  </nav>
                </div>
              </div>
              
              <div className="mt-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderActiveTabComponent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ReportsPage;