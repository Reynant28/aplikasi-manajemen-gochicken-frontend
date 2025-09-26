// src/pages/ProdukPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Edit, Trash2, Plus, AlertTriangle, CheckCircle } from "lucide-react";

const API_URL = "http://localhost:8000/api";

// --- Custom SuccessPopup Component dengan Countdown 4 Detik ---
const SuccessPopup = ({ isOpen, onClose, title, message }) => {
    // State untuk hitungan mundur, dimulai dari 4
    const [countdown, setCountdown] = useState(4);

    // Effect untuk menjalankan hitungan mundur
    useEffect(() => {
        // Reset countdown setiap kali popup dibuka
        if (isOpen) {
            setCountdown(4);

            // Set interval untuk mengurangi countdown setiap 1 detik
            const interval = setInterval(() => {
                setCountdown(prevCount => {
                    // Jika hitungan sudah 1, tutup popup dan clear interval
                    if (prevCount === 1) {
                        clearInterval(interval);
                        onClose();
                        return 0;
                    }
                    // Jika belum, kurangi hitungan
                    return prevCount - 1;
                });
            }, 1000);

            // Clean up function untuk membersihkan interval
            return () => clearInterval(interval);
        }
    }, [isOpen, onClose]); // Dependensi: isOpen dan onClose

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
                        </div>

                        <div className="flex flex-col justify-center space-y-3">
                            {/* Teks Countdown ditambahkan di sini */}
                            <p className="text-center text-xs font-bold text-gray-500">
                                Pop-up akan tertutup dalam {countdown} detik...
                            </p>
                            <button
                                type="button"
                                onClick={onClose}
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

// --- Custom ConfirmDeletePopup Component ---
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
                        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm relative border-t-4 border-red-500"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="text-red-500" size={28} />
                            <h2 className="text-lg font-bold text-gray-800">
                                Konfirmasi Hapus Produk
                            </h2>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.
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
                                whileHover={{ scale: 1.01, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition duration-300"
                            >
                                {prod.gambar_produk_url && (
                                    <img
                                        src={prod.gambar_produk_url}
                                        alt={prod.nama_produk}
                                        className="w-full h-48 object-cover object-center"
                                    />
                                )}
                                <div className="p-5 space-y-3">
                                    <h2 className="text-xl font-bold text-gray-900 line-clamp-2">{prod.nama_produk}</h2>
                                    {/* Mengubah warna harga menjadi hijau/green */}
                                    <p className="text-lg font-semibold text-green-600">Rp{prod.harga}</p>
                                    <p className="text-gray-600 text-sm">Kategori: <span className="font-medium text-gray-800">{prod.kategori}</span></p>
                                    <p className="text-gray-600 text-sm line-clamp-1">Deskripsi: {prod.deskripsi}</p>
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => handleDetail(prod)}
                                            className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition ease-in-out"
                                        >
                                            Lihat
                                        </button>
                                        <button
                                            onClick={() => handleEdit(prod)}
                                            className="flex items-center gap-1 px-3 py-1 text-xs bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition ease-in-out"
                                        >
                                            <Edit size={14} /> Edit
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(prod.id_produk)}
                                            className="flex items-center gap-1 px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition ease-in-out"
                                        >
                                            <Trash2 size={14} /> Hapus
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