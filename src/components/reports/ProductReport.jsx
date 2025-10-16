import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, ServerCrash } from 'lucide-react';
//eslint-disable-next-line no-unused-vars
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
        // PERUBAHAN: Gunakan endpoint paginasi dan tambahkan parameter
        const res = await axios.get(`${API_URL}/reports/cabang/${cabangId}/products?page=${currentPage}&limit=${itemsPerPage}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // PERUBAHAN: Ambil data dan metadata dari respons paginasi
        setData(res.data.data);
        setTotalPages(res.data.last_page);
        //eslint-disable-next-line
      } catch (err) {
        setError("Gagal mengambil data produk.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // PERUBAHAN: Tambahkan `currentPage` sebagai dependency
  }, [cabangId, token, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const Pagination = () => (
    <div className="flex justify-center mt-6">
      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Sebelumnya
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => handlePageChange(i + 1)}
            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
              i + 1 === currentPage ? 'z-10 bg-green-50 border-green-500 text-green-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Berikutnya
        </button>
      </nav>
    </div>
  );
  
  if (loading) return <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin text-green-600" /></div>;
  if (error) return <div className="flex flex-col justify-center items-center h-40 text-red-600"><ServerCrash size={32} /><p className="mt-2">{error}</p></div>;
  if (data.length === 0) return <div className="p-4 text-center text-gray-500 bg-gray-100 rounded-lg">Tidak ada data produk ditemukan.</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="overflow-x-auto bg-white rounded-lg border">
        <table className="min-w-full text-sm divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Nama Produk</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Kategori</th>  
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Harga</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Stok Saat Ini</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.nama_produk}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{item.kategori}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{formatRupiah(item.harga)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{item.jumlah_stok}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 0 && totalPages > 1 && <Pagination />}
    </motion.div>
  );
};

export default ProductReport;