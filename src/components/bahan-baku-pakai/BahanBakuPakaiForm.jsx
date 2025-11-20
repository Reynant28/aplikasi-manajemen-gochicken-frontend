import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const BahanBakuPakaiForm = ({ 
  title, 
  bahanList,
  onSubmit, 
  onClose,
  initialData = {}
}) => {
  const [formData, setFormData] = useState({
    id_bahan_baku: initialData.id_bahan_baku || '',
    jumlah_pakai: initialData.jumlah_pakai || '',
    catatan: initialData.catatan || '',
    id_cabang: initialData.id_cabang || ''
  });
  const [loading, setLoading] = useState(false);
  const [cabangList, setCabangList] = useState([]);
  const [loadingCabang, setLoadingCabang] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch cabang data from API
  useEffect(() => {
    const fetchCabang = async () => {
      setLoadingCabang(true);
      try {
        const response = await axios.get("http://localhost:8000/api/cabang", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCabangList(response.data.data || []);
        
        // Set default cabang if not already set
        if (!formData.id_cabang && response.data.data.length > 0) {
          setFormData(prev => ({ ...prev, id_cabang: response.data.data[0].id_cabang }));
        }
      } catch (error) {
        console.error('Error fetching cabang:', error);
        alert('Gagal memuat data cabang');
      } finally {
        setLoadingCabang(false);
      }
    };

    fetchCabang();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate cabang is selected
    if (!formData.id_cabang) {
      alert('Pilih cabang terlebih dahulu');
      return;
    }

    setLoading(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
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
    >
      <h2 className="text-xl font-bold text-gray-800 mb-6">{title}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Bahan Baku Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Bahan Baku
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
            {bahanList.map(bahan => (
              <option key={bahan.id_bahan_baku} value={bahan.id_bahan_baku}>
                {bahan.nama_bahan} (Stok: {bahan.jumlah_stok} {bahan.satuan})
              </option>
            ))}
          </select>
        </div>

        {/* Jumlah Pakai */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jumlah Pakai
          </label>
          <input
            type="number"
            name="jumlah_pakai"
            value={formData.jumlah_pakai}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
            placeholder="0.0"
            step="0.01"
            min="0.01"
            required
            disabled={loading}
          />
        </div>

        {/* Catatan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catatan (Opsional)
          </label>
          <textarea
            name="catatan"
            value={formData.catatan}
            onChange={handleChange}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
            placeholder="Tambahkan catatan jika diperlukan..."
            disabled={loading}
          />
        </div>

        {/* ID Cabang */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cabang
          </label>
          <select
            name="id_cabang"
            value={formData.id_cabang}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
            required
            disabled={loading || loadingCabang}
          >
            <option value="">{loadingCabang ? 'Memuat cabang...' : 'Pilih Cabang'}</option>
            {cabangList.map(cabang => (
              <option key={cabang.id_cabang} value={cabang.id_cabang}>
                {cabang.nama_cabang || `Cabang ${cabang.id_cabang}`}
              </option>
            ))}
          </select>
          {loadingCabang && (
            <p className="text-sm text-gray-500 mt-1">Memuat data cabang...</p>
          )}
        </div>

        {/* Action Buttons */}
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