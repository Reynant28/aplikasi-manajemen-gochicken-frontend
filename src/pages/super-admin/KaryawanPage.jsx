// src/pages/KaryawanPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit, Trash2, X, User, Phone, MapPin, DollarSign, Building2, Plus, Users } from "lucide-react";
import { ConfirmDeletePopup, SuccessPopup } from "../../components/ui";

const API_URL = "http://localhost:8000/api";

const formatRupiah = (value = 0) => {
    try {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(value);
    } catch {
        return `Rp ${value}`;
    }
};

const KaryawanPage = () => {
    const [loading, setLoading] = useState(false);
    const [karyawan, setKaryawan] = useState([]);
    const [cabang, setCabang] = useState([]);
    const [newKaryawan, setNewKaryawan] = useState({ 
        id_cabang: "", 
        nama_karyawan: "", 
        alamat: "", 
        telepon: "", 
        gaji: "" 
    });
    const [editKaryawan, setEditKaryawan] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const token = localStorage.getItem("token");

    const fetchKaryawan = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/karyawan`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setKaryawan(data.data || []);
        } catch (err) {
            console.error("Failed to fetch karyawan:", err);
            setKaryawan([]);
        }
    }, [token]);

    const fetchCabang = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/cabang`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setCabang(data.data || []);
        } catch (err) {
            console.error("Failed to fetch cabang:", err);
            setCabang([]);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchKaryawan();
            fetchCabang();
        }
    }, [token, fetchKaryawan, fetchCabang]);

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/karyawan`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newKaryawan),
            });

            const data = await res.json();
            if (res.status === 201) {
                setSuccessMessage(data.message || "Karyawan berhasil ditambahkan!");
                setShowSuccess(true);
                setNewKaryawan({
                    id_cabang: "",
                    nama_karyawan: "",
                    alamat: "",
                    telepon: "",
                    gaji: "",
                });
                setShowAddForm(false);
                fetchCabang();
                fetchKaryawan();
            }
        } catch (err) {
            console.error("Fetch error:", err);
        }
        setLoading(false);
    };

    const confirmDelete = (id) => {
        setDeleteId(id);
        setShowConfirm(true);
    };

    const handleDelete = async () => {
        try {
            const res = await fetch(`${API_URL}/karyawan/${deleteId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setSuccessMessage("Karyawan berhasil dihapus!");
                setShowSuccess(true);
                fetchKaryawan();
                fetchCabang();
            }
        } catch (err) {
            console.error("Delete karyawan error:", err);
        }
        setShowConfirm(false);
        setDeleteId(null);
    };

    const handleUpdate = async () => {
        try {
            const res = await fetch(`${API_URL}/karyawan/${editKaryawan.id_karyawan}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editKaryawan),
            });
            if (res.ok) {
                setSuccessMessage(`Karyawan ${editKaryawan.nama_karyawan} berhasil diupdate!`);
                setShowSuccess(true);
                await fetchKaryawan();
                await fetchCabang();
                setEditKaryawan(null);
            }
        } catch (err) {
            console.error("Update karyawan error:", err);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl font-bold text-gray-800">Kelola Karyawan</h1>
                    <p className="text-gray-500 mt-1">Manajemen data karyawan dan informasi pegawai</p>
                </motion.div>
                
                <motion.button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 bg-gray-700 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Plus size={20} /> Tambah Karyawan
                </motion.button>
            </div>

            {/* Karyawan Grid */}
            {karyawan.length === 0 && !loading ? (
                <motion.div 
                    className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl shadow-md border border-gray-100"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <Users size={64} className="text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg font-medium">Belum ada karyawan</p>
                    <p className="text-gray-400 text-sm mt-1">Klik "Tambah Karyawan" untuk memulai</p>
                </motion.div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {karyawan.map((item, index) => (
                        <motion.div
                            key={item.id_karyawan}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -4 }}
                            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                        >
                            {/* Header with Avatar */}
                            <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 flex flex-col items-center">
                                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mb-3 shadow-lg">
                                    <User size={36} className="text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 text-center">
                                    {item.nama_karyawan}
                                </h3>
                                <div className="mt-2 px-3 py-1 bg-gray-700 bg-opacity-90 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                                    <Building2 size={12} />
                                    {item.cabang?.nama_cabang || "N/A"}
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="p-5 space-y-3">
                                <div className="flex items-start gap-2 text-sm">
                                    <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-600">{item.alamat}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone size={16} className="text-gray-400 flex-shrink-0" />
                                    <span className="text-gray-600">{item.telepon}</span>
                                </div>
                                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                    <DollarSign size={16} className="text-gray-400 flex-shrink-0" />
                                    <span className="text-gray-700 font-bold">
                                        {formatRupiah(item.gaji)}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 p-4 bg-gray-50 border-t border-gray-100">
                                <button
                                    onClick={() => setEditKaryawan(item)}
                                    className="flex-1 text-xs px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium flex items-center justify-center gap-1"
                                >
                                    <Edit size={14} /> Edit
                                </button>
                                <button
                                    onClick={() => confirmDelete(item.id_karyawan)}
                                    className="flex-1 text-xs px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium flex items-center justify-center gap-1"
                                >
                                    <Trash2 size={14} /> Hapus
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {loading && (
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-600">Memuat data karyawan...</p>
                </div>
            )}

            {/* --- MODAL TAMBAH KARYAWAN --- */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowAddForm(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-xl mx-auto border border-gray-200 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                            >
                                <X size={24} />
                            </button>
                            
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <Plus className="text-gray-700" size={24} />
                                </div>
                                Tambah Karyawan
                            </h2>

                            <form onSubmit={handleAdd} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Karyawan
                                    </label>
                                    <input
                                        type="text"
                                        value={newKaryawan.nama_karyawan}
                                        onChange={(e) => setNewKaryawan({ ...newKaryawan, nama_karyawan: e.target.value })}
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
                                        value={newKaryawan.alamat}
                                        onChange={(e) => setNewKaryawan({ ...newKaryawan, alamat: e.target.value })}
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
                                        value={newKaryawan.telepon}
                                        onChange={(e) => setNewKaryawan({ ...newKaryawan, telepon: e.target.value })}
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
                                        value={newKaryawan.gaji}
                                        onChange={(e) => setNewKaryawan({ ...newKaryawan, gaji: e.target.value })}
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
                                        value={newKaryawan.id_cabang}
                                        onChange={(e) => setNewKaryawan({ ...newKaryawan, id_cabang: e.target.value })}
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
                                        onClick={() => setShowAddForm(false)}
                                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {loading ? "Menyimpan..." : "Simpan"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- MODAL EDIT KARYAWAN --- */}
            <AnimatePresence>
                {editKaryawan && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setEditKaryawan(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-xl mx-auto border border-gray-200 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setEditKaryawan(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                            >
                                <X size={24} />
                            </button>
                            
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <Edit className="text-gray-700" size={24} />
                                </div>
                                Edit Karyawan
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Karyawan
                                    </label>
                                    <input
                                        type="text"
                                        value={editKaryawan?.nama_karyawan || ""}
                                        onChange={(e) => setEditKaryawan({ ...editKaryawan, nama_karyawan: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Alamat
                                    </label>
                                    <input
                                        type="text"
                                        value={editKaryawan?.alamat || ""}
                                        onChange={(e) => setEditKaryawan({ ...editKaryawan, alamat: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Telepon
                                    </label>
                                    <input
                                        type="text"
                                        value={editKaryawan?.telepon || ""}
                                        onChange={(e) => setEditKaryawan({ ...editKaryawan, telepon: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gaji
                                    </label>
                                    <input
                                        type="number"
                                        value={editKaryawan?.gaji || ""}
                                        onChange={(e) => setEditKaryawan({ ...editKaryawan, gaji: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cabang
                                    </label>
                                    <select
                                        value={editKaryawan?.id_cabang || ""}
                                        onChange={(e) => setEditKaryawan({ ...editKaryawan, id_cabang: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 disabled:opacity-70"
                                        disabled={cabang.length === 0}
                                    >
                                        <option value="">Pilih Cabang</option>
                                        {cabang.map((cab) => (
                                            <option key={cab.id_cabang} value={cab.id_cabang}>
                                                {cab.nama_cabang}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setEditKaryawan(null)}
                                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleUpdate}
                                        className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition font-semibold"
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- CUSTOM POPUPS --- */}
            <ConfirmDeletePopup
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleDelete}
            />
            <SuccessPopup
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                title="Aksi Berhasil! 🎉"
                message={successMessage}
            />
        </div>
    );
};

export default KaryawanPage;