// src/components/pemesanan/AddEditModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X } from 'lucide-react';

const formatRupiah = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

const PemesananForm = ({ isOpen, onClose, onSubmit, isSubmitting, produkList, cabangId }) => {
  const [formData, setFormData] = useState({ 
    nama_pelanggan: '', 
    metode_pembayaran: 'Tunai', 
    status_transaksi: 'OnLoan', 
    details: [{ id_produk: '', jumlah_produk: 1 }] 
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({ 
        nama_pelanggan: '', 
        metode_pembayaran: 'Tunai', 
        status_transaksi: 'OnLoan', 
        details: [{ id_produk: '', jumlah_produk: 1 }] 
      });
    }
  }, [isOpen]);

  const totalHarga = useMemo(() => {
    return formData.details.reduce((sum, item) => {
      const produk = produkList.find(p => p.id_produk == item.id_produk);
      return sum + (produk ? produk.harga * item.jumlah_produk : 0);
    }, 0);
  }, [formData.details, produkList]);

  const handleDetailChange = (index, e) => {
    const { name, value } = e.target;
    const newDetails = [...formData.details];
    
    if (name === 'jumlah_produk' && Number(value) < 1) {
      newDetails[index][name] = '1';
    } else {
      newDetails[index][name] = value;
    }
    
    setFormData(prev => ({ ...prev, details: newDetails }));
  };

  const addDetailItem = () => {
    setFormData(prev => ({ 
      ...prev, 
      details: [...prev.details, { id_produk: '', jumlah_produk: 1 }] 
    }));
  };

  const removeDetailItem = (index) => {
    setFormData(prev => ({ 
      ...prev, 
      details: prev.details.filter((_, i) => i !== index) 
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const payload = { 
      ...formData, 
      id_cabang: cabangId, 
      total_harga: totalHarga 
    };
    onSubmit(payload);
  };

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
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Buat Pesanan Baru</h2>
              <button 
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="p-6 space-y-4">
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Pelanggan
                    </label>
                    <input 
                      type="text" 
                      value={formData.nama_pelanggan}
                      onChange={(e) => setFormData(prev => ({...prev, nama_pelanggan: e.target.value}))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-900 transition-colors"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Metode Pembayaran
                    </label>
                    <select 
                      value={formData.metode_pembayaran}
                      onChange={(e) => setFormData(prev => ({...prev, metode_pembayaran: e.target.value}))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-900 transition-colors"
                      required
                    >
                      <option value="Tunai">Tunai</option>
                      <option value="QRIS">QRIS</option>
                      <option value="Transfer Bank">Transfer Bank</option>
                    </select>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Transaksi
                  </label>
                  <select 
                    value={formData.status_transaksi}
                    onChange={(e) => setFormData(prev => ({...prev, status_transaksi: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-900 transition-colors"
                    required
                  >
                    <option value="OnLoan">On Loan</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>

                {/* Order Details */}
                <div className="pt-2">
                  <h3 className="text-md font-semibold text-gray-800 mb-2">
                    Detail Pesanan
                  </h3>
                  <div className="space-y-3">
                    {formData.details.map((item, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-12 gap-x-3 gap-y-2 items-end">
                          <div className="col-span-12 sm:col-span-7">
                            <label className="text-xs font-medium text-gray-600 block mb-1">
                              Produk
                            </label>
                            <select 
                              name="id_produk"
                              value={item.id_produk}
                              onChange={e => handleDetailChange(index, e)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm text-gray-900 transition-colors"
                            >
                              <option value="">Pilih Produk...</option>
                              {produkList.map(p => (
                                <option 
                                  key={p.id_produk} 
                                  value={p.id_produk} 
                                  disabled={p.jumlah_stok <= 0}
                                >
                                  {p.nama_produk} (Stok: {p.jumlah_stok})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-6 sm:col-span-4">
                            <label className="text-xs font-medium text-gray-600 block mb-1">
                              Jumlah
                            </label>
                            <input 
                              type="number" 
                              min="1"
                              name="jumlah_produk"
                              value={item.jumlah_produk}
                              onChange={e => handleDetailChange(index, e)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm text-gray-900 transition-colors"
                              placeholder="e.g., 2"
                            />
                          </div>
                          <div className="col-span-6 sm:col-span-1 flex justify-end">
                            <button 
                              type="button" 
                              onClick={() => removeDetailItem(index)}
                              className="p-2 text-rose-600 hover:bg-red-100 rounded-xl transition-colors"
                            >
                              <X size={16}/>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      type="button" 
                      onClick={addDetailItem}
                      className="w-full text-sm py-2 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
                    >
                      + Tambah Produk
                    </button>
                  </div>
                </div>

                {/* Total Price */}
                <div className="text-right pt-2">
                  <p className="text-gray-600 text-sm">Total Harga</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {formatRupiah(totalHarga)}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-gray-50 rounded-b-xl flex justify-end gap-3 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex items-center justify-center w-40 px-6 py-2 text-sm font-semibold bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16}/>
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Pesanan"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PemesananForm;