// src/pages/ProdukPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Edit, Trash2, Plus, AlertTriangle, CheckCircle } from "lucide-react";
import { SuccessPopup, Modal, ConfirmDeletePopup, Card, Button } from "../../components/ui";

const API_URL = "http://localhost:8000/api";

// --- ProdukPage Component (Tema Hijau/Green) ---
const ProdukPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduk, setEditingProduk] = useState(null);
    const [currentImageUrl, setCurrentImageUrl] = useState("");
    const [formData, setFormData] = useState({
        nama_produk: "",
        harga: "",
        kategori: "",
        deskripsi: "",
        gambar_produk: null,
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [produk, setProduk] = useState([]);
    const [selectedProduk, setSelectedProduk] = useState(null);

    // State untuk Custom Popups
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const token = localStorage.getItem("token");

    const fetchProduk = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/produk`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setProduk(data.data || []);
        } catch (err) {
            console.error("Failed to fetch produk:", err);
            setProduk([]);
        }
    }, [token]);

    useEffect(() => {
        if (token) fetchProduk();
    }, [token, fetchProduk]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleDetail = (prod) => {
        setSelectedProduk(prod);
    };

    const closeDetail = () => {
        setSelectedProduk(null);
    };

    const handleAddProduk = () => {
        setEditingProduk(null);
        setFormData({
            nama_produk: "",
            harga: "",
            kategori: "",
            deskripsi: "",
            gambar_produk: null,
        });
        setMessage(''); // Clear previous message
        setIsModalOpen(true);
    };

    const handleEdit = (prod) => {
        setEditingProduk(prod);
        setFormData({
            nama_produk: prod.nama_produk,
            harga: prod.harga,
            kategori: prod.kategori,
            deskripsi: prod.deskripsi,
            gambar_produk: null,
        });
        setCurrentImageUrl(prod.gambar_produk_url);
        setMessage(''); // Clear previous message
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduk(null);
        setMessage('');
        setCurrentImageUrl("");
    };

    // ProdukPage.jsx - Di dalam handleSubmit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        const form = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null) {
                form.append(key, value);
            }
        });

        let url = `${API_URL}/produk`;
        let method = "POST"; // Default untuk tambah

        if (editingProduk) {
            url = `${API_URL}/produk/${editingProduk.id_produk}`;
            // !!! JANGAN GUNAKAN _method OVERRIDE JIKA INGIN MENGIRIM PUT/PATCH DENGAN FETCH !!!
            method = "POST"; // Kembali ke POST, namun tambahkan _method override di form data
            form.append("_method", "PUT"); // <--- Tambahkan method override untuk Laravel
        }

        try {
            const res = await fetch(url, {
                // Kita tetap menggunakan method POST di sini
                // agar Laravel dapat memproses FormData dengan _method=PUT
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    // Hapus header 'Content-Type': 'multipart/form-data'
                    // Browser akan menambahkannya secara otomatis dengan boundary saat FormData digunakan
                },
                body: form,
            });

            // --- TAMBAH Cek Response Status di sini ---
            if (!res.ok) {
                // Jika respons BUKAN 2xx (misal 401, 500, 419)
                const text = await res.text();

                // Cek apakah response-nya adalah HTML (yang menyebabkan SyntaxError)
                if (text.startsWith('<!DOCTYPE')) {
                    console.error("Server returned HTML error page (Not JSON):", text);
                    setMessage("❌ Server Error: Sesi kedaluwarsa atau Kesalahan Internal Server (500).");
                    setLoading(false);
                    return;
                }
            }
            // --- Akhir Cek Response Status ---

            const data = await res.json(); // Baris 243: Akan aman jika responsnya JSON

            if (res.ok) {
                const action = editingProduk ? "diubah" : "ditambahkan";
                setSuccessMessage(data.message || `Produk berhasil ${action}!`);
                setShowSuccess(true);
                fetchProduk();
                handleCloseModal();
            } else {
                setMessage("❌ " + (data.message || "Error"));
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setMessage("❌ Error koneksi server atau respons tidak valid");
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk menampilkan konfirmasi hapus
    const confirmDelete = (id) => {
        setDeleteId(id);
        setShowConfirm(true);
    };

    // Fungsi untuk mengeksekusi hapus setelah konfirmasi
    const handleDelete = async () => {
        setShowConfirm(false);
        if (!deleteId) return;

        try {
            const res = await fetch(`${API_URL}/produk/${deleteId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (res.ok) {
                setSuccessMessage(data.message || "Produk berhasil dihapus!");
                setShowSuccess(true);
                fetchProduk();
            } else {
                // Tampilkan error jika gagal
                setMessage("❌ " + (data.message || "Gagal hapus"));
            }
        } catch (err) {
            console.error("Delete error:", err);
            setMessage("❌ Error koneksi server saat menghapus.");
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-green-50 via-white to-green-100">
            <motion.h1
                className="text-4xl font-extrabold text-green-700 mb-8 drop-shadow-sm"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                Kelola Produk
            </motion.h1>

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-green-700">
                    📦 Daftar Produk
                </h3>
                <button
                    onClick={handleAddProduk}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-md"
                >
                    <Plus size={18} /> Tambah Produk
                </button>
            </div>

            {/* List Produk */}
            <div>
                {produk.length === 0 ? (
                    <p className="text-gray-500">Belum ada produk ditambahkan.</p>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {produk.map((prod) => (
                            <motion.div
                                key={prod.id_produk}
                                whileHover={{ scale: 1.02 }}
                                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                                >
                                {/* Gambar Produk */}
                                {prod.gambar_produk_url && (
                                    <div className="relative w-full h-48 overflow-hidden">
                                    <img
                                        src={prod.gambar_produk_url}
                                        alt={prod.nama_produk}
                                        className="w-full h-full object-cover object-center transform hover:scale-105 transition duration-500"
                                    />
                                    </div>
                                )}
                                {/* Info Produk */}
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div className="space-y-2">
                                    <h2 className="text-lg font-bold text-gray-900 line-clamp-2">
                                        {prod.nama_produk}
                                    </h2>
                                    <p className="text-green-600 font-semibold text-base">
                                        Rp {parseInt(prod.harga).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Kategori:{" "}
                                        <span className="font-medium text-gray-700">{prod.kategori}</span>
                                    </p>
                                    <p className="text-sm text-gray-500 line-clamp-1">
                                        {prod.deskripsi}
                                    </p>
                                    </div>

                                    {/* Tombol Aksi */}
                                    <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => handleDetail(prod)}
                                        className="flex-1 text-xs px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
                                    >
                                        Lihat
                                    </button>
                                    <button
                                        onClick={() => handleEdit(prod)}
                                        className="flex-1 text-xs px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                                    >
                                        <Edit size={14} className="inline-block mr-1" /> Edit
                                    </button>
                                    <button
                                        onClick={() => confirmDelete(prod.id_produk)}
                                        className="flex-1 text-xs px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                    >
                                        <Trash2 size={14} className="inline-block mr-1" /> Hapus
                                    </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- MODAL ADD/EDIT PRODUK (Tetap menggunakan backdrop putih transparan) --- */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-opacity-70 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleCloseModal}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            transition={{ duration: 0.3 }}
                            // Aksen modal tetap hijau/green
                            className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-xl mx-auto border-t-4 border-green-600 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={handleCloseModal}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                            >
                                ✖
                            </button>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-green-700">
                                <Package className="text-green-600" />
                                {editingProduk ? "Edit Produk" : "Tambah Produk Baru"}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    type="text"
                                    name="nama_produk"
                                    placeholder="Nama Produk"
                                    value={formData.nama_produk}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 text-gray-900 placeholder:text-gray-400"
                                    required
                                />
                                <input
                                    type="number"
                                    name="harga"
                                    placeholder="Harga (contoh: 50000)"
                                    value={formData.harga}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 text-gray-900 placeholder:text-gray-400"
                                    required
                                />
                                <input
                                    type="text"
                                    name="kategori"
                                    placeholder="Kategori (contoh: Minuman, Makanan)"
                                    value={formData.kategori}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 text-gray-900 placeholder:text-gray-400"
                                    required
                                />
                                <textarea
                                    name="deskripsi"
                                    placeholder="Deskripsi"
                                    value={formData.deskripsi}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 text-gray-900 placeholder:text-gray-400 h-24"
                                    required
                                ></textarea>
                                {editingProduk && currentImageUrl && (
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <span className="font-semibold">Gambar Saat Ini:</span>
                                        <span className="truncate max-w-[calc(100%-150px)]">{currentImageUrl.split('/').pop()}</span>
                                        <span className="text-green-500">(Ganti untuk update)</span>
                                    </div>
                                )}
                                <label className="block text-sm font-medium text-gray-700 pt-2">Unggah Gambar Produk (JPG, PNG)</label>
                                <input
                                    type="file"
                                    name="gambar_produk"
                                    accept="image/*"
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded-lg text-gray-900 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-600 hover:file:bg-green-100 cursor-pointer"
                                    required={!editingProduk}
                                />
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-gray-400"
                                >
                                    {loading ? "Menyimpan..." : editingProduk ? "Simpan Perubahan" : "Tambah Produk"}
                                </motion.button>
                            </form>
                            {/* Pesan error/sukses dari API tetap ditampilkan di modal jika ada */}
                            {message && (
                                <p className={`mt-4 text-center text-sm font-medium ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>
                                    {message}
                                </p>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- MODAL DETAIL PRODUK (Tetap menggunakan tema Hijau/Green) --- */}
            <AnimatePresence>
                {selectedProduk && (
                    <motion.div
                        // Backdrop detail menggunakan tema lama (bg-opacity-50)
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-opacity-70 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeDetail}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 relative border-t-4 border-green-600"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={closeDetail}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                            >
                                ✖
                            </button>
                            <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-2">
                                Detail Produk
                            </h2>
                            {selectedProduk.gambar_produk_url && (
                                <img
                                    src={selectedProduk.gambar_produk_url}
                                    alt={selectedProduk.nama_produk}
                                    className="w-full h-60 object-cover rounded-lg mb-4 shadow-md"
                                />
                            )}
                            <div className="space-y-3 text-gray-800">
                                <p>
                                    <span className="font-semibold">Nama:</span> {selectedProduk.nama_produk}
                                </p>
                                <p>
                                    <span className="font-semibold">Harga:</span> <span className="text-xl font-bold text-green-600">Rp{selectedProduk.harga}</span>
                                </p>
                                <p>
                                    <span className="font-semibold">Kategori:</span> {selectedProduk.kategori}
                                </p>
                                <div>
                                    <span className="font-semibold block mb-1">Deskripsi:</span>
                                    <p className="text-gray-600 text-sm italic">{selectedProduk.deskripsi}</p>
                                </div>
                            </div>
                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={closeDetail}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                >
                                    Tutup
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- CUSTOM POPUPS (Menggunakan backdrop putih transparan) --- */}

            {/* Modal Konfirmasi Hapus */}
            <ConfirmDeletePopup
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleDelete}
            />
            {/* Modal Sukses */}
            <SuccessPopup
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                title="Aksi Berhasil! 🎉"
                message={successMessage}
            />
        </div>
    );
};

export default ProdukPage;