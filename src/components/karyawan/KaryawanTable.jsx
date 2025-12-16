// components/karyawan/KaryawanTable.jsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Edit, Trash2, ChevronLeft, ChevronRight, AlertTriangle, User, Phone, MapPin, DollarSign } from 'lucide-react';

const ITEMS_PER_PAGE = 5;

const formatRupiah = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

const KaryawanTable = ({ karyawanList, onEdit, onDelete, theme }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredKaryawan = useMemo(() => {
    return karyawanList.filter(k =>
      k.nama_karyawan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.telepon.includes(searchTerm) ||
      k.alamat.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [karyawanList, searchTerm]);

  const totalPages = Math.ceil(filteredKaryawan.length / ITEMS_PER_PAGE);

  const paginatedKaryawan = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredKaryawan.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredKaryawan, currentPage]);

  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  return (
    <div className="p-6 space-y-4">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari karyawan..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className={`w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none text-gray-900 placeholder-gray-500 ${theme.ring}`}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Karyawan
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                Kontak
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                Gaji
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <AnimatePresence>
              {paginatedKaryawan.length > 0 ? (
                paginatedKaryawan.map((k) => (
                  <motion.tr 
                    key={k.id_karyawan} 
                    layout 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${theme.primaryLight} rounded-full flex items-center justify-center`}>
                          <User className={`w-5 h-5 ${theme.primaryText}`} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{k.nama_karyawan}</div>
                          <div className="text-xs text-gray-500 lg:hidden flex items-center gap-1 mt-1">
                            <DollarSign className="w-3 h-3" />
                            {formatRupiah(k.gaji)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">
                      <div className="flex items-center gap-2 mb-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{k.telepon}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs">{k.alamat}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        {formatRupiah(k.gaji)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center gap-1">
                        <button 
                          onClick={() => onEdit(k)} 
                          className="p-2 text-yellow-600 hover:text-orange-800 transition-colors rounded-lg hover:bg-orange-50"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => onDelete(k)} 
                          className="p-2 text-red-600 hover:text-red-800 transition-colors rounded-lg hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-12">
                    <div className="flex flex-col items-center gap-3 text-gray-500">
                      <AlertTriangle size={32} className="text-gray-400" />
                      <p className="font-semibold">Tidak ada karyawan ditemukan.</p>
                      <p className="text-sm text-gray-400">Coba ubah kata kunci pencarian</p>
                    </div>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button 
            onClick={handlePrevPage} 
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
            Sebelumnya
          </button>
          <span className="text-sm text-gray-700">
            Halaman <span className="font-semibold">{currentPage}</span> dari <span className="font-semibold">{totalPages}</span>
          </span>
          <button 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Berikutnya
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default KaryawanTable;