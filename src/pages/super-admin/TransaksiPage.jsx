// src/pages/TransaksiPage.jsx
import React, { useState, useEffect, useCallback } from "react";
//eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Download, Eye, Calendar, Loader2, Search, XCircle, Receipt, X } from "lucide-react";
import * as XLSX from "xlsx";
import axios from "axios";
import { mapPaymentMethodToUI, getPaymentIcon } from "../../components/utils/paymentUtils";

const API_URL = "http://localhost:8000/api";

const formatRupiah = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

const TransaksiPage = () => {
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailTransaksi, setDetailTransaksi] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingDetailId, setLoadingDetailId] = useState(null);

  // Filter states
  const [selectedDate, setSelectedDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");

  const fetchTransaksi = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/transaksi`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransaksi(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch transaksi:", err);
      setError("Terjadi kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleDetailClick = async (id_transaksi) => {
    try {
      setLoadingDetail(true);
      setLoadingDetailId(id_transaksi);
      const res = await axios.get(`${API_URL}/transaksi/${id_transaksi}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDetailTransaksi(res.data.data);
    } catch (error) {
      console.error("Error ambil detail transaksi:", error);
    } finally {
      setLoadingDetail(false);
      setLoadingDetailId(null);
    }
  };

  useEffect(() => {
    if (token) fetchTransaksi();
  }, [token, fetchTransaksi]);

  // Filter data based on date and search
  const filteredData = transaksi.filter(t => {
    const matchesDate = !selectedDate || t.tanggal_waktu.startsWith(selectedDate);
    const matchesSearch = 
      t.kode_transaksi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.nama_pelanggan && t.nama_pelanggan.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.metode_pembayaran.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesDate && matchesSearch;
  });

  const handleExportAllData = () => {
    if (filteredData.length === 0) {
      alert("Tidak ada data untuk diexport.");
      return;
    }

    const headers = [
      "Kode",
      "Tanggal & Waktu",
      "Nama Pelanggan",
      "Metode",
      "Total",
    ];

    const dataForExport = filteredData.map((t) => ({
      Kode: t.kode_transaksi,
      "Tanggal & Waktu": t.tanggal_waktu,
      "Nama Pelanggan": t.nama_pelanggan || "-",
      Metode: mapPaymentMethodToUI(t.metode_pembayaran),
      Total: t.total_harga || 0,
    }));

    const ws = XLSX.utils.json_to_sheet(dataForExport);
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A1" });

    ws['!cols'] = [
      { wch: 20 },
      { wch: 25 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Transaksi");
    XLSX.writeFile(wb, "Pelaporan Data Transaksi.xlsx");
  };

  const renderContent = () => {
    if (loading) return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <Loader2 className="animate-spin h-8 w-8 mb-4 text-red-500" />
        <p>Memuat data transaksi...</p>
      </div>
    );
    
    if (error) return (
      <div className="flex flex-col items-center justify-center h-96 text-red-700 bg-red-50 rounded-lg">
        <XCircle className="h-10 w-10 mb-4" />
        <p className="font-semibold">Terjadi Kesalahan</p>
        <p>{error}</p>
      </div>
    );

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kode
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal & Waktu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Pelanggan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Metode
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length > 0 ? (
              filteredData.map((t) => (
                <motion.tr
                  key={t.id_transaksi}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {t.kode_transaksi}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {t.tanggal_waktu}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {t.nama_pelanggan || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center">
                      {getPaymentIcon(t.metode_pembayaran)}
                      {mapPaymentMethodToUI(t.metode_pembayaran)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatRupiah(t.total_harga)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleDetailClick(t.id_transaksi)}
                      disabled={loadingDetail}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:bg-red-400 disabled:cursor-not-allowed"
                    >
                      {loadingDetail && loadingDetailId === t.id_transaksi ? (
                        <>
                          <Loader2 className="animate-spin" size={14} />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Eye size={14} />
                          Detail
                        </>
                      )}
                    </button>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-12">
                  <div className="flex flex-col items-center gap-3 text-gray-500">
                    <Receipt size={32} />
                    <p className="font-semibold">Tidak ada data transaksi</p>
                    <p className="text-sm">
                      {selectedDate || searchTerm ? "Coba ubah filter pencarian" : "Belum ada transaksi yang tercatat"}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Kelola Transaksi</h1>
            <p className="text-gray-500 text-sm sm:text-base">Lihat dan kelola semua transaksi penjualan</p>
          </div>
          <button
            onClick={handleExportAllData}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition shadow-md font-semibold self-start sm:self-center"
          >
            <Download size={18} /> Export Excel
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-400"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
            />
          </div>
        </div>

        {/* Content */}
        <div>
          {renderContent()}
        </div>
      </motion.div>

      {/* Detail Transaction Modal */}
      <AnimatePresence>
        {detailTransaksi && (
          <motion.div 
            onMouseDown={() => setDetailTransaksi(null)}
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              onMouseDown={e => e.stopPropagation()}
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }} 
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b flex justify-between items-center flex-shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Detail Transaksi</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Kode: {detailTransaksi.kode_transaksi}
                  </p>
                </div>
                <button 
                  onClick={() => setDetailTransaksi(null)}
                  className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {loadingDetail ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="animate-spin h-6 w-6 text-red-500 mr-3" />
                    <p className="text-gray-500">Memuat detail transaksi...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Transaction Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-gray-700">Pelanggan:</span>
                          <span className="text-gray-600">{detailTransaksi.nama_pelanggan || "-"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-gray-700">Tanggal & Waktu:</span>
                          <span className="text-gray-600">{detailTransaksi.tanggal_waktu}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-gray-700">Metode Pembayaran:</span>
                          <div className="flex items-center text-gray-600">
                            {getPaymentIcon(detailTransaksi.metode_pembayaran)}
                            {mapPaymentMethodToUI(detailTransaksi.metode_pembayaran)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-gray-700">Status:</span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Selesai
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Transaction Items */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Detail Produk</h3>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Produk
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Qty
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Harga Satuan
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Subtotal
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {detailTransaksi.detail?.map((d, idx) => (
                              <tr key={idx}>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {d.produk?.nama_produk || "Produk"}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 text-center">
                                  {d.jumlah_produk}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 text-right">
                                  {formatRupiah(d.harga_item)}
                                </td>
                                <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                                  {formatRupiah(d.subtotal)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-800">Total</span>
                        <span className="text-2xl font-bold text-gray-900">
                          {formatRupiah(detailTransaksi.total_harga)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-gray-50 rounded-b-xl flex justify-end flex-shrink-0">
                <button
                  onClick={() => setDetailTransaksi(null)}
                  className="px-6 py-3 text-gray-700 bg-white border rounded-lg hover:bg-gray-100 transition font-semibold"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TransaksiPage;