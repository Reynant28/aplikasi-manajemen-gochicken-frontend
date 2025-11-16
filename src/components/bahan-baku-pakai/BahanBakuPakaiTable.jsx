import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, Package, LoaderCircle } from 'lucide-react';

const formatRupiah = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

const BahanBakuPakaiTable = ({ data, loading, onDelete }) => {
  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Daftar Pemakaian</h3>
          <p className="text-sm text-gray-600">{data.length} item ditemukan</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-aut [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Bahan Baku
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Satuan
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Harga Satuan
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Jumlah Pakai
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total Modal
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Catatan
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
                    <td colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-md border border-gray-100">
                        <div className="text-center">
                            <div className="flex items-center justify-center h-64 text-gray-500"><LoaderCircle className="animate-spin h-6 w-6 mr-3" /> Memuat...</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : data.length > 0 ? (
                  data.map((item, index) => (
                    <motion.tr
                      key={item.id_pemakaian}
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
                          </div>
                        </div>
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

                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-gray-700">
                          {Number(item.jumlah_pakai) % 1 === 0
                            ? Number(item.jumlah_pakai)
                            : Number(item.jumlah_pakai).toFixed(1)} pcs
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-gray-900">
                          {formatRupiah(item.total_modal)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {item.catatan || "-"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onDelete(item.id_pemakaian)}
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
                    <td colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <AlertTriangle size={40} />
                        <div>
                          <p className="font-semibold text-gray-500">Tidak ada data pemakaian</p>
                          <p className="text-sm text-gray-400 mt-1">
                            Mulai dengan menambahkan pemakaian baru
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
      </div>
    </div>
  );
};

export default BahanBakuPakaiTable;