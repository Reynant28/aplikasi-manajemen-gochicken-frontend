// src/pages/ReportsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, TrendingUp, Users, Package, DollarSign, Calendar, LoaderCircle, Download } from 'lucide-react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

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
  const [exporting, setExporting] = useState(false);

  // NEW state for the bottom detailed reports section
  const [activeTab, setActiveTab] = useState('products');

  // Ref for the content to export
  const pdfRef = useRef();

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

  const styles = StyleSheet.create({
    body: {
      padding: 30,
      fontFamily: 'Helvetica',
      backgroundColor: '#ffffff'
    },
    header: {
      marginBottom: 30,
      borderBottom: '2px solid #3b82f6',
      paddingBottom: 20
    },
    headerContent: {
      textAlign: 'center'
    },
    companyName: {
      fontSize: 16,
      color: '#6b7280',
      marginBottom: 5,
      fontWeight: 'normal'
    },
    reportTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: 10
    },
    headerDetails: {
      flexDirection: 'column',
      gap: 5
    },
    period: {
      fontSize: 12,
      color: '#6b7280',
      fontWeight: 'medium'
    },
    date: {
      fontSize: 10,
      color: '#9ca3af',
      fontStyle: 'italic'
    },
    summarySection: {
      marginBottom: 25
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: 15,
      paddingBottom: 5,
      borderBottom: '1px solid #e5e7eb'
    },
    cardsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 10
    },
    card: {
      width: '48%',
      padding: 15,
      borderRadius: 8,
      marginBottom: 12,
      minHeight: 80
    },
    cardPrimary: {
      backgroundColor: '#eff6ff',
      borderLeft: '4px solid #3b82f6'
    },
    cardSecondary: {
      backgroundColor: '#f8fafc',
      borderLeft: '4px solid #64748b'
    },
    cardSuccess: {
      backgroundColor: '#f0fdf4',
      borderLeft: '4px solid #22c55e'
    },
    cardWarning: {
      backgroundColor: '#fffbeb',
      borderLeft: '4px solid #f59e0b'
    },
    cardInfo: {
      backgroundColor: '#f0f9ff',
      borderLeft: '4px solid #0ea5e9'
    },
    cardTitle: {
      fontSize: 10,
      color: '#6b7280',
      marginBottom: 8,
      fontWeight: 'medium',
      textTransform: 'uppercase',
      letterSpacing: 0.5
    },
    cardValue: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#1f2937'
    },
    trendSection: {
      marginBottom: 25
    },
    productsSection: {
      marginBottom: 25
    },
    noDataSection: {
      marginBottom: 25,
      padding: 20,
      backgroundColor: '#f9fafb',
      borderRadius: 8,
      border: '1px dashed #d1d5db'
    },
    noDataText: {
      fontSize: 12,
      color: '#6b7280',
      textAlign: 'center',
      fontStyle: 'italic'
    },
    table: {
      border: '1px solid #e5e7eb',
      borderRadius: 6,
      overflow: 'hidden'
    },
    tableRow: {
      flexDirection: 'row',
      borderBottom: '1px solid #e5e7eb',
      minHeight: 35
    },
    tableRowEven: {
      backgroundColor: '#f9fafb'
    },
    tableHeader: {
      backgroundColor: '#3b82f6',
      borderBottom: '1px solid #2563eb'
    },
    tableCell: {
      padding: 8,
      fontSize: 10,
      borderRight: '1px solid #e5e7eb'
    },
    tableHeaderCell: {
      color: '#ffffff',
      fontWeight: 'bold',
      fontSize: 10,
      textTransform: 'uppercase',
      letterSpacing: 0.5
    },
    footer: {
      position: 'absolute',
      bottom: 30,
      left: 30,
      right: 30,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTop: '1px solid #e5e7eb',
      paddingTop: 15
    },
    footerText: {
      fontSize: 8,
      color: '#9ca3af'
    },
    pageNumber: {
      fontSize: 8,
      color: '#9ca3af'
    }
  });

  const exportToPDF = async () => {
    if (!reportData) {
      alert('Tidak ada data untuk diekspor');
      return;
    }

    setExporting(true);
    try {
      const blob = await pdf(<PDFReport reportData={reportData} filter={filter} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Laporan-Penjualan-${filter === 'minggu' ? 'Minggu-Ini' : filter === 'bulan' ? 'Bulan-Ini' : 'Tahun-Ini'}-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Terjadi kesalahan saat mengekspor PDF. Silakan coba lagi.');
    } finally {
      setExporting(false);
    }
  };

  // Komponen PDFReport di dalam ReportsPage
  const PDFReport = ({ reportData, filter }) => {
    // Helper function to get sales trend data - SESUAIKAN DENGAN STRUKTUR DATA
    const getSalesTrendData = () => {
      if (!reportData?.salesTrend) return [];
      
      if (Array.isArray(reportData.salesTrend)) {
        return reportData.salesTrend.map(item => ({
          period: item.period || 'N/A',
          totalTransactions: item.jumlah_transaksi || 0,
          totalRevenue: parseFloat(item.total_pendapatan) || 0
        }));
      }
      
      return [];
    };

    // Helper function to get top products data - SESUAIKAN DENGAN STRUKTUR DATA
    const getTopProductsData = () => {
      if (!reportData?.topProducts) return [];
      
      if (Array.isArray(reportData.topProducts)) {
        return reportData.topProducts.map(product => ({
          name: product.nama_produk || 'Unknown Product',
          sold: parseInt(product.total_terjual) || 0,
          revenue: 0 // Data revenue tidak tersedia di API
        }));
      }
      
      return [];
    };

    const salesTrendData = getSalesTrendData();
    const topProductsData = getTopProductsData();

    return (
      <Document>
        <Page style={styles.body}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.companyName}>Manajemen Aplikasi GoChicken</Text>
              <Text style={styles.reportTitle}>LAPORAN PENJUALAN</Text>
              <View style={styles.headerDetails}>
                <Text style={styles.period}>
                  Periode: {filter === 'minggu' ? 'Minggu Ini' : filter === 'bulan' ? 'Bulan Ini' : 'Tahun Ini'}
                </Text>
                <Text style={styles.date}>
                  Dicetak: {new Date().toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
            </View>
          </View>

          {/* Summary Cards */}
          {reportData?.summary && (
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>Ringkasan Performa</Text>
              <View style={styles.cardsContainer}>
                <View style={[styles.card, styles.cardPrimary]}>
                  <Text style={styles.cardTitle}>Total Pendapatan</Text>
                  <Text style={styles.cardValue}>{formatRupiah(reportData.summary.totalPendapatan)}</Text>
                </View>
                
                <View style={[styles.card, styles.cardSecondary]}>
                  <Text style={styles.cardTitle}>Total Transaksi</Text>
                  <Text style={styles.cardValue}>{reportData.summary.totalTransaksi?.toLocaleString('id-ID') || '0'}</Text>
                </View>
                
                <View style={[styles.card, styles.cardSuccess]}>
                  <Text style={styles.cardTitle}>Rata-rata Transaksi</Text>
                  <Text style={styles.cardValue}>{formatRupiah(reportData.summary.avgTransaksi)}</Text>
                </View>
                
                <View style={[styles.card, styles.cardWarning]}>
                  <Text style={styles.cardTitle}>Produk Terlaris</Text>
                  <Text style={styles.cardValue}>{reportData.summary.produkTerlaris || 'Tidak ada data'}</Text>
                </View>
                
                <View style={[styles.card, styles.cardInfo]}>
                  <Text style={styles.cardTitle}>Hari Paling Ramai</Text>
                  <Text style={styles.cardValue}>{reportData.summary.hariTersibuk || 'Tidak ada data'}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Sales Trend Section */}
          {salesTrendData.length > 0 ? (
            <View style={styles.trendSection}>
              <Text style={styles.sectionTitle}>Trend Penjualan</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableCell, styles.tableHeaderCell, { width: '40%' }]}>Periode</Text>
                  <Text style={[styles.tableCell, styles.tableHeaderCell, { width: '30%' }]}>Total Transaksi</Text>
                  <Text style={[styles.tableCell, styles.tableHeaderCell, { width: '30%' }]}>Total Pendapatan</Text>
                </View>
                {salesTrendData.map((item, index) => (
                  <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
                    <Text style={[styles.tableCell, { width: '40%' }]}>{item.period}</Text>
                    <Text style={[styles.tableCell, { width: '30%' }]}>{item.totalTransactions.toLocaleString('id-ID')}</Text>
                    <Text style={[styles.tableCell, { width: '30%' }]}>{formatRupiah(item.totalRevenue)}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.noDataSection}>
              <Text style={styles.sectionTitle}>Trend Penjualan</Text>
              <Text style={styles.noDataText}>Tidak ada data trend penjualan yang tersedia</Text>
            </View>
          )}

          {/* Top Products Section */}
          {topProductsData.length > 0 ? (
            <View style={styles.productsSection}>
              <Text style={styles.sectionTitle}>Produk Terlaris</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableCell, styles.tableHeaderCell, { width: '70%' }]}>Nama Produk</Text>
                  <Text style={[styles.tableCell, styles.tableHeaderCell, { width: '30%' }]}>Total Terjual</Text>
                </View>
                {topProductsData.map((product, index) => (
                  <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
                    <Text style={[styles.tableCell, { width: '70%' }]}>{product.name}</Text>
                    <Text style={[styles.tableCell, { width: '30%' }]}>{product.sold.toLocaleString('id-ID')} pcs</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.noDataSection}>
              <Text style={styles.sectionTitle}>Produk Terlaris</Text>
              <Text style={styles.noDataText}>Tidak ada data produk terlaris yang tersedia</Text>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} Coffee Shop - Laporan ini dibuat secara otomatis
            </Text>
            <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
              `Halaman ${pageNumber} dari ${totalPages}`
            )} />
          </View>
        </Page>
      </Document>
    );
  };

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

  return (
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
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Export PDF Button */}
          <button
            onClick={exportToPDF}
            disabled={exporting || loading || error || !reportData}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              exporting || loading || error || !reportData
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700 shadow-md'
            }`}
          >
            {exporting ? (
              <LoaderCircle className="animate-spin h-4 w-4" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {exporting ? 'Mengekspor...' : 'Export PDF'}
          </button>

          {/* Filter Buttons */}
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
        </div>
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
            <div className="flex items-center justify-center h-64 text-gray-500">
              <LoaderCircle className="animate-spin h-6 w-6 mr-3" /> 
              Memuat...
            </div>
          </div>
        </div>
      )}

      {/* --- MAIN CONTENT (PDF Export Area) --- */}
      <div ref={pdfRef}>
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
      </div>
    </motion.div>
  );
};

export default ReportsPage;