import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Package, Edit, Trash2, Plus, Minus } from "lucide-react";

const API_URL = "http://localhost:8000/api";

const ProdukPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduk, setEditingProduk] = useState(null);
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
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduk(null);
        setMessage('');
    };

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
        let method = "POST";

        if (editingProduk) {
            url = `${API_URL}/produk/${editingProduk.id_produk}`;
            form.append("_method", "PUT");
        }

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: form,
            });
            const data = await res.json();

            if (res.ok) {
                setMessage("✅ " + data.message);
                fetchProduk();
                handleCloseModal();
            } else {
                setMessage("❌ " + (data.message || "Error"));
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setMessage("❌ Error koneksi server");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Yakin ingin menghapus produk ini?")) return;
        try {
            const res = await fetch(`${API_URL}/produk/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                setMessage("✅ " + data.message);
                fetchProduk();
            } else {
                setMessage("❌ " + (data.message || "Gagal hapus"));
            }
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    return (
        <div className="p-6 space-y-12">
            {/* Button to open the modal for adding new product */}
            <div className="flex justify-end">
                <button
                    onClick={handleAddProduk}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2"
                >
                    <Plus size={20} /> Tambah Produk Baru
                </button>
            </div>

            {/* List Produk */}
            <div>
                <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                    📦 Daftar Produk
                </h3>
                {produk.length === 0 ? (
                    <p className="text-gray-500">Belum ada produk ditambahkan.</p>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {produk.map((prod) => (
                            <motion.div
                                key={prod.id_produk}
                                whileHover={{ scale: 1.03 }}
                                className="bg-white rounded-xl shadow-lg overflow-hidden border hover:shadow-xl transition"
                            >
                                {prod.gambar_produk_url && (
                                    <img
                                        src={prod.gambar_produk_url}
                                        alt={prod.nama_produk}
                                        className="w-full h-60 object-cover"
                                    />
                                )}
                                <div className="p-5 space-y-3">
                                    <h2 className="text-lg font-semibold text-gray-900">{prod.nama_produk}</h2>
                                    <p className="text-gray-700 text-sm">Harga: Rp{prod.harga}</p>
                                    <p className="text-gray-700 text-sm">Kategori: {prod.kategori}</p>
                                    <p className="text-gray-700 text-sm line-clamp-1">Deskripsi: {prod.deskripsi}</p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleDetail(prod)}
                                            className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                        >
                                            👁️ Lihat
                                        </button>
                                        <button
                                            onClick={() => handleEdit(prod)}
                                            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                        >
                                            <Edit size={16} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(prod.id_produk)}
                                            className="flex items-center gap-1 px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                                        >
                                            <Trash2 size={16} /> Hapus
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal for Add/Edit Product */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-xl mx-auto border-t-4 border-blue-600 relative"
                    >
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            ✖
                        </button>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-700">
                            <Package className="text-blue-600" />
                            {editingProduk ? "Edit Produk" : "Tambah Produk"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                name="nama_produk"
                                placeholder="Nama Produk"
                                value={formData.nama_produk}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                                required
                            />
                            <input
                                type="number"
                                name="harga"
                                placeholder="Harga"
                                value={formData.harga}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                                required
                            />
                            <input
                                type="text"
                                name="kategori"
                                placeholder="Kategori"
                                value={formData.kategori}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                                required
                            />
                            <textarea
                                name="deskripsi"
                                placeholder="Deskripsi"
                                value={formData.deskripsi}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400 h-24"
                                required
                            ></textarea>
                            <input
                                type="file"
                                name="gambar_produk"
                                accept="image/*"
                                onChange={handleChange}
                                className="w-full border p-2 rounded-lg text-gray-900 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                            />
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                disabled={loading}
                                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                            >
                                {loading ? "Menyimpan..." : editingProduk ? "Simpan Perubahan" : "Tambah Produk"}
                            </motion.button>
                        </form>
                        {message && (
                            <p className={`mt-4 text-center text-sm font-medium ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>
                                {message}
                            </p>
                        )}
                    </motion.div>
                </div>
            )}

            {/* Modal Detail Produk */}
            {selectedProduk && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 relative"
                    >
                        <button
                            onClick={closeDetail}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        >
                            ✖
                        </button>
                        {selectedProduk.gambar_produk_url && (
                            <img
                                src={selectedProduk.gambar_produk_url}
                                alt={selectedProduk.nama_produk}
                                className="w-full h-60 object-cover rounded-lg mb-4"
                            />
                        )}
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            {selectedProduk.nama_produk}
                        </h2>
                        <p className="text-gray-700 mb-1">
                            <span className="font-semibold">Harga:</span> Rp{selectedProduk.harga}
                        </p>
                        <p className="text-gray-700 mb-1">
                            <span className="font-semibold">Kategori:</span> {selectedProduk.kategori}
                        </p>
                        <p className="text-gray-700 mb-3">
                            <span className="font-semibold">Deskripsi:</span> {selectedProduk.deskripsi}
                        </p>
                        <div className="flex justify-end">
                            <button
                                onClick={closeDetail}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Tutup
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default ProdukPage;