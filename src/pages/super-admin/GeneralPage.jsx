import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
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
  const [totalProduk, setTotalProduk] = useState(0);
  const [transaksiHariIni, setTransaksiHariIni] = useState(0);
  const [pendapatanBulanIni, setPendapatanBulanIni] = useState(0);
  const [produkTerlaris, setProdukTerlaris] = useState(null);
  const [error, setError] = useState(null);

  const [chartData, setChartData] = useState({ pendapatan: [], pengeluaran: [] });
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState(null);

  const [chartFilter, setChartFilter] = useState("tahun"); // Move filter state here

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

  // Fetch top products
  useEffect(() => {
    let cancelled = false;

    const fetchTopProducts = async () => {
      setTopProductsLoading(true);
      setTopProductsError(null);

      try {
        const res = await axios.get(`${API_URL}/reports/all?filter=bulan`, {
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

    if (token) fetchTopProducts();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    const fetchGlobalStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API_URL}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res?.data?.status === "success" && !cancelled) {
          const d = res.data.data;
          setTotalProduk(d.total_produk ?? 0);
          setTransaksiHariIni(d.transactions_today ?? 0);
          setPendapatanBulanIni(Number(d.revenue_month ?? 0));
          setProdukTerlaris(d.top_product ?? null);
        } else if (!cancelled) {
          setError("Response format unexpected");
        }
      } catch (err) {
        console.error("fetchGlobalStats error", err);
        if (!cancelled) setError("Gagal mengambil data dashboard global");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (!token) {
      setError("Belum login (token tidak ditemukan)");
      setLoading(false);
      return;
    }

    fetchGlobalStats();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // Fetch global stats
  useEffect(() => {
    let cancelled = false;
    const fetchChartData = async () => {
      setChartLoading(true);
      setChartError(null);
      try {
        const res = await axios.get(`${API_URL}/dashboard/chart`, {
          params: { 
            filter: chartFilter, // Use the filter state
            year: 2025 // Optional: add year parameter
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
    if (token) fetchChartData();
    return () => { cancelled = true; };
  }, [token, chartFilter]); // Add chartFilter to dependencies

  // Fetch daily summary
  useEffect(() => {
    let cancelled = false;
    const today = new Date().toISOString().split("T")[0];

    const fetchDailySummary = async () => {
      setDailySummaryLoading(true);
      setDailySummaryError(null);

      try {
        const res = await axios.get(`${API_URL}/report/harian`, {
          params: { tanggal: today },
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log('Daily Summary API Response:', res.data);

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

    if (token) fetchDailySummary();

    return () => { cancelled = true; };
  }, [token]);

  // Fetch recent activities
  const fetchRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      setActivitiesError(null);

      // backend defaults: per_page = 20, ordered by created_at desc
      // dashboard usually needs limited recent data
      const params = new URLSearchParams({
        per_page: 5,          // adjust if needed
        type: 'all',
        model: 'all',
        user_id: 'all'
      });

      const response = await axios.get(
        `${API_URL}/dashboard/audit-logs?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.status === 'success') {
        // response.data.data already comes from transformAuditLog()
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

  useEffect(() => {
    if (!token) {
      setActivitiesLoading(false);
      return;
    }

    fetchRecentActivities();
  }, [token]);


  useEffect(() => {
    if (token) {
      fetchRecentActivities();
    } else {
      setActivitiesLoading(false);
    }
  }, [token]);

  // Fetch month comparison
  useEffect(() => {
    let cancelled = false;

    const fetchMonthComparison = async () => {
      setMonthComparisonLoading(true);

      try {
        const res = await axios.get(`${API_URL}/dashboard/month-comparison`, {
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

    if (token) fetchMonthComparison();

    return () => { cancelled = true; };
  }, [token]);

  // Fetch declining products
  useEffect(() => {
    let cancelled = false;

    const fetchDecliningProducts = async () => {
      setDecliningLoading(true);

      try {
        const res = await axios.get(`${API_URL}/dashboard/declining-products`, {
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

    if (token) fetchDecliningProducts();

    return () => { cancelled = true; };
  }, [token]);

  // Fetch low stock products
  useEffect(() => {
    let cancelled = false;

    const fetchLowStockProducts = async () => {
      setLowStockLoading(true);

      try {
        const res = await axios.get(`${API_URL}/dashboard/low-stock`, {
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

    if (token) fetchLowStockProducts();

    return () => { cancelled = true; };
  }, [token]);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="p-6 space-y-6">
      <HeaderSection onRefresh={handleRefresh} loading={loading} />
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">{error}</div>
      )}

      <StatsCards 
        loading={loading}
        totalProduk={totalProduk}
        transaksiHariIni={transaksiHariIni}
        pendapatanBulanIni={pendapatanBulanIni}
        produkTerlaris={produkTerlaris}
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