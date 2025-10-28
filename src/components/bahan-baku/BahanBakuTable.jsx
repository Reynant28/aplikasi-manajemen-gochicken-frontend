import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, AlertTriangle, Package, RefreshCw } from 'lucide-react';

const formatRupiah = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

const BahanTable = ({ 
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

  const getStokStatus = (stok) => {
    if (stok < 5) return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    if (stok < 10) return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
  };

  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Daftar Bahan Baku</h3>
          <p className="text-sm text-gray-600">{data.length} bahan ditemukan</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Bahan
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Stok
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Satuan
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Harga Satuan
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
                    <td colSpan={5} className="text-center py-8">
                      <div className="flex items-center justify-center text-gray-500">
                        <div className="flex items-center justify-center h-64 text-gray-500"><RefreshCw className="animate-spin h-6 w-6 mr-3" /> Memuat...</div>
                      </div>
                    </td>
                  </tr>
                ) : currentData.length > 0 ? (
                  currentData.map((item, index) => {
                    const stokStatus = getStokStatus(item.jumlah_stok);
                    return (
                      <motion.tr
                        key={item.id_bahan_baku}
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
                                <Package className="h-4 w-4 text-gray-600" />
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-900">
                                {item.nama_bahan}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                ID: {item.id_bahan_baku}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${stokStatus.bg} ${stokStatus.color} ${stokStatus.border}`}>
                            {item.jumlah_stok}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">
                            {Number(item.satuan) % 1 === 0
                              ? Number(item.satuan)
                              : Number(item.satuan).toFixed(1)} kg
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatRupiah(item.harga_satuan)}
                          </span>
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
                              onClick={() => onDelete(item.id_bahan_baku)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <AlertTriangle size={40} />
                        <div>
                          <p className="font-semibold text-gray-500">Tidak ada data bahan baku</p>
                          <p className="text-sm text-gray-400 mt-1">
                            Mulai dengan menambahkan bahan baku baru
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
                dari <span className="font-semibold">{data.length}</span> bahan
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

export default BahanTable;