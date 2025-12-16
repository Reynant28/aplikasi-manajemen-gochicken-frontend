import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, ServerCrash } from 'lucide-react';
//eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const API_URL = "http://localhost:8000/api";
const formatRupiah = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
const formatDate = (dateString) => new Date(dateString).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });

const SalesReport = ({ cabangId, token }) => {
  const [transaksiData, setTransaksiData] = useState([]);
  const [pengeluaranData, setPengeluaranData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for Transactions Pagination
  const [transaksiPage, setTransaksiPage] = useState(1);
  const [transaksiTotalPages, setTransaksiTotalPages] = useState(1);
  const transaksiItemsPerPage = 10;
  
  // State for Expenses Pagination
  const [pengeluaranPage, setPengeluaranPage] = useState(1);
  const [pengeluaranTotalPages, setPengeluaranTotalPages] = useState(1);
  const pengeluaranItemsPerPage = 10;

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        // PERUBAHAN: Gunakan endpoint paginasi dan tambahkan parameter
        const res = await axios.get(`${API_URL}/reports/sales/transactions?page=${transaksiPage}&limit=${transaksiItemsPerPage}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // PERUBAHAN: Ambil data dan metadata dari respons paginasi
        setTransaksiData(res.data.data);
        setTransaksiTotalPages(res.data.last_page);
        //eslint-disable-next-line
      } catch (err) {
        setError("Gagal mengambil data transaksi.");
      }
    };

    const fetchExpenses = async () => {
      setLoading(true);
      try {
        // PERUBAHAN: Gunakan endpoint paginasi dan tambahkan parameter
        const res = await axios.get(`${API_URL}/reports/sales/expenses?page=${pengeluaranPage}&limit=${pengeluaranItemsPerPage}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // PERUBAHAN: Ambil data dan metadata dari respons paginasi
        setPengeluaranData(res.data.data);
        setPengeluaranTotalPages(res.data.last_page);
        //eslint-disable-next-line
      } catch (err) {
        setError("Gagal mengambil data pengeluaran.");
      } finally {
        setLoading(false);
      }
    };
    
    // Panggil kedua fungsi fetch data secara terpisah
    fetchTransactions();
    fetchExpenses();

  }, [token, transaksiPage, pengeluaranPage]);

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
      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Sebelumnya
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => onPageChange(i + 1)}
            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
              i + 1 === currentPage ? 'z-10 bg-orange-50 border-orange-500 text-orange-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Berikutnya
        </button>
      </nav>
    </div>
  );

  if (loading) return <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin text-orange-600" /></div>;
  if (error) return <div className="flex flex-col justify-center items-center h-40 text-red-600"><ServerCrash size={32} /><p className="mt-2">{error}</p></div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Transactions Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Riwayat Transaksi</h3>
        <div className="overflow-x-auto bg-white rounded-lg border">
          <table className="min-w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Kode</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Tanggal & Waktu</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Metode</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transaksiData.length > 0 ? (
                transaksiData.map((item) => (
                  <tr key={item.kode_transaksi} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-500">{item.kode_transaksi}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{formatDate(item.tanggal_waktu)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{item.metode_pembayaran}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{formatRupiah(item.total_harga)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">Tidak ada transaksi ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {transaksiData.length > 0 && transaksiTotalPages > 1 && (
          <Pagination
            currentPage={transaksiPage}
            totalPages={transaksiTotalPages}
            onPageChange={handleTransaksiPageChange}
          />
        )}
      </div>

      {/* Expenses Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Riwayat Pengeluaran</h3>
        <div className="overflow-x-auto bg-white rounded-lg border">
          <table className="min-w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pengeluaranData.length > 0 ? (
                pengeluaranData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(item.tanggal).toLocaleDateString('id-ID', {dateStyle: 'long'})}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{item.jenis}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{item.keterangan}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-red-600">{formatRupiah(item.jumlah)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">Tidak ada pengeluaran ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {pengeluaranData.length > 0 && pengeluaranTotalPages > 1 && (
          <Pagination
            currentPage={pengeluaranPage}
            totalPages={pengeluaranTotalPages}
            onPageChange={handlePengeluaranPageChange}
          />
        )}
      </div>
    </motion.div>
  );
};

export default SalesReport;