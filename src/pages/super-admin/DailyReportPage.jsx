import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import DashboardCard from "../../components/daily-report/DailyReportCard.jsx";
import EmptyState from "../../components/daily-report/EmptyState.jsx";
import {
  Loader2,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  ShoppingBag,
  Package,
  CreditCard,
  Calendar,
  DollarSign,
  TrendingDown,
  LoaderCircle
} from "lucide-react";

const API_URL = "http://localhost:8000/api";

const formatRupiah = (value = 0) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

// Table Header Component
const TableHeader = ({ children }) => (
  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
    <tr>
      {children}
    </tr>
  </thead>
);

const TableCell = ({ children, align = "left", className = "" }) => {
  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right"
  };

  return (
    <th className={`p-4 ${alignClass[align]} font-semibold text-gray-700 text-sm ${className}`}>
      {children}
    </th>
  );
};

const DailyReportPage = () => {
  const [data, setData] = useState(null);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch report data

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-slate-100 p-6 space-y-6">
      {/* === HEADER === */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-800">Laporan Harian</h1>
          <p className="text-gray-500 mt-1">Ringkasan penjualan, bahan baku, dan pengeluaran</p>
        </motion.div>

        <div className="flex gap-3">
          <div className="relative">
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="border-2 border-gray-200 text-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-400 focus:border-gray-400 focus:outline-none bg-white shadow-sm hover:border-gray-300 transition-all"
            />
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 text-white bg-gray-700 rounded-lg hover:bg-gray-800 transition-all font-medium shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* LOADING */}
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

      {/* === MAIN CONTENT === */}
      {!loading && !error && data && (
        <div className="space-y-6">
          {/* Warning */}
          {data.peringatan && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-5 bg-yellow-50 text-yellow-800 rounded-2xl border-2 border-yellow-200 shadow-md"
            >
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              </div>
              <div>
                <p className="font-bold mb-1">Peringatan!</p>
                <p className="text-sm">{data.peringatan}</p>
              </div>
            </motion.div>
          )}

          {/* === SUMMARY CARDS === */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <DashboardCard
              title="Total Penjualan"
              value={formatRupiah(data.penjualan_harian)}
              icon={<ShoppingBag size={24} className="text-gray-700" />}
              index={0}
              bgColor="bg-gray-50"
              isPositive={data.penjualan_harian > 0}
            />
            <DashboardCard
              title="Modal Bahan Baku"
              value={formatRupiah(data.modal_bahan_baku)}
              icon={<Package size={24} className="text-gray-700" />}
              index={1}
              bgColor="bg-gray-50"
              isPositive={false}
            />
            <DashboardCard
              title="Pengeluaran Harian"
              value={formatRupiah(data.pengeluaran_harian)}
              icon={<CreditCard size={24} className="text-gray-700" />}
              index={2}
              bgColor="bg-gray-50"
              isPositive={false}
            />
            <DashboardCard
              title="Laba Harian"
              value={formatRupiah(data.laba_harian)}
              icon={data.laba_harian >= 0 ? <TrendingUp size={24} className="text-green-700" /> : <TrendingDown size={24} className="text-rose-700" />}
              index={3}
              bgColor="bg-gray-50"
              isPositive={data.laba_harian >= 0}
            />
            <DashboardCard
              title="Nett Income"
              value={formatRupiah(data.nett_income)}
              icon={<DollarSign size={24} className="text-gray-700" />}
              bgColor="bg-gray-50"
              index={4}
              isPositive={data.nett_income >= 0}
            />
          </div>

          {/* === PENJUALAN TABLE === */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100"
          >
            <div className="p-6 border-b bg-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <ShoppingBag className="text-emerald-600" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Penjualan Produk</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Detail transaksi penjualan hari ini</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Penjualan</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatRupiah(data.penjualan?.total_penjualan || 0)}</p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <TableHeader>
                  <TableCell>Produk</TableCell>
                  <TableCell align="center">Jumlah</TableCell>
                  <TableCell align="right">Harga Satuan</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableHeader>
                <tbody className="divide-y divide-gray-100">
                  {!data.penjualan?.detail || data.penjualan.detail.length === 0 ? (
                    <EmptyState
                      icon={ShoppingBag}
                      title="Tidak ada penjualan"
                      description="Belum ada transaksi dengan status 'Selesai' pada tanggal ini"
                    />
                  ) : (
                    data.penjualan.detail.map((item, i) => (
                      <motion.tr
                        key={i}
                        className="hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <td className="p-4">
                          <span className="font-semibold text-gray-800">{item.produk}</span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                            {item.jumlah_produk}
                          </span>
                        </td>
                        <td className="p-4 text-right text-gray-600 font-medium">
                          {formatRupiah(item.harga_item)}
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-emerald-600 font-bold text-lg">
                            {formatRupiah(item.total_penjualan_produk)}
                          </span>
                        </td>
                      </motion.tr>
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
            <div className="p-6 border-b bg-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Package className="text-amber-600" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Bahan Baku Harian</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Penggunaan bahan baku untuk produksi</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Modal</p>
                  <p className="text-2xl font-bold text-amber-600">{formatRupiah(data.bahan_baku?.total_modal_bahan_baku || 0)}</p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <TableHeader>
                  <TableCell>Nama Bahan</TableCell>
                  <TableCell align="center">Satuan</TableCell>
                  <TableCell align="right">Harga Satuan</TableCell>
                  <TableCell align="center">Jumlah Pakai</TableCell>
                  <TableCell align="right">Total Modal</TableCell>
                </TableHeader>
                <tbody className="divide-y divide-gray-100">
                  {!data.bahan_baku?.detail || data.bahan_baku.detail.length === 0 ? (
                    <EmptyState
                      icon={Package}
                      title="Tidak ada data bahan baku"
                      description="Belum ada pencatatan penggunaan bahan baku pada tanggal ini"
                    />
                  ) : (
                    data.bahan_baku.detail.map((item, i) => (
                      <motion.tr
                        key={i}
                        className="hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <td className="p-4">
                          <span className="font-semibold text-gray-800">{item.nama_bahan}</span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                            {item.satuan}
                          </span>
                        </td>
                        <td className="p-4 text-right text-gray-600 font-medium">
                          {formatRupiah(item.harga_satuan)}
                        </td>
                        <td className="p-4 text-center">
                          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-bold">
                            {item.jumlah_pakai}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-amber-600 font-bold text-lg">
                            {formatRupiah(item.modal_produk)}
                          </span>
                        </td>
                      </motion.tr>
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
            <div className="p-6 border-b bg-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <CreditCard className="text-red-600" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Pengeluaran</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Daftar cicilan dan pengeluaran aktif</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Cicilan Harian</p>
                  <p className="text-2xl font-bold text-red-600">{formatRupiah(data.pengeluaran_harian || 0)}</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <TableHeader>
                  <TableCell>Keterangan</TableCell>
                  <TableCell align="right">Jumlah</TableCell>
                  <TableCell align="right">Cicilan Harian</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableHeader>
                <tbody className="divide-y divide-gray-100">
                  {!data.pengeluaran?.detail || data.pengeluaran.detail.length === 0 ? (
                    <EmptyState
                      icon={CreditCard}
                      title="Tidak ada data pengeluaran"
                      description="Belum ada pencatatan pengeluaran atau cicilan aktif"
                    />
                  ) : (
                    data.pengeluaran.detail.map((item, i) => {
                      const aktif = item.cicilan_harian > 0;
                      return (
                        <motion.tr
                          key={i}
                          className="hover:bg-gray-50 transition-colors"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <td className="p-4">
                            <div>
                              <span className="font-semibold text-gray-800 block">{item.jenis}</span>
                              {item.keterangan && (
                                <span className="text-sm text-gray-500">{item.keterangan}</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-right text-gray-600 font-medium">
                            {formatRupiah(item.jumlah)}
                          </td>
                          <td className="p-4 text-right">
                            <span className="text-red-600 font-bold text-lg">
                              {formatRupiah(item.cicilan_harian)}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${aktif
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                              }`}>
                              {aktif ? '✓ Aktif' : '○ Selesai'}
                            </span>
                          </td>
                        </motion.tr>
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