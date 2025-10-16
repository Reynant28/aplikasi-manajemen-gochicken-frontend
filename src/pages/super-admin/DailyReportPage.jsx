import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";

const API_URL = "http://localhost:8000/api";

const formatRupiah = (value = 0) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

// Component untuk Dashboard Card
const DashboardCard = ({ title, value, color = "blue" }) => (
  <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500">
    <p className="text-sm text-gray-500 mb-1">{title}</p>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
  </div>
);

const DailyReportPage = () => {
  const [data, setData] = useState(null);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = async (date) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Token tidak ditemukan. Silakan login kembali.");
        setLoading(false);
        return;
      }

      console.log("Fetching report for date:", date);
      
      const res = await axios.get(`${API_URL}/report/harian`, {
        params: { tanggal: date },
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log("API Response:", res.data);
      
      // Debug: cek struktur data
      if (res.data.debug) {
        console.log("Debug Info:", res.data.debug);
      }

      setData(res.data);
    } catch (err) {
      console.error("Error fetching report:", err);
      
      if (err.response) {
        // Server responded with error
        console.error("Error response:", err.response.data);
        setError(err.response.data.message || "Gagal memuat laporan harian.");
      } else if (err.request) {
        // Request made but no response
        setError("Tidak dapat terhubung ke server. Pastikan backend berjalan.");
      } else {
        // Other errors
        setError("Terjadi kesalahan: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(tanggal);
  }, [tanggal]);

  const handleRefresh = () => {
    fetchReport(tanggal);
  };

  return (
    <motion.div
      className="p-6 min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* === HEADER === */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Laporan Harian</h1>
          <p className="text-gray-500">Ringkasan penjualan, bahan baku, dan pengeluaran harian.</p>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="border border-gray-300 text-gray-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* === LOADING === */}
      {loading && (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-md">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="ml-3 text-gray-600">Memuat laporan harian...</p>
        </div>
      )}

      {/* === ERROR === */}
      {error && !loading && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <div>
            <p className="font-semibold">Terjadi Kesalahan</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* === MAIN CONTENT === */}
      {!loading && !error && data && (
        <div className="space-y-6">
          {/* Warning */}
          {data.peringatan && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-4 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-200"
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium">{data.peringatan}</p>
            </motion.div>
          )}

          {/* === SUMMARY CARDS === */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <DashboardCard 
              title="Total Penjualan" 
              value={formatRupiah(data.penjualan_harian)} 
            />
            <DashboardCard 
              title="Modal Bahan Baku" 
              value={formatRupiah(data.modal_bahan_baku)} 
            />
            <DashboardCard 
              title="Pengeluaran Harian" 
              value={formatRupiah(data.pengeluaran_harian)} 
            />
            <DashboardCard 
              title="Laba Harian" 
              value={formatRupiah(data.laba_harian)} 
            />
            <DashboardCard 
              title="Nett Income" 
              value={formatRupiah(data.nett_income)} 
            />
          </div>

          {/* === PENJUALAN TABLE === */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-700">Penjualan Produk</h2>
              <p className="text-sm text-gray-500">
                Total: {formatRupiah(data.penjualan?.total_penjualan || 0)}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-600">
                <thead className="bg-gray-100 text-gray-700 border-b-2 border-gray-200">
                  <tr>
                    <th className="p-3 text-left font-semibold">Produk</th>
                    <th className="p-3 text-center font-semibold">Jumlah</th>
                    <th className="p-3 text-right font-semibold">Harga Rata-rata</th>
                    <th className="p-3 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {!data.penjualan?.detail || data.penjualan.detail.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-6 text-center text-gray-400">
                        <p className="text-lg">Tidak ada penjualan pada tanggal ini</p>
                        <p className="text-sm mt-1">Coba pilih tanggal lain atau pastikan ada transaksi dengan status "Selesai"</p>
                      </td>
                    </tr>
                  ) : (
                    data.penjualan.detail.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 font-medium text-gray-700">{item.produk}</td>
                        <td className="p-3 text-center">{item.jumlah_produk}</td>
                        <td className="p-3 text-right">{formatRupiah(item.harga_item)}</td>
                        <td className="p-3 text-right font-semibold text-blue-600">
                          {formatRupiah(item.total_penjualan_produk)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* === BAHAN BAKU TABLE === */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-700">Bahan Baku Harian</h2>
              <p className="text-sm text-gray-500">
                Total Modal: {formatRupiah(data.bahan_baku?.total_modal_bahan_baku || 0)}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-600">
                <thead className="bg-gray-100 text-gray-700 border-b-2 border-gray-200">
                  <tr>
                    <th className="p-3 text-left font-semibold">Nama Bahan</th>
                    <th className="p-3 text-center font-semibold">Satuan</th>
                    <th className="p-3 text-right font-semibold">Harga Satuan</th>
                    <th className="p-3 text-center font-semibold">Jumlah Pakai</th>
                    <th className="p-3 text-right font-semibold">Total Modal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {!data.bahan_baku?.detail || data.bahan_baku.detail.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-gray-400">
                        Tidak ada data bahan baku pada tanggal ini
                      </td>
                    </tr>
                  ) : (
                    data.bahan_baku.detail.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 font-medium text-gray-700">{item.nama_bahan}</td>
                        <td className="p-3 text-center">{item.satuan}</td>
                        <td className="p-3 text-right">{formatRupiah(item.harga_satuan)}</td>
                        <td className="p-3 text-center">{item.jumlah_pakai}</td>
                        <td className="p-3 text-right font-semibold text-blue-600">
                          {formatRupiah(item.modal_produk)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* === PENGELUARAN TABLE === */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-700">Pengeluaran</h2>
              <p className="text-sm text-gray-500">
                Total Cicilan Harian Aktif: {formatRupiah(data.pengeluaran_harian || 0)}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-600">
                <thead className="bg-gray-100 text-gray-700 border-b-2 border-gray-200">
                  <tr>
                    <th className="p-3 text-left font-semibold">Keterangan</th>
                    
                    <th className="p-3 text-right font-semibold">Jumlah</th>
                    <th className="p-3 text-right font-semibold">Cicilan Harian</th>
                    <th className="p-3 text-center font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.pengeluaran.detail.map((item, i) => {
                    const aktif = item.cicilan_harian > 0;
                    return (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 font-medium text-gray-700">{item.jenis}</td>
                        <td className="p-3 text-right">{formatRupiah(item.jumlah)}</td>
                        <td className="p-3 text-right text-blue-600 font-semibold">
                          {formatRupiah(item.cicilan_harian)}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            aktif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {aktif ? 'Aktif' : 'Selesai'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default DailyReportPage;