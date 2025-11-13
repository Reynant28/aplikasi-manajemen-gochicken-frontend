import React from "react";
import { motion } from "framer-motion";
import { X, Plus, Edit } from "lucide-react";

const KaryawanForm = ({
    isOpen,
    onClose,
    onSubmit,
    formData,
    onFormChange,
    cabang,
    loading = false,
    mode = "add" // "add" or "edit"
}) => {
    if (!isOpen) return null;

    const title = mode === "add" ? "Tambah Karyawan" : "Edit Karyawan";
    const Icon = mode === "add" ? Plus : Edit;
    const submitText = loading ? "Menyimpan..." : "Simpan";

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleInputChange = (field, value) => {
        onFormChange({
            ...formData,
            [field]: value
        });
    };

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-opacity-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-xl mx-auto border border-gray-200 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                >
                    <X size={24} />
                </button>
                
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800">
                    <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="text-gray-700" size={24} />
                    </div>
                    {title}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nama Karyawan
                        </label>
                        <input
                            type="text"
                            value={formData.nama_karyawan || ""}
                            onChange={(e) => handleInputChange("nama_karyawan", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                            placeholder="Masukkan nama karyawan"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Alamat
                        </label>
                        <input
                            type="text"
                            value={formData.alamat || ""}
                            onChange={(e) => handleInputChange("alamat", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                            placeholder="Masukkan alamat"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Telepon
                        </label>
                        <input
                            type="text"
                            value={formData.telepon || ""}
                            onChange={(e) => handleInputChange("telepon", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                            placeholder="Masukkan nomor telepon"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gaji
                        </label>
                        <input
                            type="number"
                            value={formData.gaji || ""}
                            onChange={(e) => handleInputChange("gaji", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                            placeholder="5000000"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cabang
                        </label>
                        <select
                            value={formData.id_cabang || ""}
                            onChange={(e) => handleInputChange("id_cabang", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 disabled:opacity-70 disabled:cursor-not-allowed"
                            required
                            disabled={cabang.length === 0}
                        >
                            <option value="">
                                {cabang.length === 0 ? "Tidak ada cabang tersedia" : "Pilih Cabang"}
                            </option>
                            {cabang.map((cab) => (
                                <option key={cab.id_cabang} value={cab.id_cabang}>
                                    {cab.nama_cabang}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {submitText}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default KaryawanForm;