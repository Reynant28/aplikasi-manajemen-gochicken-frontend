import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, ServerCrash, Package, Tag, DollarSign, Box } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = "http://localhost:8000/api";
const formatRupiah = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

const ProductReport = ({ cabangId, token }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!cabangId || !token) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/reports/cabang/${cabangId}/products?page=${currentPage}&limit=${itemsPerPage}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setData(res.data.data);
        setTotalPages(res.data.last_page);
      } catch (err) {
        setError("Gagal mengambil data produk.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cabangId, token, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const Pagination = () => (
    <div className="flex justify-center mt-6">
      <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Sebelumnya
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => handlePageChange(i + 1)}
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
          onClick={() => handlePageChange(currentPage + 1)}
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
      <span className="text-gray-600">Memuat data produk...</span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col justify-center items-center h-40 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <ServerCrash size={32} className="text-red-500 mb-3" />
      <p className="text-red-700 font-medium">{error}</p>
    </div>
  );

  if (data.length === 0) return (
    <div className="p-6 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <Package size={48} className="mx-auto text-gray-300 mb-3" />
      <p className="text-lg font-medium">Tidak ada data produk ditemukan</p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <Package size={20} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-800">Data Produk</h3>
              <p className="text-sm text-red-600">Daftar lengkap produk cabang</p>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Produk
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Kategori
                </th>  
                <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Harga
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Stok
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item, index) => (
                <motion.tr 
                  key={index} 
                  className="hover:bg-red-50 transition-colors group"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <Package size={16} className="text-red-600" />
                      </div>
                      <span className="font-semibold text-gray-900 group-hover:text-red-700 transition-colors">
                        {item.nama_produk}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-gray-400" />
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {item.kategori}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 font-semibold text-orange-600">
                      <DollarSign size={16} />
                      {formatRupiah(item.harga)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Box size={16} className="text-gray-400" />
                      <span className={`font-semibold ${
                        item.jumlah_stok > 10 ? 'text-orange-600' : 
                        item.jumlah_stok > 5 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {item.jumlah_stok} unit
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {data.length > 0 && totalPages > 1 && <Pagination />}
    </motion.div>
  );
};

export default ProductReport;