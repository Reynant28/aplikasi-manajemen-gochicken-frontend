// src/pages/DailyReportPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";

// 🆕 IMPOR KOMPONEN BARU
import DailyReportDashboard from "../../components/DailyReport/DailyReportDashboard";
import DailyReportDetailTable from "../../components/DailyReport/DailyReportDetailTable";
// import { formatRupiah } from "../utils/formatters"; // Asumsi diimport dari utilitas jika ada

const API_URL = "http://localhost:8000/api";

// Helper function formatRupiah tetap di sini karena komponen tidak perlu format rupiah global
const formatRupiah = (value = 0) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);


const DailyReportPage = () => {
  const [data, setData] = useState(null);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  // 🔴 LOGIKA WARNA DINAMIS
  const getThemeColors = (role) => {
    if (role === 'super admin') {
      return {
        raw: { primary: '#f97316' }, // Warna asli untuk border/style
        bgGradient: 'from-orange-50 via-white to-orange-100',
        primaryText: 'text-orange-700',
        primaryAccent: 'text-orange-600',
        primaryBg: 'bg-orange-600',
        primaryHoverBg: 'hover:bg-orange-700',
        focusRing: 'focus:ring-orange-500',
        quickActionBg: 'bg-orange-100'
      };
    }
    return {
      raw: { primary: '#ef4444' },
      bgGradient: 'from-red-50 via-white to-red-100',
      primaryText: 'text-red-700',
      primaryAccent: 'text-red-600',
      primaryBg: 'bg-red-600',
      primaryHoverBg: 'hover:bg-red-700',
      focusRing: 'focus:ring-red-500',
      quickActionBg: 'bg-red-100'
    };
  };
  const theme = getThemeColors(user?.role);
  
  // 🔴 LOGIKA FETCH REPORT
  const fetchReport = async (date) => {
    setLoading(true);
    setError(null);
    try {
      if (!token) {
        setError("Token tidak ditemukan. Silakan login kembali.");
        setLoading(false);
        return;
      }
      const res = await axios.get(`${API_URL}/report/harian`, {
        params: { tanggal: date },
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat laporan harian.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(tanggal);
  }, [tanggal, token]);
  
  const handleRefresh = () => {
    fetchReport(tanggal);
  };
  
  return (
    <motion.div
      className={`p-6 min-h-screen bg-gradient-to-br ${theme.bgGradient}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Laporan Harian</h1>
          <p className="text-gray-500 mt-1">Ringkasan penjualan, bahan baku, dan pengeluaran harian</p>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className={`border border-gray-300 text-gray-600 rounded-md px-3 py-2 text-sm focus:ring-2 ${theme.focusRing} focus:outline-none transition`}
          />
          <button
            onClick={handleRefresh}
            disabled={loading}
            className={`px-4 py-2 ${theme.primaryBg} text-white rounded-md ${theme.primaryHoverBg} disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-96 bg-white/50 rounded-xl shadow-md">
          <Loader2 className={`w-8 h-8 ${theme.primaryAccent} animate-spin`} />
          <p className="ml-3 text-gray-600">Memuat laporan harian...</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 bg-red-100 text-red-800 rounded-md mb-6 flex items-center gap-3 border border-red-200">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-semibold">Terjadi Kesalahan</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && data && (
        <div className="space-y-6">
          {data.peringatan && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-200">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium">{data.peringatan}</p>
            </motion.div>
          )}

          {/* 🆕 Dashboard Cards */}
          <DailyReportDashboard data={data} theme={theme} />

          {/* 🆕 Detail Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {["penjualan", "bahan_baku", "pengeluaran"].map((section, index) => (
              <DailyReportDetailTable
                key={section}
                section={section}
                data={data}
                theme={theme}
                // Atur transisi di sini jika ingin menyesuaikan delay per section
                // transition={{ delay: 0.1 * (index + 1) }} 
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DailyReportPage;