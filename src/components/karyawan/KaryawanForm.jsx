// components/karyawan/KaryawanForm.jsx
import React from "react";
import { motion } from "framer-motion";
import { X, User, MapPin, Phone, DollarSign, Building } from "lucide-react";

const KaryawanForm = ({
    formData,
    onChange,
    onSubmit,
    loading,
    isEditing,
    cabang,
    onClose,
    isSuperAdmin = false, // New prop to distinguish user type
    currentCabang = null  // New prop for admin cabang's current branch
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    // Determine if we should show cabang selection or display current cabang
    const shouldShowCabangSelection = isSuperAdmin && cabang && cabang.length > 0;
    const shouldShowCurrentCabang = !isSuperAdmin && currentCabang;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl p-6 w-full max-w-2xl"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {isEditing ? "Edit Karyawan" : "Tambah Karyawan"}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {isEditing 
                            ? "Update data karyawan" 
                            : "Tambahkan karyawan baru"
                        }
                    </p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X size={24} />
                    </button>
                )}
            </div>

            {/* Current Cabang Info (for Admin Cabang) */}
            {shouldShowCurrentCabang && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <Building size={20} className="text-gray-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-800">
                                Cabang: <strong>{currentCabang.nama_cabang || 'N/A'}</strong>
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                                Karyawan akan otomatis ditambahkan ke cabang ini
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Cabang Selection (for Super Admin only) */}
                {shouldShowCabangSelection && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Building size={16} className="inline mr-2" />
                            Cabang
                        </label>
                        <select
                            name="id_cabang"
                            value={formData.id_cabang || ""}
                            onChange={onChange}
                            required
                            className="w-full px-4 py-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all"
                        >
                            <option value="">Pilih Cabang</option>
                            {cabang.map((cab) => (
                                <option key={cab.id_cabang} value={cab.id_cabang}>
                                    {cab.nama_cabang}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Nama Karyawan Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User size={16} className="inline mr-2" />
                        Nama Karyawan
                    </label>
                    <input
                        type="text"
                        name="nama_karyawan"
                        value={formData.nama_karyawan || ""}
                        onChange={onChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all"
                        placeholder="Masukkan nama karyawan"
                    />
                </div>

                {/* Alamat Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin size={16} className="inline mr-2" />
                        Alamat
                    </label>
                    <input
                        type="text"
                        name="alamat"
                        value={formData.alamat || ""}
                        onChange={onChange}
                        required
                        className="w-full px-4 py-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all"
                        placeholder="Masukkan alamat"
                    />
                </div>

                {/* Telepon Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone size={16} className="inline mr-2" />
                        Telepon
                    </label>
                    <input
                        type="text"
                        name="telepon"
                        value={formData.telepon || ""}
                        onChange={onChange}
                        required
                        className="w-full px-4 py-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all"
                        placeholder="Masukkan nomor telepon"
                    />
                </div>

                {/* Gaji Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <DollarSign size={16} className="inline mr-2" />
                        Gaji
                    </label>
                    <input
                        type="number"
                        name="gaji"
                        value={formData.gaji || ""}
                        onChange={onChange}
                        required
                        className="w-full px-4 py-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all"
                        placeholder="5000000"
                    />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex-1"
                        >
                            Batal
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                            onClose ? 'flex-1' : 'w-full'
                        }`}
                    >
                        {loading ? "Memproses..." : (isEditing ? "Update Karyawan" : "Tambah Karyawan")}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default KaryawanForm;