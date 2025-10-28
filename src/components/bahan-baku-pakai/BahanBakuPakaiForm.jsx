import React, { useState } from 'react';
import { motion } from 'framer-motion';

const BahanBakuPakaiForm = ({ title, bahanList, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    id_bahan_baku: "",
    jumlah_pakai: "",
    catatan: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.id_bahan_baku || !formData.jumlah_pakai) {
      alert("Pilih bahan baku dan isi jumlah pakai!");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({ id_bahan_baku: "", jumlah_pakai: "", catatan: "" });
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <h2 className="text-xl font-bold text-gray-800 mb-6">{title}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bahan Baku
          </label>
          <select
            name="id_bahan_baku"
            value={formData.id_bahan_baku}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
            required
            disabled={loading}
          >
            <option value="">Pilih Bahan Baku</option>
            {bahanList.map((b) => (
              <option key={b.id_bahan_baku} value={b.id_bahan_baku}>
                {b.nama_bahan}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jumlah Pakai (pcs)
          </label>
          <input
            type="number"
            name="jumlah_pakai"
            value={formData.jumlah_pakai}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
            placeholder="Masukkan jumlah pakai"
            min="0"
            step="0.1"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catatan (Opsional)
          </label>
          <textarea
            name="catatan"
            value={formData.catatan}
            onChange={handleChange}
            rows="3"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 resize-none"
            placeholder="Tambahkan catatan jika diperlukan"
            disabled={loading}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            disabled={loading}
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex items-center justify-center min-w-[120px] px-6 py-2.5 text-sm font-semibold bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Menyimpan...
              </>
            ) : (
              "Simpan"
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default BahanBakuPakaiForm;