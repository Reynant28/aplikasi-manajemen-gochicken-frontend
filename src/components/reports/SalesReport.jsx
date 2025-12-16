import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, ServerCrash, TrendingUp, TrendingDown, CreditCard, Calendar, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = "http://localhost:8000/api";
const formatRupiah = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
const formatDate = (dateString) => new Date(dateString).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });

const SalesReport = ({ cabangId, token }) => {
  const [transaksiData, setTransaksiData] = useState([]);
  const [pengeluaranData, setPengeluaranData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [transaksiPage, setTransaksiPage] = useState(1);
  const [transaksiTotalPages, setTransaksiTotalPages] = useState(1);
  const transaksiItemsPerPage = 10;
  
  const [pengeluaranPage, setPengeluaranPage] = useState(1);
  const [pengeluaranTotalPages, setPengeluaranTotalPages] = useState(1);
  const pengeluaranItemsPerPage = 10;

  useEffect(() => {
    if (!cabangId || !token) return;
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/reports/cabang/${cabangId}/sales/transactions?page=${transaksiPage}&limit=${transaksiItemsPerPage}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setTransaksiData(res.data.data);
        setTransaksiTotalPages(res.data.last_page);
      } catch (err) {
        setError("Gagal mengambil data transaksi.");
      }
    };

    const fetchExpenses = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/reports/cabang/${cabangId}/sales/expenses?page=${pengeluaranPage}&limit=${pengeluaranItemsPerPage}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setPengeluaranData(res.data.data);
        setPengeluaranTotalPages(res.data.last_page);
      } catch (err) {
        setError("Gagal mengambil data pengeluaran.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
    fetchExpenses();
  }, [cabangId, token, transaksiPage, pengeluaranPage]);

  const handleTransaksiPageChange = (page) => {
    if (page >= 1 && page <= transaksiTotalPages) {
      setTransaksiPage(page);
    }
  };

  const handlePengeluaranPageChange = (page) => {
    if (page >= 1 && page <= pengeluaranTotalPages) {
      setPengeluaranPage(page);
    }
  };

  const Pagination = ({ currentPage, totalPages, onPageChange }) => (
    <div className="flex justify-center mt-4">
      <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Sebelumnya
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => onPageChange(i + 1)}
            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
              i + 1 === currentPage 
                ? 'z-10 bg-red-50 border-red-500 text-red-600' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-4 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Berikutnya
        </button>
      </nav>
    </div>
  );

  if (loading) return (
    <div className="flex justify-center items-center h-40 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <Loader2 className="animate-spin text-red-600 w-6 h-6 mr-3" />
      <span className="text-gray-600">Memuat data penjualan...</span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col justify-center items-center h-40 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <ServerCrash size={32} className="text-red-500 mb-3" />
      <p className="text-red-700 font-medium">{error}</p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Transactions Table */}
      <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <TrendingUp size={20} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-800">Riwayat Transaksi</h3>
              <p className="text-sm text-red-600">Data transaksi penjualan</p>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Kode
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Tanggal & Waktu
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Metode
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transaksiData.length > 0 ? (
                transaksiData.map((item, index) => (
                  <motion.tr 
                    key={item.kode_transaksi} 
                    className="hover:bg-orange-50 transition-colors group"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-gray-400" />
                        <code className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {item.kode_transaksi}
                        </code>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} className="text-gray-400" />
                        {formatDate(item.tanggal_waktu)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CreditCard size={16} className="text-gray-400" />
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {item.metode_pembayaran}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-orange-600">
                        {formatRupiah(item.total_harga)}
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    <TrendingUp size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-lg font-medium">Tidak ada transaksi ditemukan</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {transaksiData.length > 0 && transaksiTotalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={transaksiPage}
              totalPages={transaksiTotalPages}
              onPageChange={handleTransaksiPageChange}
            />
          </div>
        )}
      </div>

      {/* Expenses Table */}
      <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <TrendingDown size={20} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-800">Riwayat Pengeluaran</h3>
              <p className="text-sm text-red-600">Data pengeluaran operasional</p>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Jenis
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Keterangan
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Jumlah
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pengeluaranData.length > 0 ? (
                pengeluaranData.map((item, index) => (
                  <motion.tr 
                    key={index} 
                    className="hover:bg-red-50 transition-colors group"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} className="text-gray-400" />
                        {new Date(item.tanggal).toLocaleDateString('id-ID', {dateStyle: 'long'})}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        {item.jenis}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600 max-w-xs">{item.keterangan}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-red-600">
                        {formatRupiah(item.jumlah)}
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    <TrendingDown size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-lg font-medium">Tidak ada pengeluaran ditemukan</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {pengeluaranData.length > 0 && pengeluaranTotalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={pengeluaranPage}
              totalPages={pengeluaranTotalPages}
              onPageChange={handlePengeluaranPageChange}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SalesReport;