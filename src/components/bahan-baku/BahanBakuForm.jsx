import React from 'react';
import { motion } from 'framer-motion';

const BahanForm = ({ 
  title, 
  formData, 
  setFormData, 
  onSubmit, 
  loading, 
  onClose,
  isEdit = false 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (isEdit) {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
            Nama Bahan
          </label>
          <input
            type="text"
            name="nama_bahan"
            value={formData.nama_bahan || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
            placeholder="Masukkan nama bahan"
            required
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jumlah Stok
            </label>
            <input
              type="number"
              name="jumlah_stok"
              value={formData.jumlah_stok || ''}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
              placeholder="0"
              min="0"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Satuan (kg)
            </label>
            <input
              type="number"
              name="satuan"
              value={formData.satuan || ''}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
              placeholder="0.0"
              step="0.1"
              min="0"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Harga Satuan
          </label>
          <input
            type="number"
            name="harga_satuan"
            value={formData.harga_satuan || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
            placeholder="0"
            min="0"
            required
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

export default BahanForm;