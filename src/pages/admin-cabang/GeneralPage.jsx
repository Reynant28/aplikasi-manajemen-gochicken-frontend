import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

// Components
import HeaderSection from "../../components/general/HeaderSection";
import StatsCards from "../../components/general/StatsCards";
import MonthComparison from "../../components/general/MonthComparison";
import FinancialChart from "../../components/general/FinancialChart";
import TopProductsSection from "../../components/general/TopProductsSection";
import DecliningProducts from "../../components/general/DecliningProducts";
import LowStockAlert from "../../components/general/LowStockAlert";
import DailySummary from "../../components/general/DailySummary";
import RecentActivities from "../../components/general/RecentActivities";

const API_URL = "http://localhost:8000/api";

const GeneralPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({});

  const [chartData, setChartData] = useState({ pendapatan: [], pengeluaran: [] });
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState(null);

  const [chartFilter, setChartFilter] = useState("tahun");

  const [monthComparison, setMonthComparison] = useState(null);
  const [monthComparisonLoading, setMonthComparisonLoading] = useState(true);

  const [decliningProducts, setDecliningProducts] = useState([]);
  const [decliningLoading, setDecliningLoading] = useState(true);

  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [lowStockLoading, setLowStockLoading] = useState(true);

  const [recentActivities, setRecentActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState(null);

  const [topProducts, setTopProducts] = useState([]);
  const [topProductsLoading, setTopProductsLoading] = useState(true);
  const [topProductsError, setTopProductsError] = useState(null);

  const [dailySummary, setDailySummary] = useState(null);
  const [dailySummaryLoading, setDailySummaryLoading] = useState(true);
  const [dailySummaryError, setDailySummaryError] = useState(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const cabang = JSON.parse(localStorage.getItem("cabang") || "null");
  const cabangId = cabang?.id_cabang ?? null;

  // Fetch dashboard data for cabang
  useEffect(() => {
    let cancelled = false;
    const fetchChartData = async () => {
      setChartLoading(true);
      setChartError(null);

      try {
        const res = await axios.get(`${API_URL}/dashboard/cabang/${cabangId}/chart`, {
          params: { 
            filter: chartFilter, // Use the filter state
            year: 2025 // Add year parameter if needed
          },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res?.data?.status === "success" && !cancelled) {
          setChartData(res.data.data);
        } else if (!cancelled) {
          setChartError("Gagal memuat data chart");
        }
      } catch (err) {
        if (!cancelled) setChartError("Terjadi kesalahan saat mengambil data chart");
      } finally {
        if (!cancelled) setChartLoading(false);
      }
    };

    if (token && cabangId) fetchChartData();

    return () => { cancelled = true; };
  }, [token, cabangId, chartFilter]);

  // Add this useEffect to fetch the main dashboard stats
  useEffect(() => {
    let cancelled = false;
    
    const fetchStatsForCabang = async (id) => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API_URL}/dashboard/cabang/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res?.data?.status === "success" && !cancelled) {
          setDashboardData(res.data.data);
        } else if (!cancelled) {
          setError("Format response tidak sesuai");
        }
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

  // Fetch daily summary
  useEffect(() => {
    let cancelled = false;
    const today = new Date().toISOString().split("T")[0];

    const fetchDailySummary = async () => {
      setDailySummaryLoading(true);
      setDailySummaryError(null);

      try {
        const res = await axios.get(`${API_URL}/report/harian/cabang/${cabangId}`, {
          params: { tanggal: today, cabang_id: cabangId },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res?.data && !cancelled) {
          setDailySummary(res.data);
        } else if (!cancelled) {
          setDailySummaryError("Tidak ada data laporan harian.");
        }
      } catch (err) {
        console.error("fetchDailySummary error:", err);
        if (!cancelled) setDailySummaryError("Gagal memuat laporan harian.");
      } finally {
        if (!cancelled) setDailySummaryLoading(false);
      }
    };

    if (token && cabangId) fetchDailySummary();

    return () => { cancelled = true; };
  }, [token, cabangId]);

  // Fetch recent activities
  useEffect(() => {
    let cancelled = false;

    const fetchRecentActivities = async () => {
      try {
        setActivitiesLoading(true);
        const response = await axios.get(`${API_URL}/dashboard/user/activities`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.status === 'success') {
          setRecentActivities(response.data.data);
        } else {
          setActivitiesError('Gagal memuat aktivitas');
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
        setActivitiesError('Terjadi kesalahan saat memuat aktivitas');
      } finally {
        setActivitiesLoading(false);
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
  }, [token]);

  // Fetch month comparison for cabang
  useEffect(() => {
    let cancelled = false;

    const fetchMonthComparison = async () => {
      setMonthComparisonLoading(true);

      try {
        const res = await axios.get(`${API_URL}/reports/cabang/${cabangId}/month-comparison`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res?.data?.status === "success" && !cancelled) {
          setMonthComparison(res.data.data);
        }
      } catch (err) {
        console.error("fetchMonthComparison error", err);
      } finally {
        if (!cancelled) setMonthComparisonLoading(false);
      }
    };

    if (token && cabangId) fetchMonthComparison();

    return () => { cancelled = true; };
  }, [token, cabangId]);

  // Fetch declining products for cabang
  useEffect(() => {
    let cancelled = false;

    const fetchDecliningProducts = async () => {
      setDecliningLoading(true);

      try {
        const res = await axios.get(`${API_URL}/dashboard/cabang/${cabangId}/declining-products`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res?.data?.status === "success" && !cancelled) {
          setDecliningProducts(res.data.data);
        }
      } catch (err) {
        console.error("fetchDecliningProducts error", err);
      } finally {
        if (!cancelled) setDecliningLoading(false);
      }
    };

    if (token && cabangId) fetchDecliningProducts();

    return () => { cancelled = true; };
  }, [token, cabangId]);

  // Fetch low stock products for cabang
  useEffect(() => {
    let cancelled = false;

    const fetchLowStockProducts = async () => {
      setLowStockLoading(true);

      try {
        const res = await axios.get(`${API_URL}/dashboard/cabang/${cabangId}/low-stock`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res?.data?.status === "success" && !cancelled) {
          setLowStockProducts(res.data.data);
        }
      } catch (err) {
        console.error("fetchLowStockProducts error", err);
      } finally {
        if (!cancelled) setLowStockLoading(false);
      }
    };

    if (token && cabangId) fetchLowStockProducts();

    return () => { cancelled = true; };
  }, [token, cabangId]);

  // Fetch top products for cabang
  useEffect(() => {
    let cancelled = false;

    const fetchTopProducts = async () => {
      setTopProductsLoading(true);
      setTopProductsError(null);

      try {
        const res = await axios.get(`${API_URL}/reports/cabang/${cabangId}?filter=bulan`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res?.data?.status === "success" && !cancelled) {
          setTopProducts(res.data.data.topProducts || []);
        } else if (!cancelled) {
          setTopProductsError("Gagal memuat produk terlaris.");
        }
      } catch (err) {
        if (!cancelled) setTopProductsError("Terjadi kesalahan saat mengambil data produk terlaris.");
      } finally {
        if (!cancelled) setTopProductsLoading(false);
      }
    };

    if (token && cabangId) fetchTopProducts();

    return () => {
      cancelled = true;
    };
  }, [token, cabangId]);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="p-6 space-y-6">
      <HeaderSection 
        onRefresh={handleRefresh} 
        loading={loading}
        title="Dashboard Cabang"
        subtitle={`Ringkasan performa ${cabang?.nama_cabang || "cabang"} dan aktivitas terkini`}
      />
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">{error}</div>
      )}

      <StatsCards 
        loading={loading}
        totalProduk={dashboardData.produk_tersedia ?? 0}
        transaksiHariIni={dashboardData.transactions_today ?? 0}
        pendapatanBulanIni={dashboardData.revenue_month ?? 0}
        produkTerlaris={dashboardData.top_product}
      />

      <MonthComparison 
        loading={monthComparisonLoading}
        data={monthComparison}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FinancialChart 
          loading={chartLoading}
          error={chartError}
          data={chartData}
          chartFilter={chartFilter}
          onFilterChange={setChartFilter}
        />
        
        <TopProductsSection 
          loading={topProductsLoading}
          error={topProductsError}
          data={topProducts}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DecliningProducts 
          loading={decliningLoading}
          data={decliningProducts}
        />
        
        <LowStockAlert 
          loading={lowStockLoading}
          data={lowStockProducts}
        />
      </div>

      <DailySummary 
        loading={dailySummaryLoading}
        error={dailySummaryError}
        data={dailySummary}
      />

      <RecentActivities 
        loading={activitiesLoading}
        error={activitiesError}
        data={recentActivities}
        onRefresh={handleRefresh}
      />
    </div>
  );
};

export default GeneralPage;