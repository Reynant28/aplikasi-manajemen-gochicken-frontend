// src/pages/KaryawanPage.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Edit, Trash2, X, CircleDollarSign, User, AlertTriangle, CheckCircle } from "lucide-react";

// --- Custom SuccessPopup Component (Tema Konsisten DENGAN COUNTDOWN) ---
const SuccessPopup = ({ isOpen, onClose, title, message }) => {
    // State untuk hitungan mundur
    const [countdown, setCountdown] = useState(4);

    // Efek untuk mengelola hitungan mundur dan penutupan otomatis
    useEffect(() => {
        if (!isOpen) {
            // Reset countdown saat popup ditutup (opsional, tapi bagus untuk konsistensi)
            setCountdown(4);
            return;
        }

        // Reset hitungan saat modal dibuka
        setCountdown(4);

        // Timer untuk menghitung mundur
        const timer = setInterval(() => {
            setCountdown((prevCount) => {
                if (prevCount <= 1) {
                    clearInterval(timer);
                    onClose(); // Tutup popup setelah hitungan mundur selesai
                    return 0;
                }
                return prevCount - 1;
            });
        }, 1000); // Setiap 1 detik

        // Cleanup function
        return () => clearInterval(timer);
    }, [isOpen, onClose]); // Bergantung pada isOpen dan onClose

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    // Backdrop putih transparan konsisten
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-opacity-70 backdrop-blur-sm" 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm border-t-4 border-green-500"
                        initial={{ y: -50, opacity: 0, scale: 0.8 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 50, opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <CheckCircle className="w-12 h-12 text-green-500 stroke-2" /> 
                            <h3 className="text-xl font-semibold text-gray-800 text-center">{title}</h3>
                        </div>

                        <div className="mt-4 mb-6">
                            <p className="text-sm text-gray-600 text-center">{message}</p>
                            {/* Tampilkan hitungan mundur di sini */}
                            <p className="text-xs text-gray-500 font-bold text-center mt-2">
                                Popup akan tertutup otomatis dalam {countdown} detik...
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <button
                                type="button"
                                onClick={onClose}
                                // Ubah button agar menampilkan sisa waktu, atau disable/ubah style saat mendekati 0
                                className="w-full py-3 px-4 text-sm font-medium rounded-lg text-white bg-green-500 hover:bg-green-600 transition-colors"
                            >
                                Tutup Sekarang
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// --- Custom ConfirmDeletePopup Component (Tema Konsisten) ---
const ConfirmDeletePopup = ({ isOpen, onClose, onConfirm }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    // Backdrop putih transparan konsisten
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-opacity-70 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        // Aksen merah untuk konfirmasi hapus
                        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm relative border-t-4 border-red-500"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="text-red-500" size={28} />
                            <h2 className="text-lg font-bold text-gray-800">
                                Konfirmasi Hapus Karyawan
                            </h2>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Apakah Anda yakin ingin menghapus karyawan ini? Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
                            >
                                Batal
                            </button>
                            <button
                                onClick={onConfirm}
                                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                            >
                                Hapus
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const KaryawanPage = () => {
    const [formData, setFormData] = useState({ nama: "", gaji: "" });
    const [karyawan, setKaryawan] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // state untuk custom confirm dan success
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Handler untuk menutup success popup
    const closeSuccessPopup = () => {
        setShowSuccess(false);
    };

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        let message = "";
        if (editingIndex !== null) {
            const updated = [...karyawan];
            updated[editingIndex] = formData;
            setKaryawan(updated);
            setEditingIndex(null);
            message = "Data karyawan berhasil diubah!";
        } else {
            setKaryawan([...karyawan, formData]);
            message = "Karyawan baru berhasil ditambahkan!";
        }
        setFormData({ nama: "", gaji: "" });
        setShowForm(false);
        
        // Tampilkan success popup
        setSuccessMessage(message);
        setShowSuccess(true);
        // Note: Penutupan otomatis 4 detik sekarang ditangani di dalam SuccessPopup
    };

    const handleEdit = (index) => {
        setFormData(karyawan[index]);
        setEditingIndex(index);
        setShowForm(true);
    };

    const confirmDelete = (index) => {
        setDeleteIndex(index);
        setShowConfirm(true);
    };

    const handleDelete = () => {
        setKaryawan(karyawan.filter((_, i) => i !== deleteIndex));
        setShowConfirm(false);
        setDeleteIndex(null);
        
        // Tampilkan success popup setelah delete
        setSuccessMessage("Karyawan berhasil dihapus!");
        setShowSuccess(true);
        // Note: Penutupan otomatis 4 detik sekarang ditangani di dalam SuccessPopup
    };

    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-green-50 via-white to-green-100">
            <motion.h1
                className="text-4xl font-extrabold text-green-700 mb-8 drop-shadow-sm"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                Kelola Karyawan
            </motion.h1>

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-green-700">Daftar Karyawan</h3>
                <button
                    onClick={() => {
                        setFormData({ nama: "", gaji: "" });
                        setEditingIndex(null);
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                    <PlusCircle size={18} /> Tambah Karyawan
                </button>
            </div>

            {/* Grid daftar karyawan */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {karyawan.length === 0 ? (
                    <p className="text-gray-500 italic col-span-full">
                        Belum ada data karyawan.
                    </p>
                ) : (
                    karyawan.map((item, index) => (
                        <motion.div
                            key={index}
                            className="bg-white shadow-lg rounded-xl p-6 border-t-4 border-green-600"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <h2 className="text-lg font-bold text-green-800 flex items-center gap-2">
                                <User size={18} /> {item.nama}
                            </h2>
                            <p className="text-green-700 font-semibold flex items-center gap-1 mt-2">
                                <CircleDollarSign size={16} /> Rp{" "}
                                {parseInt(item.gaji || 0).toLocaleString()}
                            </p>
                            <div className="flex gap-3 mt-5">
                                <button
                                    onClick={() => handleEdit(index)}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                                >
                                    <Edit size={16} /> Edit
                                </button>
                                <button
                                    onClick={() => confirmDelete(index)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                                >
                                    <Trash2 size={16} /> Hapus
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Modal Tambah/Edit (Tetap menggunakan backdrop blur) */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-opacity-70 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => { setShowForm(false); setEditingIndex(null); setFormData({ nama: "", gaji: "" }); }} // Tambah penutup backdrop
                    >
                        <motion.div
                            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border-t-4 border-green-600 relative"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()} // Stop propagation agar tidak tertutup saat klik di dalam
                        >
                            <button
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingIndex(null);
                                    setFormData({ nama: "", gaji: "" });
                                }}
                                className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                            >
                                <X size={20} />
                            </button>

                            <h2 className="text-xl font-semibold mb-4 text-green-700">
                                {editingIndex !== null ? "✏️ Edit Karyawan" : "➕ Tambah Karyawan"}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-3">
                                <input
                                    type="text"
                                    name="nama"
                                    placeholder="Nama Karyawan"
                                    value={formData.nama}
                                    onChange={handleChange}
                                    className="border rounded-lg px-3 py-2 w-full text-gray-800 focus:ring-green-400 focus:border-green-400"
                                    required
                                />
                                <input
                                    type="number"
                                    name="gaji"
                                    placeholder="Masukkan Gaji"
                                    value={formData.gaji}
                                    onChange={handleChange}
                                    className="border rounded-lg px-3 py-2 w-full text-gray-800 focus:ring-green-400 focus:border-green-400"
                                    required
                                />

                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition font-semibold"
                                >
                                    {editingIndex !== null ? "Simpan Perubahan" : "Tambah Karyawan"}
                                </motion.button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- CUSTOM POPUPS (Menggantikan modal bawaan dan menyesuaikan tema) --- */}
            
            {/* Modal Konfirmasi Hapus */}
            <ConfirmDeletePopup
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleDelete}
            />

            {/* Modal Sukses */}
            <SuccessPopup
                isOpen={showSuccess}
                onClose={closeSuccessPopup} // Menggunakan handler untuk menutup
                title="Aksi Berhasil! 🎉"
                message={successMessage}
            />
        </div>
    );
};

export default KaryawanPage;