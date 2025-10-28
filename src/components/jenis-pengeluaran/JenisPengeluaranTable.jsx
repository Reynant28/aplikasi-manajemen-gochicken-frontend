import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';

const JenisPengeluaranTable = ({ 
  data, 
  loading, 
  currentPage, 
  itemsPerPage, 
  onPageChange, 
  onEdit, 
  onDelete 
}) => {
  // Pagination logic
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = data.slice(indexOfFirst, indexOfLast);

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const pages = [];

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const startPage = Math.max(2, currentPage - Math.floor((maxPagesToShow - 3) / 2));
      const endPage = Math.min(totalPages - 1, currentPage + Math.ceil((maxPagesToShow - 3) / 2));

      pages.push(1);
      if (startPage > 2) pages.push("...");
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      if (endPage < totalPages - 1) pages.push("...");
      if (totalPages > 1) pages.push(totalPages);
    }

    return pages.filter((v, i, s) => s.indexOf(v) === i);
  };

  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Daftar Jenis Pengeluaran</h3>
          <p className="text-sm text-gray-600">{data.length} jenis ditemukan</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Jenis Pengeluaran
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8">
                      <div className="flex items-center justify-center text-gray-500">
                        <div className="flex items-center justify-center h-64 text-gray-500"><RefreshCw className="animate-spin h-6 w-6 mr-3" /> Memuat...</div>
                      </div>
                    </td>
                  </tr>
                ) : currentData.length > 0 ? (
                  currentData.map((item, index) => (
                    <motion.tr
                      key={item.id_jenis}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {indexOfFirst + index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{item.jenis_pengeluaran}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onEdit(item)}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onDelete(item.id_jenis)}
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
                    <td colSpan={3} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <AlertTriangle size={40} />
                        <div>
                          <p className="font-semibold text-gray-500">Tidak ada data jenis pengeluaran</p>
                          <p className="text-sm text-gray-400 mt-1">
                            Mulai dengan menambahkan jenis pengeluaran baru
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
                Menampilkan <span className="font-semibold">{indexOfFirst + 1}</span> -{" "}
                <span className="font-semibold">
                  {Math.min(indexOfLast, data.length)}
                </span>{" "}
                dari <span className="font-semibold">{data.length}</span> jenis
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Sebelumnya
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index, array) => (
                    <React.Fragment key={index}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => typeof page === "number" && changePage(page)}
                        disabled={page === "..."}
                        className={`px-3 py-1 text-sm rounded ${
                          currentPage === page
                            ? 'bg-gray-700 text-white font-semibold'
                            : 'text-gray-600 hover:bg-gray-100'
                        } ${page === "..." ? 'cursor-default' : ''}`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
                </div>

                <button
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JenisPengeluaranTable;