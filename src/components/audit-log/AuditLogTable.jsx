import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, RefreshCw, FileText, User, Calendar, ChevronLeft, ChevronRight, LoaderCircle, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

const AuditLogTable = ({ data, loading, error, pagination, onPageChange, onViewDetails }) => {
  const getTypeColor = (type) => {
    switch (type) {
      case 'created': return 'bg-green-100 text-green-700 border-green-200';
      case 'updated': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'deleted': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'created': return 'Tambah';
      case 'updated': return 'Update';
      case 'deleted': return 'Hapus';
      default: return type;
    }
  };

  const getModelColor = (model) => {
    const colors = {
      'KaryawanModel': 'bg-purple-100 text-purple-700 border-purple-200',
      'ProdukModel': 'bg-orange-100 text-orange-700 border-orange-200',
      'PengeluaranModel': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'UsersModel': 'bg-cyan-100 text-cyan-700 border-cyan-200',
      'CabangModel': 'bg-pink-100 text-pink-700 border-pink-200',
      'TransaksiModel': 'bg-indigo-100 text-indigo-700 border-indigo-200'
    };
    return colors[model] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const pages = [];

    if (pagination.last_page <= maxPagesToShow) {
      for (let i = 1; i <= pagination.last_page; i++) pages.push(i);
    } else {
      const startPage = Math.max(2, pagination.current_page - Math.floor((maxPagesToShow - 3) / 2));
      const endPage = Math.min(pagination.last_page - 1, pagination.current_page + Math.ceil((maxPagesToShow - 3) / 2));

      pages.push(1);
      if (startPage > 2) pages.push("...");
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      if (endPage < pagination.last_page - 1) pages.push("...");
      if (pagination.last_page > 1) pages.push(pagination.last_page);
    }

    return pages.filter((v, i, s) => s.indexOf(v) === i);
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Waktu
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              <AnimatePresence>
                {error ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <motion.div 
                        className="p-5 bg-red-50 text-red-700 rounded-2xl border-2 border-red-200 flex items-start gap-3 shadow-md"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="p-2 bg-red-100 rounded-lg">
                          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-lg mb-1">Terjadi Kesalahan</p>
                          <p className="text-sm">{error}</p>
                        </div>
                      </motion.div>
                    </td>
                  </tr>
                ) : null}
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-md border border-gray-100">
                        <div className="text-center">
                            <div className="flex items-center justify-center h-64 text-gray-500"><LoaderCircle className="animate-spin h-6 w-6 mr-3" /> Memuat...</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : data.length > 0 ? (
                  data.map((log, index) => (
                    <motion.tr
                      key={log.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {format(parseISO(log.timestamp), 'dd MMM yyyy', { locale: id })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {format(parseISO(log.timestamp), 'HH:mm', { locale: id })} WIB
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getTypeColor(log.type)}`}>
                          {getTypeText(log.type)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getModelColor(log.model)}`}>
                          {log.model.replace('Model', '')}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 max-w-md line-clamp-2">
                          {log.description}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="font-medium">{log.user}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => onViewDetails(log)}
                            disabled={!log.old_data && !log.new_data}
                            className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition ${
                              !log.old_data && !log.new_data
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-600 text-white hover:bg-gray-700'
                            }`}
                            title="Lihat Detail"
                          >
                            <Eye size={14} /> Detail
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <FileText size={48} />
                        <div>
                          <p className="font-semibold text-gray-500">Tidak ada data audit log</p>
                          <p className="text-sm text-gray-400 mt-1">
                            Tidak ada aktivitas yang tercatat
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
        {pagination.last_page > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Menampilkan <span className="font-semibold text-gray-800">
                  {(pagination.current_page - 1) * pagination.per_page + 1}
                </span> -{" "}
                <span className="font-semibold text-gray-800">
                  {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                </span>{" "}
                dari <span className="font-semibold text-gray-800">{pagination.total.toLocaleString()}</span> log
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className={`p-2 rounded-lg transition ${
                    pagination.current_page === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, i) => (
                    <button
                      key={i}
                      onClick={() => typeof page === "number" && onPageChange(page)}
                      disabled={page === "..."}
                      className={`min-w-[36px] px-3 py-2 text-sm font-medium rounded-lg transition ${
                        pagination.current_page === page
                          ? 'bg-gray-700 text-white'
                          : page === "..."
                          ? 'text-gray-400 cursor-default'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => onPageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className={`p-2 rounded-lg transition ${
                    pagination.current_page === pagination.last_page
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogTable;