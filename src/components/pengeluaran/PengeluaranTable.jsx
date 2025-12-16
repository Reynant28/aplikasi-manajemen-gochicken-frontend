import React, { useState, useMemo } from 'react';
//eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Edit, Trash2, ChevronLeft, ChevronRight, AlertTriangle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const ITEMS_PER_PAGE = 5;

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
    return pengeluaranList.filter(p =>
      p.keterangan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.jenis_pengeluaran && p.jenis_pengeluaran.jenis_pengeluaran?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [pengeluaranList, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  return (
    <div className="space-y-4">
      {/* Pencarian */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari berdasarkan keterangan atau jenis..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition text-gray-900 placeholder:text-gray-400"
        />
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200" id="pengeluaran-table">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Detail Pengeluaran
              </th>

              {/* Kolom Cabang hanya muncul untuk super admin */}
              {role === "super admin" && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cabang
                </th>
              )}

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jumlah
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-gray-900">
                        {p.jenis_pengeluaran?.jenis_pengeluaran || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-xs">
                        {p.keterangan || '-'}
                      </p>
                    </td>

                    {/* Kolom cabang hanya untuk super admin */}
                    {role === "super admin" && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {p.cabang?.nama_cabang || "-"}
                      </td>
                    )}

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {format(new Date(p.tanggal), 'dd/MM/yyyy', { locale: id })}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                      {formatRupiah(p.jumlah)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => onView(p)}
                          className="p-2 text-blue-600 hover:text-blue-800 transition-colors rounded-full hover:bg-blue-100"
                          title="Lihat Detail"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => onEdit(p)}
                          className="p-2 text-yellow-600 hover:text-yellow-800 transition-colors rounded-full hover:bg-yellow-100"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(p)}
                          className="p-2 text-red-600 hover:text-red-800 transition-colors rounded-full hover:bg-red-100"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={role === "super admin" ? 6 : 5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3 text-gray-500">
                      <AlertTriangle size={32} />
                      <p className="font-semibold">Tidak ada data pengeluaran.</p>
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
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeft size={16} /> Back
          </button>

          <span className="text-sm text-gray-700">
            Halaman <b>{currentPage}</b> - <b>{totalPages}</b>
          </span>

          <button
            onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PengeluaranTable;