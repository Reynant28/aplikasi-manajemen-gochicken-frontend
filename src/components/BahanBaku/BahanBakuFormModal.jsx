// src/components/BahanBaku/BahanBakuFormModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, X, Package, Loader2 } from "lucide-react";

// Helper function yang diimpor dari BahanPage
const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);

// Helper function untuk format angka tanpa .00
const formatNumber = (value) => {
  const num = Number(value);
  return num % 1 === 0 ? num.toString() : num.toString();
};

export default function BahanBakuFormModal({
  showForm,
  editBahan,
  formData,
  setEditBahan,
  setFormData,
  handleFormSubmit,
  closeModal,
  actionLoading,
  theme,
}) {
  const isEditing = !!editBahan;
  const currentData = isEditing ? editBahan : formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (isEditing) {
      setEditBahan((prev) => ({
        ...prev,
        [name]: name === "jumlah_stok" ? parseInt(value) || 0 : value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "jumlah_stok" ? parseInt(value) || 0 : value,
      }));
    }
  };

  // Fungsi khusus untuk handle input satuan (menghilangkan .00)
  const handleSatuanChange = (e) => {
    const { value } = e.target;
    // Konversi ke number lalu ke string untuk menghilangkan .00
    const formattedValue = value === "" ? "" : formatNumber(parseFloat(value) || 0);
    
    if (isEditing) {
      setEditBahan((prev) => ({
        ...prev,
        satuan: formattedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        satuan: formattedValue,
      }));
    }
  };

  // Format nilai satuan untuk ditampilkan di input
  const getDisplaySatuan = () => {
    const satuanValue = currentData.satuan || "";
    if (satuanValue === "") return "";
    
    const num = Number(satuanValue);
    return isNaN(num) ? satuanValue : formatNumber(num);
  };

  return (
    <AnimatePresence>
      {showForm && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
        >
          <motion.div
            className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto border-t-4 ${theme.modalBorder} relative max-h-[95vh] flex flex-col`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className={`bg-gradient-to-r ${theme.cardGradient} p-6 text-white flex-shrink-0`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isEditing ? <Edit size={24} /> : <Package size={24} />}
                  <h2 className="text-2xl font-bold">
                    {isEditing ? "Edit Bahan" : "Tambah Bahan Baru"}
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-full transition bg-white/20 hover:bg-white/30"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto p-6">
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nama Bahan */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nama Bahan *
                      </label>
                      <input
                        type="text"
                        name="nama_bahan"
                        value={currentData.nama_bahan || ""}
                        onChange={handleChange}
                        className={`w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 ${theme.focusRing} focus:border-transparent text-gray-900 transition`}
                        placeholder="Masukkan nama bahan"
                        required
                      />
                    </div>

                    {/* Jumlah Stok */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Jumlah Stok *
                      </label>
                      <input
                        type="number"
                        name="jumlah_stok"
                        step="1"
                        value={currentData.jumlah_stok || 0}
                        onChange={handleChange}
                        className={`w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 ${theme.focusRing} focus:border-transparent text-gray-900 transition`}
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Satuan - DIPERBAIKI */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Satuan 
                      </label>
                      <input
                        type="text"
                        name="satuan"
                        value={getDisplaySatuan()}
                        onChange={handleSatuanChange}
                        className={`w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 ${theme.focusRing} focus:border-transparent text-gray-900 transition`}
                        placeholder="Contoh: 4, 4.5, 2.25"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Masukkan angka saja (contoh: 4, 4.5, 2.25)
                      </p>
                    </div>

                    {/* Harga Satuan */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Harga Satuan *
                      </label>
                      <input
                        type="number"
                        name="harga_satuan"
                        value={currentData.harga_satuan || ""}
                        onChange={handleChange}
                        className={`w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 ${theme.focusRing} focus:border-transparent text-gray-900 transition`}
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700">
                        <strong>Total Nilai:</strong>{" "}
                        {formatRupiah(
                          (currentData.harga_satuan || 0) *
                            (currentData.jumlah_stok || 0)
                        )}
                      </p>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 bg-white p-6 flex-shrink-0">
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  onClick={handleFormSubmit}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl ${theme.primaryBg} ${theme.primaryHoverBg} text-white font-semibold transition disabled:bg-gray-400 min-w-[120px]`}
                >
                  {actionLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : isEditing ? (
                    "Update Bahan"
                  ) : (
                    "Tambah Bahan"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}