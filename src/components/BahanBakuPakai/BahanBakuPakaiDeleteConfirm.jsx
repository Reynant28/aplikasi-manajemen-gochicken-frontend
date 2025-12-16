// src/components/BahanBakuPakai/BahanBakuPakaiDeleteConfirm.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle } from "lucide-react";

export default function BahanBakuPakaiDeleteConfirm({
  isOpen,
  confirmDelete,
  onClose,
  onConfirm,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto border-l-4 border-orange-500 overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Header */}
            <div className="bg-orange-50 p-6 flex items-center gap-4 border-b border-orange-100">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl">
                <AlertTriangle size={24} className="text-orange-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-orange-800">Konfirmasi Hapus</h4>
                <p className="text-orange-600 text-sm">Pemakaian Harian</p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-gray-700 text-base leading-relaxed">
                Yakin ingin menghapus pemakaian{" "}
                <span className="font-semibold text-orange-600">
                  {confirmDelete.name}
                </span>
                ?
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Data yang dihapus tidak dapat dikembalikan.
              </p>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                >
                  Batal
                </button>
                <button
                  onClick={onConfirm}
                  className="px-5 py-2.5 text-sm font-medium rounded-xl text-white bg-orange-500 hover:bg-orange-600 transition-colors duration-200 flex items-center gap-2 shadow-md"
                >
                  <Trash2 size={16} />
                  Hapus
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}