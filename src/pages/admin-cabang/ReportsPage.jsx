import React, { useState, useEffect } from "react";
import axios from "axios";
//eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import DashboardCard from "../../components/DashboardCard.jsx";
import SalesTrendChart from "../../components/SalesTrendChart.jsx";
import TopProductsChart from "../../components/TopProductsChart.jsx";
import { Loader2 } from "lucide-react";
import ProductReport from "../../components/reports/ProductReport.jsx";
import SalesReport from "../../components/reports/SalesReport.jsx";
import EmployeeReport from "../../components/reports/EmployeeReport.jsx";

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
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("bulan");
  const [activeTab, setActiveTab] = useState("products");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const cabang = JSON.parse(localStorage.getItem("cabang") || "null");
  const cabangId = cabang?.id_cabang ?? null;

  useEffect(() => {
    let cancelled = false;
    const fetchReportData = async () => {
      if (user?.role !== "admin cabang" || !cabangId) {
        setError("Hanya Admin Cabang yang dapat melihat laporan ini.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `${API_URL}/reports/cabang/${cabangId}?filter=${filter}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.data?.status === "success" && !cancelled) {
          setReportData(res.data.data);
        }
      } catch {
        if (!cancelled)
          setError("Terjadi kesalahan saat mengambil data laporan.");
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
    switch (activeTab) {
      case "products":
        return <ProductReport cabangId={cabangId} token={token} />;
      case "sales":
        return (
          <SalesReport cabangId={cabangId} token={token} filter={filter} />
        );
      case "employees":
        return <EmployeeReport cabangId={cabangId} token={token} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Laporan Penjualan
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Analisis performa penjualan untuk cabang Anda.
          </p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg self-start md:self-center">
          <button
            onClick={() => setFilter("minggu")}
            className={`px-3 sm:px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
              filter === "minggu"
                ? "bg-white text-red-600 shadow"
                : "text-gray-600"
            }`}
          >
            Minggu Ini
          </button>
          <button
            onClick={() => setFilter("bulan")}
            className={`px-3 sm:px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
              filter === "bulan"
                ? "bg-white text-red-600 shadow"
                : "text-gray-600"
            }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => setFilter("tahun")}
            className={`px-3 sm:px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
              filter === "tahun"
                ? "bg-white text-red-600 shadow"
                : "text-gray-600"
            }`}
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
          <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          <p className="ml-3 text-gray-600">Memuat data laporan...</p>
        </div>
      )}
      {!loading && !error && reportData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {" "}
              <SalesTrendChart
                data={reportData.salesTrend}
                filter={filter}
              />{" "}
            </div>
            <div className="h-[350px] sm:h-[420px]">
              {" "}
              <TopProductsChart data={reportData.topProducts} />{" "}
            </div>
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <DashboardCard
                title="Total Pendapatan"
                value={formatRupiah(reportData.summary.totalPendapatan)}
              />
              <DashboardCard
                title="Total Transaksi"
                value={reportData.summary.totalTransaksi.toLocaleString(
                  "id-ID"
                )}
              />
              <DashboardCard
                title="Rata-rata Transaksi"
                value={formatRupiah(reportData.summary.avgTransaksi)}
              />
              <DashboardCard
                title="Produk Terlaris"
                value={reportData.summary.produkTerlaris}
              />
              <DashboardCard
                title="Hari Paling Ramai"
                value={reportData.summary.hariTersibuk}
              />
            </div>
          </div>

          <div className="pt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Laporan Rinci
            </h2>
            <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide">
              <nav className="-mb-px flex space-x-6">
                <button
                  onClick={() => setActiveTab("products")}
                  className={`flex-shrink-0 whitespace-nowrap py-3 px-1 text-sm font-semibold ${
                    activeTab === "products"
                      ? "text-red-600 border-b-2 border-red-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Laporan Produk
                </button>
                <button
                  onClick={() => setActiveTab("sales")}
                  className={`flex-shrink-0 whitespace-nowrap py-3 px-1 text-sm font-semibold ${
                    activeTab === "sales"
                      ? "text-red-600 border-b-2 border-red-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Laporan Penjualan
                </button>
                <button
                  onClick={() => setActiveTab("employees")}
                  className={`flex-shrink-0 whitespace-nowrap py-3 px-1 text-sm font-semibold ${
                    activeTab === "employees"
                      ? "text-red-600 border-b-2 border-red-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
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
