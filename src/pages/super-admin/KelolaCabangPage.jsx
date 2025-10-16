// src/pages/KelolaCabangPage.jsx
import { useState, useEffect, useCallback } from "react";
// Import Loader2 untuk animasi loading
import { Plus, Edit, Trash, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion";

// 🟢 Import useNotification
import { useNotification } from "../../components/context/NotificationContext";

// 🟢 Import komponen Pop-up dari UI
import { ConfirmDeletePopup, Modal, SuccessPopup } from "../../components/ui"; 

const API_URL = "http://localhost:8000/api";

// --- KelolaCabangPage Component ---
const KelolaCabangPage = () => {
    // 🟢 AMBIL addNotification DARI CONTEXT
    const { addNotification } = useNotification();

    const [loading, setLoading] = useState(false);
    // 🎯 State initialLoad tidak lagi dibutuhkan karena kita akan menggunakan state loading
    // const [initialLoad, setInitialLoad] = useState(true); 
    const [message, setMessage] = useState("");
    const [cabang, setCabang] = useState([]);
    const [newCabang, setNewCabang] = useState({
        nama_cabang: "",
        alamat: "",
        telepon: "",
        password_cabang: "",
    });
    const [editCabang, setEditCabang] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    // state untuk custom hapus
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [deleteName, setDeleteName] = useState(""); 

    // STATE SUKSES DIKEMBALIKAN (Sesuai KaryawanPage)
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const token = localStorage.getItem("token");

    const fetchCabang = useCallback(async () => {
        setLoading(true); // 🎯 Mulai loading
        try {
            const res = await fetch(`${API_URL}/cabang`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setCabang(data.data || []);
        } catch (err) {
            console.error("Failed to fetch cabang:", err);
            setCabang([]);
            // 🛑 Notifikasi Error Fetch
            addNotification(`[Cabang] Gagal memuat data cabang. Cek koneksi server.`, 'error');
        } finally {
            setLoading(false); // 🎯 Selesai loading
        }
    }, [token, addNotification]);

    useEffect(() => {
        if (token) fetchCabang();
    }, [token, fetchCabang]);

    // HANDLER TAMBAH CABANG
    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        const cabangName = newCabang.nama_cabang;

        try {
            const res = await fetch(`${API_URL}/cabang`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newCabang),
            });

            const data = await res.json();
            if (res.status === 201) {
                const msg = data.message || `Cabang ${cabangName} berhasil ditambahkan!`;
                
                // ✅ Toast Notifikasi (untuk history)
                addNotification(`[Cabang] Berhasil menambah cabang: ${cabangName}`, 'success');

                // 🟢 Tampilkan Modal Sukses
                setSuccessMessage(msg);
                setShowSuccess(true);
                
                setNewCabang({
                    nama_cabang: "",
                    alamat: "",
                    telepon: "",
                    password_cabang: "",
                });
                setShowAddForm(false);
                fetchCabang();
            } else {
                const errorMsg = data.message || "Gagal menambah cabang.";
                setMessage("❌ " + errorMsg);
                // 🛑 Toast Notifikasi Gagal
                addNotification(`[Cabang] Gagal menambah cabang '${cabangName}': ${errorMsg}`, 'error');
            }
        } catch (err) {
            console.error("Fetch error:", err);
            const errorMsg = "Error koneksi server";
            setMessage("❌ " + errorMsg);
            // 🛑 Toast Notifikasi Error Koneksi
            addNotification(`[Cabang] Error koneksi saat menambah cabang.`, 'error');
        }

        setLoading(false);
    };

    // HANDLER KONFIRMASI DELETE
    const confirmDelete = (id) => {
        const itemToDelete = cabang.find(c => c.id_cabang === id);
        setDeleteId(id);
        setDeleteName(itemToDelete?.nama_cabang || `ID ${id}`);
        setShowConfirm(true);
    };

    // HANDLER DELETE CABANG
    const handleDelete = async () => {
        setShowConfirm(false);
        const nameToDelete = deleteName;

        try {
            const res = await fetch(`${API_URL}/cabang/${deleteId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (res.ok) {
                const msg = data.message || `Cabang ${nameToDelete} berhasil dihapus!`;
                
                // ✅ Toast Notifikasi Sukses
                addNotification(`[Cabang] Berhasil menghapus cabang: ${nameToDelete}`, 'info');

                // 🟢 Tampilkan Modal Sukses
                setSuccessMessage(msg);
                setShowSuccess(true); 
                
                fetchCabang();
            } else {
                const errorMsg = data.message || "Gagal menghapus cabang.";
                // 🛑 Toast Notifikasi Gagal Hapus
                addNotification(`[Cabang] Gagal menghapus cabang '${nameToDelete}': ${errorMsg}`, 'error');
            }
        } catch (err) {
            console.error("Delete cabang error:", err);
            // 🛑 Toast Notifikasi Error Koneksi Hapus
            addNotification(`[Cabang] Error koneksi saat menghapus cabang.`, 'error');
        }
        setDeleteId(null);
        setDeleteName("");
    };

    // HANDLER UPDATE CABANG
    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editCabang) return;
        setLoading(true);
        const updatedName = editCabang.nama_cabang;

        try {
            const res = await fetch(`${API_URL}/cabang/${editCabang.id_cabang}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editCabang),
            });

            const data = await res.json();

            if (res.ok) {
                const msg = data.message || `Cabang ${updatedName} berhasil diupdate!`;
                
                // ✅ Toast Notifikasi Sukses Update
                addNotification(`[Cabang] Berhasil mengubah data cabang: ${updatedName}`, 'success');

                // 🟢 Tampilkan Modal Sukses
                setSuccessMessage(msg);
                setShowSuccess(true);
                
                await fetchCabang();
                setEditCabang(null);
            } else {
                const errorMsg = data.message || "Gagal update cabang.";
                // 🛑 Toast Notifikasi Gagal Update
                addNotification(`[Cabang] Gagal mengubah cabang '${updatedName}': ${errorMsg}`, 'error');
            }
        } catch (err) {
            console.error("Update cabang error:", err);
            // 🛑 Toast Notifikasi Error Koneksi Update
            addNotification(`[Cabang] Error koneksi saat mengubah data cabang.`, 'error');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-green-50 via-white to-green-100">
            <motion.h1
                className="text-4xl font-extrabold text-green-700 mb-8 drop-shadow-sm"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                Kelola Cabang
            </motion.h1>

            {/* Tombol tambah cabang */}
            <div className="mb-6">
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md"
                    // Nonaktifkan saat sedang loading
                    disabled={loading}
                >
                    <Plus size={18} /> Tambah Cabang
                </button>
            </div>

            {/* 🎯 Loading Indicator (Gaya ReportsPage) */}
            {loading && (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                    <p className="ml-3 text-gray-600">Memuat data cabang...</p>
                </div>
            )}
            
            {/* Grid daftar cabang (Hanya tampil saat tidak loading) */}
            {!loading && (
                <motion.div
                    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {cabang.length === 0 ? (
                        <div className="col-span-full p-6 bg-white rounded-xl shadow border-l-4 border-yellow-500">
                            <p className="text-gray-600">Tidak ada data cabang yang ditemukan.</p>
                        </div>
                    ) : (
                        cabang.map((branch, index) => (
                            <motion.div
                                key={branch.id_cabang}
                                className="bg-white shadow-lg rounded-xl p-6 border-t-4 border-green-600"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <h3 className="text-xl font-bold text-green-800 mb-1">
                                    {branch.nama_cabang}
                                </h3>
                                <p className="text-gray-700 font-medium">🏠 {branch.alamat}</p>
                                <p className="text-gray-600 text-sm mt-1">📞 {branch.telepon}</p>
                                <div className="flex gap-3 mt-5">
                                    <button
                                        onClick={() => setEditCabang(branch)}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                                    >
                                        <Edit size={16} /> <span>Edit</span>
                                    </button>
                                    <button
                                        onClick={() => confirmDelete(branch.id_cabang)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                                    >
                                        <Trash size={16} /> <span>Hapus</span>
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            )}

            {/* Modal tambah cabang (Menggunakan Modal dari UI) */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowAddForm(false)}
                    >
                        {/* Konten Modal Tambah */}
                        <motion.div 
                            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border-t-4 border-green-600"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-semibold mb-4 text-green-700 flex items-center gap-2">
                                <Plus size={18} /> Tambah Cabang
                            </h2>
                            <form onSubmit={handleAdd}>
                                <label className="block text-sm font-medium text-gray-700">Nama Cabang</label>
                                <input
                                    type="text"
                                    value={newCabang.nama_cabang}
                                    onChange={(e) =>
                                        setNewCabang({ ...newCabang, nama_cabang: e.target.value })
                                    }
                                    className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
                                    placeholder="Nama Cabang"
                                    required
                                />
                                <label className="block text-sm font-medium text-gray-700">Alamat</label>
                                <input
                                    type="text"
                                    value={newCabang.alamat}
                                    onChange={(e) =>
                                        setNewCabang({ ...newCabang, alamat: e.target.value })
                                    }
                                    className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
                                    placeholder="Alamat"
                                    required
                                />
                                <label className="block text-sm font-medium text-gray-700">Telepon</label>
                                <input
                                    type="text"
                                    value={newCabang.telepon}
                                    onChange={(e) =>
                                        setNewCabang({ ...newCabang, telepon: e.target.value })
                                    }
                                    className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
                                    placeholder="Telepon"
                                    required
                                />
                                <label className="block text-sm font-medium text-gray-700">Password Cabang</label>
                                <input
                                    type="password"
                                    value={newCabang.password_cabang}
                                    onChange={(e) =>
                                        setNewCabang({
                                            ...newCabang,
                                            password_cabang: e.target.value,
                                        })
                                    }
                                    className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
                                    placeholder="Password Cabang"
                                    required
                                />
                                <div className="flex justify-end gap-3 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(false)}
                                        className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
                                    >
                                        {loading ? "Menyimpan..." : "Simpan"}
                                    </button>
                                </div>
                            </form>
                            {/* Menampilkan pesan error jika ada */}
                            {message && (
                                <p className={`mt-4 text-center text-sm font-medium ${message.includes("❌") ? "text-red-600" : "text-green-600"}`}>
                                    {message}
                                </p>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal edit (Menggunakan Modal dari UI) */}
            <AnimatePresence>
                {editCabang && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setEditCabang(null)}
                    >
                        {/* Konten Modal Edit */}
                        <motion.div 
                            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border-t-4 border-green-600"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-semibold mb-4 text-green-700">
                                ✏️ Edit Cabang
                            </h2>
                            <form onSubmit={handleUpdate}>
                                <label className="block text-sm font-medium text-gray-700">Nama Cabang</label>
                                <input
                                    type="text"
                                    value={editCabang.nama_cabang}
                                    onChange={(e) =>
                                        setEditCabang({ ...editCabang, nama_cabang: e.target.value })
                                    }
                                    className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
                                    required
                                />
                                <label className="block text-sm font-medium text-gray-700">Alamat</label>
                                <input
                                    type="text"
                                    value={editCabang.alamat}
                                    onChange={(e) =>
                                        setEditCabang({ ...editCabang, alamat: e.target.value })
                                    }
                                    className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
                                    required
                                />
                                <label className="block text-sm font-medium text-gray-700">Telepon</label>
                                <input
                                    type="text"
                                    value={editCabang.telepon}
                                    onChange={(e) =>
                                        setEditCabang({ ...editCabang, telepon: e.target.value })
                                    }
                                    className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
                                    required
                                />
                                <div className="flex justify-end gap-3 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditCabang(null)}
                                        className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
                                    >
                                        {loading ? "Menyimpan..." : "Simpan"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Konfirmasi Hapus (Menggunakan Komponen UI) */}
            <ConfirmDeletePopup
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleDelete}
                // Mengirim pesan yang lebih spesifik
                message={`Anda yakin ingin menghapus cabang: ${deleteName}? Tindakan ini tidak dapat dibatalkan.`}
            />

            {/* 🟢 Modal Sukses (Menggunakan Komponen UI) */}
            <SuccessPopup
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                title="Aksi Berhasil! 🎉"
                message={successMessage}
            />
        </div>
    );
};

export default KelolaCabangPage;