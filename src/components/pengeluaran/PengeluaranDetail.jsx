// components/pengeluaran/DetailModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Tag, Calendar, FileText } from "lucide-react";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const formatRupiah = (value) => new Intl.NumberFormat("id-ID", { 
    style: "currency", 
    currency: "IDR", 
    maximumFractionDigits: 0 
}).format(value);

const PengeluaranDetail = ({ isOpen, onClose, data }) => {
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
            initial={{ scale: 0.9, y: 20 }} 
            animate={{ scale: 1, y: 0 }} 
            exit={{ scale: 0.9, y: 20 }} 
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Detail Pengeluaran</h2>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Tag size={14}/>
                  Jenis: <strong className="text-gray-800">{data?.jenis_pengeluaran?.jenis_pengeluaran}</strong>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar size={14}/>
                  Tanggal: <strong className="text-gray-800">
                    {data?.tanggal ? format(new Date(data.tanggal), 'd MMMM yyyy', { locale: id }) : 'N/A'}
                  </strong>
                </div>
              </div>
              <div>
                <p className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText size={14}/> Keterangan:
                </p>
                <p className="p-3 bg-gray-50 rounded-lg mt-1 text-gray-800">{data?.keterangan}</p>
              </div>
              
              {data?.details && data.details.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-md font-semibold mb-3 text-gray-800">Rincian Pembelian Bahan Baku</h3>
                  <div className="border rounded-lg overflow-hidden bg-white">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold text-gray-600">Bahan</th>
                          <th className="px-4 py-2 text-center font-semibold text-gray-600">Jumlah</th>
                          <th className="px-4 py-2 text-right font-semibold text-gray-600">Harga Satuan</th>
                          <th className="px-4 py-2 text-right font-semibold text-gray-600">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.details.map(d => (
                          <tr key={d.id_detail_pengeluaran} className="border-t border-gray-200">
                            <td className="px-4 py-2 text-gray-700">{d.bahan_baku?.nama_bahan || 'N/A'}</td>
                            <td className="px-4 py-2 text-center text-gray-700">{d.jumlah_item}</td>
                            <td className="px-4 py-2 text-right text-gray-700">{formatRupiah(d.harga_satuan)}</td>
                            <td className="px-4 py-2 text-right font-semibold text-gray-800">{formatRupiah(d.total_harga)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <div className="pt-4 text-right border-t border-gray-200">
                <p className="text-gray-600">Total Pengeluaran</p>
                <p className="text-3xl font-bold text-gray-700">{formatRupiah(data?.jumlah)}</p>
              </div>
            </div>
            <div className="p-6 bg-gray-50 rounded-b-xl flex justify-end">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
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

export default PengeluaranDetail;