// src/components/kasir/KasirTable.jsx
import React, { useState, useMemo } from 'react';
//eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Edit, Trash2, ChevronLeft, ChevronRight, AlertTriangle, User, Mail, Store } from 'lucide-react';

const ITEMS_PER_PAGE = 5;

const KasirTable = ({ kasirList, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredKasir = useMemo(() => {
    return kasirList.filter(k =>
      k.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [kasirList, searchTerm]);

  const totalPages = Math.ceil(filteredKasir.length / ITEMS_PER_PAGE);

  const paginatedKasir = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredKasir.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredKasir, currentPage]);

  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama atau email kasir..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition text-gray-900 placeholder:text-gray-400"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kasir</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Kontak</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Cabang</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <AnimatePresence>
              {paginatedKasir.length > 0 ? (
                paginatedKasir.map((k) => (
                  <motion.tr key={k.id_user} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="even:bg-gray-50/50 hover:bg-red-50/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                              <div className="text-sm font-semibold text-gray-900">{k.nama}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-1 md:hidden">
                                <Mail size={12} />
                                {k.email}
                              </div>
                          </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-gray-400" />
                          {k.email}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <Store size={14} className="text-gray-400" />
                          ID: {k.id_cabang}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center items-center gap-2">
                          <button onClick={() => onEdit(k)} className="p-2 text-yellow-600 hover:text-yellow-800 transition-colors rounded-full hover:bg-yellow-100">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => onDelete(k)} className="p-2 text-red-600 hover:text-red-800 transition-colors rounded-full hover:bg-red-100">
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
                      <AlertTriangle size={32} />
                      <p className="font-semibold">Tidak ada kasir ditemukan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
            <button onClick={handlePrevPage} disabled={currentPage === 1} className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50">
                <ChevronLeft size={16} /> 
                <span className="hidden sm:inline">Sebelumnya</span>
            </button>
            <span className="text-sm text-gray-700"> Halaman <b>{currentPage}</b> dari <b>{totalPages}</b> </span>
            <button onClick={handleNextPage} disabled={currentPage === totalPages} className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50">
                <span className="hidden sm:inline">Berikutnya</span>
                <ChevronRight size={16} />
            </button>
        </div>
      )}
    </div>
  );
};

export default KasirTable;