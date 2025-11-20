// src/components/pemesanan/EditStatusModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const PemesananChangeStatus = ({ isOpen, onClose, onConfirm, data, isSubmitting }) => {
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
            className="bg-white rounded-xl shadow-2xl w-full max-w-md"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Ubah Status Pesanan</h2>
              <button 
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              <p className="text-sm text-gray-600 mb-6">
                Ubah status untuk pesanan <strong className="text-gray-800">{data?.kode_transaksi}</strong> 
                {' '}atas nama <strong className="text-gray-800">{data?.nama_pelanggan}</strong>.
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => onConfirm('OnLoan')}
                  className="px-4 py-3 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-yellow-600"
                  disabled={isSubmitting || data?.status_transaksi === 'OnLoan'}
                >
                  Ubah ke<br />On Loan
                </button>
                <button 
                  onClick={() => onConfirm('Selesai')}
                  className="px-4 py-3 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-green-700"
                  disabled={isSubmitting || data?.status_transaksi === 'Selesai'}
                >
                  Ubah ke<br />Selesai
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 rounded-b-xl border-t border-gray-200 text-center">
              <button 
                onClick={onClose}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                Batal
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PemesananChangeStatus;