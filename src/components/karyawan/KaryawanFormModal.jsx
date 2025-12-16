// src/components/Karyawan/KaryawanFormModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, X, Loader2 } from "lucide-react";

export default function KaryawanFormModal({
    showAddForm,
    editKaryawan,
    newKaryawan,
    cabangList,
    actionLoading,
    theme,
    setShowAddForm,
    setEditKaryawan,
    setNewKaryawan,
    handleAdd,
    handleUpdate,
    formatRupiah,
    formatGajiInput,
    parseGajiInput,
}) {
    const isEditing = !!editKaryawan;
    const currentData = isEditing ? editKaryawan || {} : newKaryawan || {};
    
    // Setter harus diarahkan ke state yang benar
    const currentSetData = isEditing ? setEditKaryawan : setNewKaryawan;
    const handleSubmit = isEditing ? handleUpdate : handleAdd;
    
    const handleClose = () => {
        setShowAddForm(false);
        setEditKaryawan(null);
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      // Memastikan setter bekerja dengan data yang benar (editKaryawan atau newKaryawan)
      currentSetData(prev => ({ ...prev, [name]: value }));
    };

    const handleGajiChange = (e) => {
      const rawValue = parseGajiInput(e.target.value);
      currentSetData(prev => ({ ...prev, gaji: rawValue }));
    };

    return (
        <AnimatePresence>
            {(showAddForm || editKaryawan) && (
                <motion.div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                >
                    <motion.div 
                        className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto border-t-4 ${theme.modalBorder} relative max-h-[90vh] overflow-hidden`}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className={`bg-gradient-to-r ${theme.cardGradient} p-6 text-white`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {isEditing ? <Edit size={24} /> : <Plus size={24} />}
                                    <h2 className="text-2xl font-bold">
                                        {isEditing ? 'Edit Karyawan' : 'Tambah Karyawan'}
                                    </h2>
                                </div>
                                <button 
                                    onClick={handleClose}
                                    className="p-2 rounded-full transition bg-white/20 hover:bg-white/30"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        
                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Karyawan *</label>
                                        <input 
                                            type="text" 
                                            name="nama_karyawan"
                                            value={currentData.nama_karyawan || ""}
                                            onChange={handleChange}
                                            className={`w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 ${theme.focusRing} focus:border-transparent text-gray-900 transition`}
                                            required 
                                            placeholder="Masukkan nama lengkap"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Telepon *</label>
                                        <input 
                                            type="text" 
                                            name="telepon"
                                            value={currentData.telepon || ""}
                                            onChange={handleChange}
                                            className={`w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 ${theme.focusRing} focus:border-transparent text-gray-900 transition`}
                                            required 
                                            placeholder="Contoh: 08123456789"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat *</label>
                                    <input 
                                        type="text" 
                                        name="alamat"
                                        value={currentData.alamat || ""}
                                        onChange={handleChange}
                                        className={`w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 ${theme.focusRing} focus:border-transparent text-gray-900 transition`}
                                        required 
                                        placeholder="Masukkan alamat lengkap"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Gaji (Angka) *</label>
                                        <input 
                                            type="text" 
                                            value={formatGajiInput(currentData.gaji)}
                                            onChange={handleGajiChange}
                                            className={`w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 ${theme.focusRing} focus:border-transparent text-gray-900 transition`}
                                            required 
                                            placeholder="Contoh: 5000000"
                                        />
                                        {(currentData.gaji) ? (
                                            <p className="text-sm text-gray-500 mt-2">
                                                Ditampilkan sebagai: {formatRupiah(currentData.gaji)}
                                            </p>
                                        ) : null}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Cabang *</label>
                                        <select 
                                            name="id_cabang" 
                                            value={currentData.id_cabang || ""}
                                            onChange={handleChange}
                                            className={`w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 ${theme.focusRing} focus:border-transparent text-gray-900 transition disabled:opacity-70`}
                                            required 
                                            disabled={(cabangList || []).length === 0}
                                        >
                                            <option value="">
                                                {(cabangList || []).length === 0 ? "Tidak ada cabang tersedia" : "Pilih Cabang"}
                                            </option>
                                            {(cabangList || []).map((cab) => (
                                                <option key={cab.id_cabang} value={cab.id_cabang}>
                                                    {cab.nama_cabang}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                    <button 
                                        type="button" 
                                        onClick={handleClose}
                                        className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={actionLoading}
                                        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl ${theme.primaryBg} ${theme.primaryHoverBg} text-white font-semibold transition disabled:bg-gray-400 min-w-[120px]`}
                                    >
                                        {actionLoading ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            isEditing ? 'Update' : 'Simpan'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}