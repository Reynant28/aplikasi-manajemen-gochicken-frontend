// src/pages/KaryawanPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
// 🎯 Import Loader2
import { PlusCircle, Edit, Trash, X, CircleDollarSign, User, AlertTriangle, CheckCircle, Plus, Loader2 } from "lucide-react";
import { ConfirmDeletePopup, SuccessPopup, Card, Button, Modal } from "../../components/ui";

// 🟢 IMPORT useNotification
import { useNotification } from "../../components/context/NotificationContext";

const API_URL = "http://localhost:8000/api";

// 🟢 FUNGSI HELPER UNTUK FORMAT RUPIAH
const formatRupiah = (angka) => {
    // Pastikan angka adalah string atau number yang valid sebelum diformat
    if (angka === null || angka === undefined) return "Rp 0";
    let numberString = String(angka).replace(/[^\d]/g, ''); // Hapus semua non-digit kecuali tanda desimal jika ada
    let parts = numberString.split('.');
    let integerPart = parts[0];
    
    // Format bagian integer dengan titik sebagai pemisah ribuan
    let formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    // Gabungkan kembali dengan bagian desimal (jika ada)
    if (parts.length > 1) {
        formatted += ',' + parts[1];
    }

    return `Rp ${formatted}`;
};

const KaryawanPage = () => {
    // 🟢 AMBIL addNotification DARI CONTEXT
    const { addNotification } = useNotification();

    const [loading, setLoading] = useState(false);
    const [karyawan, setKaryawan] = useState([]);
    const [cabang, setCabang] = useState([]);
    const [newKaryawan, setNewKaryawan] = useState({ id_cabang: "", nama_karyawan: "", alamat: "", telepon: "", gaji: ""});
    const [editKaryawan, setEditKaryawan] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    // state untuk custom confirm dan success
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    // 🟢 STATE BARU: Menyimpan nama karyawan yang akan dihapus
    const [deleteName, setDeleteName] = useState(""); 

    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const token = localStorage.getItem("token");

    const fetchKaryawan = useCallback(async () => {
        setLoading(true); // 🎯 MULAI LOADING
        try {
            const res = await fetch(`${API_URL}/karyawan`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setKaryawan(data.data || []);
        } catch (err) {
            console.error("Failed to fetch karyawan:", err);
            setKaryawan([]);
            // 🛑 Notifikasi Error Fetch
            addNotification(`[Karyawan] Gagal memuat data karyawan. Cek koneksi server.`, 'error');
        } finally {
            setLoading(false); // 🎯 SELESAI LOADING
        }
    }, [token, addNotification]);

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

    // Handler untuk menutup success popup
    const closeSuccessPopup = () => {
        setShowSuccess(false);
    };

    // 🟢 HANDLER TAMBAH KARYAWAN
    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage("");
        const karyawanName = newKaryawan.nama_karyawan; // 🎯 Ambil nama untuk notifikasi

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
                const msg = data.message || `Karyawan ${karyawanName} berhasil ditambahkan!`;
                
                // ✅ Notifikasi Sukses
                addNotification(`[Karyawan] Berhasil menambah karyawan: ${karyawanName}`, 'success');

                setSuccessMessage(msg);
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
            } else {
                const errorMsg = data.message || "Gagal menambah karyawan.";
                setSuccessMessage("❌ " + errorMsg);
                // 🛑 Notifikasi Gagal
                addNotification(`[Karyawan] Gagal menambah karyawan '${karyawanName}': ${errorMsg}`, 'error');
            }
        } catch (err) {
            console.error("Fetch error:", err);
            const errorMsg = "Error koneksi server.";
            setSuccessMessage("❌ " + errorMsg);
            // 🛑 Notifikasi Error Koneksi
            addNotification(`[Karyawan] Error koneksi saat menambah karyawan.`, 'error');
        }

        setLoading(false);
    };

    // 🟢 HANDLER KONFIRMASI DELETE
    const confirmDelete = (id) => {
        const itemToDelete = karyawan.find(k => k.id_karyawan === id);
        setDeleteId(id);
        setDeleteName(itemToDelete?.nama_karyawan || `ID ${id}`); // Simpan nama
        setShowConfirm(true);
    };

    // 🟢 HANDLER DELETE KARYAWAN
    const handleDelete = async () => {
        setShowConfirm(false); // Tutup modal konfirmasi
        const nameToDelete = deleteName; // 🎯 Ambil nama yang sudah disimpan

        try {
            const res = await fetch(`${API_URL}/karyawan/${deleteId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            
            if (res.ok) {
                const msg = data.message || `Karyawan ${nameToDelete} berhasil dihapus!`;
                
                // 🛑 PERUBAHAN DI SINI: Mengubah tipe dari 'info' menjadi 'error'
                addNotification(`[Karyawan] Berhasil menghapus karyawan: ${nameToDelete}`, 'error');
                
                setSuccessMessage(msg);
                setShowSuccess(true); 
                fetchKaryawan();
                fetchCabang();
            } else {
                const errorMsg = data.message || "Gagal menghapus karyawan.";
                setSuccessMessage("❌ " + errorMsg);
                // 🛑 Notifikasi Gagal Hapus
                addNotification(`[Karyawan] Gagal menghapus karyawan '${nameToDelete}': ${errorMsg}`, 'error');
            }
        } catch (err) {
            console.error("Delete karyawan error:", err);
            // 🛑 Notifikasi Error Koneksi Hapus
            addNotification(`[Karyawan] Error koneksi saat menghapus karyawan.`, 'error');
        }
        setDeleteId(null);
        setDeleteName("");
    };

    // 🟢 HANDLER UPDATE KARYAWAN
    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editKaryawan) return;
        setLoading(true);

        const updatedName = editKaryawan.nama_karyawan; // 🎯 Ambil nama untuk notifikasi

        try {
            const res = await fetch(`${API_URL}/karyawan/${editKaryawan.id_karyawan}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editKaryawan),
            });

            const data = await res.json();
            if (res.ok) {
                const msg = data.message || `Karyawan ${updatedName} berhasil diupdate!`;
                
                // ✅ Notifikasi Sukses Update
                addNotification(`[Karyawan] Berhasil mengubah data karyawan: ${updatedName}`, 'success');

                setSuccessMessage(msg);
                setShowSuccess(true);
                await fetchKaryawan();
                await fetchCabang();
                setEditKaryawan(null);
            } else {
                const errorMsg = data.message || "Gagal update karyawan.";
                // 🛑 Notifikasi Gagal Update
                addNotification(`[Karyawan] Gagal mengubah karyawan '${updatedName}': ${errorMsg}`, 'error');
            }
        } catch (err) {
            console.error("Update karyawan error:", err);
            // 🛑 Notifikasi Error Koneksi Update
            addNotification(`[Karyawan] Error koneksi saat mengubah data karyawan.`, 'error');
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
                Kelola Karyawan
            </motion.h1>

            {/* Tombol tambah karyawan */}
            <div className="mb-6">
                <Button 
                    onClick={() => setShowAddForm(true)}
                    // 🎯 Nonaktifkan tombol saat loading
                    disabled={loading}
                >
                    <Plus size={18} /> Tambah Karyawan
                </Button>
            </div>

            {/* 🎯 LOADING INDICATOR (Gaya ReportsPage) */}
            {loading && (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                    <p className="ml-3 text-lg text-gray-600 font-medium">Memuat data karyawan...</p>
                </div>
            )}
            
            {/* Grid daftar karyawan (Hanya tampil saat TIDAK loading) */}
            {!loading && (
                <>
                    <motion.div
                        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {karyawan.map((item, index) => (
                        <Card
                            key={item.id_karyawan}
                            className="relative"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <h3 className="text-xl font-bold text-green-800 mb-1">
                            {item.nama_karyawan}
                            </h3>
                            <p className="text-gray-700 font-medium">🏢 {item.cabang?.nama_cabang || "N/A"}</p>
                            <p className="text-gray-700 font-medium">🏠 {item.alamat}</p>
                            <p className="text-gray-600 text-sm mt-1">📞 {item.telepon}</p>
                            {/* 🟢 PERUBAHAN DI SINI: Format Gaji */}
                            <p className="text-lg font-bold text-green-600 mt-2">
                                {formatRupiah(item.gaji)} 
                            </p>
                            <div className="flex gap-3 mt-5">
                            <Button variant="warning" onClick={() => setEditKaryawan(item)}>
                                <Edit size={16} /> Edit
                            </Button>
                            <Button variant="danger" onClick={() => confirmDelete(item.id_karyawan)}>
                                <Trash size={16} /> Hapus
                            </Button>
                            </div>
                        </Card>
                        ))}
                    </motion.div>
                    {karyawan.length === 0 && (
                        <p className="text-gray-600 mt-4 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                            Belum ada karyawan. Tambah karyawan baru!
                        </p>
                    )}
                </>
            )}

            {/* Modal tambah karyawan */}
            <Modal isOpen={showAddForm} onClose={() => setShowAddForm(false)}>
                <h2 className="text-xl font-semibold mb-4 text-green-700 flex items-center gap-2">
                <Plus size={18} /> Tambah Karyawan
                </h2>
                <form onSubmit={handleAdd}>
                <label className="text-sm font-medium text-gray-700">Nama Karyawan</label>
                <input
                    type="text"
                    value={newKaryawan.nama_karyawan}
                    onChange={(e) =>
                    setNewKaryawan({ ...newKaryawan, nama_karyawan: e.target.value })
                    }
                    className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
                    placeholder="Nama Karyawan"
                    required
                />
                <label className="text-sm font-medium text-gray-700">Alamat</label>
                <input
                    type="text"
                    value={newKaryawan.alamat}
                    onChange={(e) =>
                    setNewKaryawan({ ...newKaryawan, alamat: e.target.value })
                    }
                    className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
                    placeholder="Alamat"
                    required
                />
                <label className="text-sm font-medium text-gray-700">Telepon</label>
                <input
                    type="text"
                    value={newKaryawan.telepon}
                    onChange={(e) =>
                    setNewKaryawan({ ...newKaryawan, telepon: e.target.value })
                    }
                    className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
                    placeholder="Telepon"
                    required
                />
                <label className="text-sm font-medium text-gray-700">Gaji (Angka)</label>
                <input
                    type="number"
                    value={newKaryawan.gaji}
                    onChange={(e) =>
                    setNewKaryawan({
                        ...newKaryawan,
                        gaji: e.target.value,
                    })
                    }
                    className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
                    placeholder="Contoh: 3000000"
                    required
                />
                <label className="text-sm font-medium text-gray-700">Cabang</label>
                <select
                    name="id_cabang"
                    value={newKaryawan.id_cabang}
                    onChange={(e) =>
                    setNewKaryawan({ ...newKaryawan, id_cabang: e.target.value })
                    }
                    className="border rounded-lg px-3 py-2 w-full text-gray-800 disabled:opacity-70 disabled:cursor-not-allowed"
                    required
                    disabled={cabang.length === 0}
                >
                    <option value="">
                    {cabang.length === 0
                        ? "Tidak ada cabang tersedia"
                        : "Pilih Cabang"}
                    </option>
                    {cabang.map((cab) => (
                    <option key={cab.id_cabang} value={cab.id_cabang}>
                        {cab.nama_cabang}
                    </option>
                    ))}
                </select>
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
            </Modal>

            {/* Modal edit */}
            <Modal isOpen={!!editKaryawan} onClose={() => setEditKaryawan(null)}>
                <h2 className="text-xl font-semibold mb-4 text-green-700 flex items-center gap-2">
                    <Edit size={20} /> Edit Karyawan
                </h2>
                <form onSubmit={handleUpdate}>
                    <label className="text-sm font-medium text-gray-700">Nama Karyawan</label>
                    <input
                    type="text"
                    value={editKaryawan?.nama_karyawan || ""}
                    onChange={(e) =>
                        setEditKaryawan({ ...editKaryawan, nama_karyawan: e.target.value })
                    }
                    className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
                    required
                    />
                    <label className="text-sm font-medium text-gray-700">Alamat</label>
                    <input
                    type="text"
                    value={editKaryawan?.alamat || ""}
                    onChange={(e) =>
                        setEditKaryawan({ ...editKaryawan, alamat: e.target.value })
                    }
                    className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
                    required
                    />
                    <label className="text-sm font-medium text-gray-700">Telepon</label>
                    <input
                    type="text"
                    value={editKaryawan?.telepon || ""}
                    onChange={(e) =>
                        setEditKaryawan({ ...editKaryawan, telepon: e.target.value })
                    }
                    className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
                    required
                    />
                    <label className="text-sm font-medium text-gray-700">Gaji (Angka)</label>
                    {/* 🟢 PERUBAHAN DI SINI: Input Gaji */}
                    <input
                    type="number"
                    value={editKaryawan?.gaji || ""}
                    onChange={(e) =>
                        setEditKaryawan({ ...editKaryawan, gaji: e.target.value })
                    }
                    className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
                    required
                    />
                    <label className="text-sm font-medium text-gray-700">Cabang</label>
                    <select
                    name="id_cabang"
                    value={editKaryawan?.id_cabang || ""}
                    onChange={(e) =>
                        setEditKaryawan({ ...editKaryawan, id_cabang: e.target.value })
                    }
                    className="border rounded-lg px-3 py-2 w-full text-gray-800 disabled:opacity-70 disabled:cursor-not-allowed"
                    required
                    disabled={cabang.length === 0}
                    >
                        <option value="">Pilih Cabang</option>
                        {cabang.map((cab) => (
                            <option key={cab.id_cabang} value={cab.id_cabang}>
                            {cab.nama_cabang}
                            </option>
                        ))}
                    </select>
                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={() => setEditKaryawan(null)}
                            className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading} // Nonaktifkan saat submit
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
                        >
                            {loading ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* --- CUSTOM POPUPS --- */}
            
            {/* Modal Konfirmasi Hapus */}
            <ConfirmDeletePopup
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleDelete}
                // 🟢 TAMBAHKAN PESAN SPESIFIK
                message={`Anda yakin ingin menghapus karyawan bernama: ${deleteName}? Aksi ini tidak dapat dibatalkan.`}
            />

            {/* Modal Sukses */}
            <SuccessPopup
                isOpen={showSuccess}
                onClose={closeSuccessPopup}
                title="Aksi Berhasil! 🎉"
                message={successMessage}
            />
        </div>
    );
};

export default KaryawanPage;