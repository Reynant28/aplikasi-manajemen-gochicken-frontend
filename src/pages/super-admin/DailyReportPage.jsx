import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Loader2, AlertTriangle, RefreshCw, TrendingUp, ShoppingBag, Package, CreditCard } from "lucide-react";

const API_URL = "http://localhost:8000/api";

const formatRupiah = (value = 0) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

// Enhanced Dashboard Card Component
const DashboardCard = ({ title, value, icon, color = "blue", index = 0 }) => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    amber: "bg-amber-100 text-amber-600",
    purple: "bg-purple-100 text-purple-600",
    red: "bg-red-100 text-red-600",
  };

  const hoverClasses = {
    blue: "hover:bg-blue-50",
    green: "hover:bg-green-50",
    amber: "hover:bg-amber-50",
    purple: "hover:bg-purple-50",
    red: "hover:bg-red-50",
  };

  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-5 flex flex-col justify-between border border-gray-100 ${hoverClasses[color]}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-xl ${colorClasses[color]} flex items-center justify-center`}>
          {icon}
        </div>
        <h2 className="text-sm font-medium text-gray-600">{title}</h2>
      </div>
      <p className={`text-xl font-bold text-${color}-600`}>
        {value}
      </p>
    </motion.div>
  );
};

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

      const res = await axios.get(`${API_URL}/report/harian`, {
        params: { tanggal: date },
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      setData(res.data);
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "Gagal memuat laporan harian.");
      } else if (err.request) {
        setError("Tidak dapat terhubung ke server. Pastikan backend berjalan.");
      } else {
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
    <div className="p-6 space-y-6">
      {/* === HEADER === */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-800">Laporan Harian</h1>
          <p className="text-gray-500 mt-1">Ringkasan penjualan, bahan baku, dan pengeluaran harian</p>
        </motion.div>
        
        <motion.div 
          className="flex gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="border border-gray-300 text-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white shadow-sm"
          />
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </motion.div>
      </div>

      {/* === LOADING === */}
      {loading && (
        <motion.div 
          className="flex justify-center items-center h-64 bg-white rounded-2xl shadow-md border border-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="ml-3 text-gray-600">Memuat laporan harian...</p>
        </motion.div>
      )}

      {/* === ERROR === */}
      {error && !loading && (
        <motion.div 
          className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 flex items-start gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Terjadi Kesalahan</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </motion.div>
      )}

      {/* === MAIN CONTENT === */}
      {!loading && !error && data && (
        <div className="space-y-6">
          {/* Warning */}
          {data.peringatan && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 bg-yellow-50 text-yellow-800 rounded-2xl border border-yellow-200"
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="font-medium">{data.peringatan}</p>
            </motion.div>
          )}

          {/* === SUMMARY CARDS === */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <DashboardCard 
              title="Total Penjualan" 
              value={formatRupiah(data.penjualan_harian)}
              icon={<ShoppingBag size={24} />}
              color="blue"
              index={0}
            />
            <DashboardCard 
              title="Modal Bahan Baku" 
              value={formatRupiah(data.modal_bahan_baku)}
              icon={<Package size={24} />}
              color="amber"
              index={1}
            />
            <DashboardCard 
              title="Pengeluaran Harian" 
              value={formatRupiah(data.pengeluaran_harian)}
              icon={<CreditCard size={24} />}
              color="red"
              index={2}
            />
            <DashboardCard 
              title="Laba Harian" 
              value={formatRupiah(data.laba_harian)}
              icon={<TrendingUp size={24} />}
              color="green"
              index={3}
            />
            <DashboardCard 
              title="Nett Income" 
              value={formatRupiah(data.nett_income)}
              icon={<TrendingUp size={24} />}
              color="purple"
              index={4}
            />
          </div>

          {/* === PENJUALAN TABLE === */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100"
          >
            <div className="p-5 border-b bg-gradient-to-r from-blue-50 to-white">
              <h2 className="text-lg font-semibold text-gray-800">Penjualan Produk</h2>
              <p className="text-sm text-gray-600 mt-1">
                Total: <span className="font-semibold text-blue-600">{formatRupiah(data.penjualan?.total_penjualan || 0)}</span>
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-left font-semibold">Produk</th>
                    <th className="p-4 text-center font-semibold">Jumlah</th>
                    <th className="p-4 text-right font-semibold">Harga Rata-rata</th>
                    <th className="p-4 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {!data.penjualan?.detail || data.penjualan.detail.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <ShoppingBag size={48} className="opacity-50" />
                          <p className="text-base font-medium">Tidak ada penjualan pada tanggal ini</p>
                          <p className="text-sm">Coba pilih tanggal lain atau pastikan ada transaksi dengan status "Selesai"</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.penjualan.detail.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-700">{item.produk}</td>
                        <td className="p-4 text-center text-gray-600">{item.jumlah_produk}</td>
                        <td className="p-4 text-right text-gray-600">{formatRupiah(item.harga_item)}</td>
                        <td className="p-4 text-right font-semibold text-blue-600">
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
            className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100"
          >
            <div className="p-5 border-b bg-gradient-to-r from-amber-50 to-white">
              <h2 className="text-lg font-semibold text-gray-800">Bahan Baku Harian</h2>
              <p className="text-sm text-gray-600 mt-1">
                Total Modal: <span className="font-semibold text-amber-600">{formatRupiah(data.bahan_baku?.total_modal_bahan_baku || 0)}</span>
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-left font-semibold">Nama Bahan</th>
                    <th className="p-4 text-center font-semibold">Satuan</th>
                    <th className="p-4 text-right font-semibold">Harga Satuan</th>
                    <th className="p-4 text-center font-semibold">Jumlah Pakai</th>
                    <th className="p-4 text-right font-semibold">Total Modal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {!data.bahan_baku?.detail || data.bahan_baku.detail.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <Package size={48} className="opacity-50" />
                          <p className="text-base font-medium">Tidak ada data bahan baku pada tanggal ini</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.bahan_baku.detail.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-700">{item.nama_bahan}</td>
                        <td className="p-4 text-center text-gray-600">{item.satuan}</td>
                        <td className="p-4 text-right text-gray-600">{formatRupiah(item.harga_satuan)}</td>
                        <td className="p-4 text-center text-gray-600">{item.jumlah_pakai}</td>
                        <td className="p-4 text-right font-semibold text-amber-600">
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
            className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100"
          >
            <div className="p-5 border-b bg-gradient-to-r from-red-50 to-white">
              <h2 className="text-lg font-semibold text-gray-800">Pengeluaran</h2>
              <p className="text-sm text-gray-600 mt-1">
                Total Cicilan Harian Aktif: <span className="font-semibold text-red-600">{formatRupiah(data.pengeluaran_harian || 0)}</span>
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-left font-semibold">Keterangan</th>
                    <th className="p-4 text-right font-semibold">Jumlah</th>
                    <th className="p-4 text-right font-semibold">Cicilan Harian</th>
                    <th className="p-4 text-center font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {!data.pengeluaran?.detail || data.pengeluaran.detail.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <CreditCard size={48} className="opacity-50" />
                          <p className="text-base font-medium">Tidak ada data pengeluaran</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.pengeluaran.detail.map((item, i) => {
                      const aktif = item.cicilan_harian > 0;
                      return (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-medium text-gray-700">{item.jenis}</td>
                          <td className="p-4 text-right text-gray-600">{formatRupiah(item.jumlah)}</td>
                          <td className="p-4 text-right text-red-600 font-semibold">
                            {formatRupiah(item.cicilan_harian)}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              aktif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {aktif ? 'Aktif' : 'Selesai'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DailyReportPage;