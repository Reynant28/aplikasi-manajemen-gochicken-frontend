import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, ServerCrash } from 'lucide-react';
//eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const API_URL = "http://localhost:8000/api";
const formatRupiah = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

const EmployeeReport = ({ cabangId, token }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // PERUBAHAN: Gunakan endpoint paginasi dan tambahkan parameter
        const res = await axios.get(`${API_URL}/reports/employees?page=${currentPage}&limit=${itemsPerPage}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // PERUBAHAN: Ambil data dan metadata dari respons paginasi
        setData(res.data.data);
        setTotalPages(res.data.last_page);
        //eslint-disable-next-line
      } catch (err) {
        setError("Gagal mengambil data karyawan.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // PERUBAHAN: Tambahkan `currentPage` sebagai dependency
  }, [ token, currentPage]);

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
              i + 1 === currentPage ? 'z-10 bg-gray-50 border-gray-500 text-gray-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
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
  
  if (loading) return <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin text-gray-600" /></div>;
  if (error) return <div className="flex flex-col justify-center items-center h-40 text-red-600"><ServerCrash size={32} /><p className="mt-2">{error}</p></div>;
  if (data.length === 0) return <div className="p-4 text-center text-gray-500 bg-gray-100 rounded-lg">Tidak ada data karyawan ditemukan.</div>;

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
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Nama Karyawan</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Alamat</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Telepon</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Gaji</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.nama_karyawan}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{item.alamat}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{item.telepon}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{formatRupiah(item.gaji)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 0 && totalPages > 1 && <Pagination />}
    </motion.div>
  );
};

export default EmployeeReport;