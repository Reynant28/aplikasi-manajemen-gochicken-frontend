import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Edit, Trash2, ChevronLeft, ChevronRight, AlertTriangle, Eye, Calendar, Tag, FileText, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const ITEMS_PER_PAGE = 10;

const formatRupiah = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

const PengeluaranTable = ({ pengeluaranList, onEdit, onDelete, onView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Ambil role user dari localStorage
  const role = JSON.parse(localStorage.getItem("user"))?.role || "";

  const filteredData = useMemo(() => {
    if (!pengeluaranList) return [];
    
    const filtered = pengeluaranList.filter(p =>
      p.keterangan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.jenis_pengeluaran?.jenis_pengeluaran?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cabang?.nama_cabang?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Sorting: tanggal terbaru di atas
    return filtered.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  }, [pengeluaranList, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  return (
    <div className="space-y-6">
      {/* Header dan Pencarian */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Daftar Pengeluaran</h3>
          <p className="text-sm text-gray-600">{filteredData.length} transaksi ditemukan</p>
        </div>
        
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari pengeluaran..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition text-gray-900 placeholder:text-gray-400 text-sm"
          />
        </div>
      </div>

      {/* Tabel */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Transaksi
                </th>
                
                {role === "super admin" && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Cabang
                  </th>
                )}

                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                  Tanggal
                </th>
                
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Jumlah
                </th>
                
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence>
                {paginatedData.length > 0 ? (
                  paginatedData.map((p, index) => (
                    <motion.tr
                      key={p.id_pengeluaran}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <DollarSign className="h-4 w-4 text-gray-600" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {p.jenis_pengeluaran?.jenis_pengeluaran || "N/A"}
                            </p>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {p.keterangan}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 lg:hidden">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {format(new Date(p.tanggal), 'd MMM yyyy', { locale: id })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Kolom cabang hanya untuk super admin */}
                      {role === "super admin" && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-gray-100 rounded">
                              <Tag className="h-3 w-3 text-gray-600" />
                            </div>
                            <span className="text-sm text-gray-700 font-medium">
                              {p.cabang?.nama_cabang || "-"}
                            </span>
                          </div>
                        </td>
                      )}

                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} />
                          {format(new Date(p.tanggal), 'EEEE, d MMM yyyy', { locale: id })}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-gray-900">
                          {formatRupiah(p.jumlah)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-1">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onView(p)}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye size={16} />
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onEdit(p)}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onDelete(p)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={role === "super admin" ? 5 : 4} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <AlertTriangle size={40} />
                        <div>
                          <p className="font-semibold text-gray-500">Tidak ada data pengeluaran</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {searchTerm ? 'Coba ubah kata kunci pencarian' : 'Mulai dengan menambahkan pengeluaran baru'}
                          </p>
                        </div>
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
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Menampilkan <span className="font-semibold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> -{" "}
                <span className="font-semibold">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)}
                </span>{" "}
                dari <span className="font-semibold">{filteredData.length}</span> transaksi
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} />
                  Sebelumnya
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => 
                      page === 1 || 
                      page === totalPages || 
                      Math.abs(page - currentPage) <= 1
                    )
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 text-sm rounded ${
                            currentPage === page
                              ? 'bg-gray-700 text-white font-semibold'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                </div>

                <button
                  onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Berikutnya
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PengeluaranTable;