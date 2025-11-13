// src/components/pemesanan/DetailModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const formatRupiah = (value) => new Intl.NumberFormat("id-ID", { 
  style: "currency", 
  currency: "IDR", 
  maximumFractionDigits: 0 
}).format(value);

const PemesananDetail = ({ isOpen, onClose, data }) => {
  if (!data) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          onMouseDown={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div 
            onMouseDown={e => e.stopPropagation()}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Detail Pemesanan</h2>
              <button 
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Order Information */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Tag size={14} className="text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Kode Transaksi</p>
                    <p className="font-semibold text-gray-800">{data?.kode_transaksi}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={14} className="text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Tanggal</p>
                    <p className="font-semibold text-gray-800">
                      {data?.tanggal_waktu ? 
                        format(new Date(data.tanggal_waktu), 'd MMM yyyy, HH:mm', { locale: id }) : 
                        'N/A'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FileText size={16} />
                  Informasi Pelanggan
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Nama Pelanggan:</span>
                    <span className="text-sm font-semibold text-gray-800">{data?.nama_pelanggan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Metode Pembayaran:</span>
                    <span className="text-sm font-semibold text-gray-800">{data?.metode_pembayaran}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-md ${
                      data?.status_transaksi === 'Selesai' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}>
                      {data?.status_transaksi === 'OnLoan' ? 'On Loan' : data?.status_transaksi}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Rincian Produk Dipesan
                </h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-600 text-xs uppercase">
                          Produk
                        </th>
                        <th className="px-4 py-2 text-center font-semibold text-gray-600 text-xs uppercase">
                          Jumlah
                        </th>
                        <th className="px-4 py-2 text-right font-semibold text-gray-600 text-xs uppercase">
                          Harga Satuan
                        </th>
                        <th className="px-4 py-2 text-right font-semibold text-gray-600 text-xs uppercase">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.details?.map((d, index) => (
                        <tr 
                          key={d.id_detail_transaksi} 
                          className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        >
                          <td className="px-4 py-2 text-gray-800">
                            {d.produk?.nama_produk || 'N/A'}
                          </td>
                          <td className="px-4 py-2 text-center text-gray-800">
                            {d.jumlah_produk}
                          </td>
                          <td className="px-4 py-2 text-right text-gray-800">
                            {formatRupiah(d.harga_item)}
                          </td>
                          <td className="px-4 py-2 text-right font-semibold text-gray-800">
                            {formatRupiah(d.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Price */}
              <div className="pt-4 text-right">
                <p className="text-gray-600 text-sm">Total Harga</p>
                <p className="text-3xl font-bold text-gray-800">
                  {formatRupiah(data?.total_harga)}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 rounded-b-xl border-t border-gray-200">
              <button 
                onClick={onClose}
                className="w-full px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PemesananDetail;