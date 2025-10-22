import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Loader2, ServerCrash, Search, AlertTriangle, Building2 } from 'lucide-react';
//eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import Pagination from './Pagination.jsx';

const API_URL = "http://localhost:8000/api";
const formatRupiah = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

// Komponen untuk badge status stok
const StockBadge = ({ stock }) => {
    let bgColor, textColor, text;
    if (stock > 10) {
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        text = 'Tersedia';
    } else if (stock > 0) {
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        text = 'Stok Rendah';
    } else {
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        text = 'Habis';
    }
    return <span className={`px-2 py-1 text-xs font-medium rounded-md ${bgColor} ${textColor}`}>{text}</span>;
};

const ProductReport = ({ token }) => {
  const [data, setData] = useState([]);
  const [cabangList, setCabangList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCabang, setSelectedCabang] = useState('all');
  
  useEffect(() => {
    if (!token) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, cabangRes] = await Promise.all([
          axios.get(`${API_URL}/reports/products?limit=1000`, { 
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/cabang`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setData(productsRes.data.data || []);
        setCabangList(cabangRes.data.data || []);
        //eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Gagal mengambil data produk.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    
    return data.filter(item => {
      const matchesSearch = 
        item.nama_produk.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cabang.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCabang = selectedCabang === 'all' || item.cabang === selectedCabang;
      
      return matchesSearch && matchesCabang;
    });
  }, [data, searchTerm, selectedCabang]);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
    setCurrentPage(1);
  }, [filteredData, itemsPerPage]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari produk, kategori, atau cabang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition text-gray-900 placeholder:text-gray-400"
            />
          </div>
          
          {/* Branch Filter */}
          <div className="relative w-full sm:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter Cabang</label>
            <div className="relative">
              <select 
                value={selectedCabang} 
                onChange={(e) => setSelectedCabang(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 appearance-none bg-white pr-10"
              >
                <option value="all">Semua Cabang</option>
                {cabangList.map((cabang) => (
                  <option key={cabang.id_cabang} value={cabang.nama_cabang}>
                    {cabang.nama_cabang}
                  </option>
                ))}
              </select>
              {/* Dropdown arrow icon */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 pt-5 text-gray-700">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
            <div className="flex justify-center items-center h-60"><Loader2 className="animate-spin text-red-600" /></div>
        ) : error ? (
            <div className="flex flex-col justify-center items-center h-60 text-red-600"><ServerCrash size={32} /><p className="mt-2">{error}</p></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Nama Produk</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} />
                        Cabang
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider">Harga</th>
                    <th className="px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wider">Stok</th>
                    <th className="px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item, index) => (
                      <tr key={index} className="even:bg-gray-50/50 hover:bg-red-50/50">
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{item.nama_produk}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{item.kategori}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          <div className="flex items-center gap-2">
                            <Building2 size={14} className="text-gray-400" />
                            {item.cabang}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 text-right">{formatRupiah(item.harga)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 text-center font-medium">{item.jumlah_stok}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <StockBadge stock={item.jumlah_stok} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                        <td colSpan="6" className="text-center py-12">
                            <div className="flex flex-col items-center gap-2 text-gray-500">
                                <AlertTriangle size={32} />
                                <p className="font-semibold">Tidak ada produk ditemukan</p>
                                <p className="text-xs">Coba ubah kata kunci pencarian atau filter cabang.</p>
                            </div>
                        </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {filteredData.length > 0 && totalPages > 1 && (
              <div className="p-4 border-t">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ProductReport;