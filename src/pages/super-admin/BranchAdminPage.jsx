// src/pages/AkunAdminAdvertisingPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
// 🎯 Import Loader2
import { UserPlus, Edit, Trash2, X, AlertTriangle, Plus, Loader2 } from "lucide-react"; 
import { ConfirmDeletePopup, SuccessPopup, Card, Button, Modal } from "../../components/ui";

import { Link } from "react-router-dom";
// 🟢 IMPORT useNotification
import { useNotification } from "../../components/context/NotificationContext"; 

const API_URL = "http://localhost:8000/api";

const BranchAdminPage = () => {
    // 🟢 AMBIL addNotification DARI CONTEXT
    const { addNotification } = useNotification();
    
    const [formData, setFormData] = useState({
        nama: "",
        email: "",
        password: "",
        id_cabang: "",
    });

    const [loading, setLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true); // 🎯 State untuk loading data awal/fetch
    const [message, setMessage] = useState("");
    const [admins, setAdmins] = useState([]);
    const [cabang, setCabang] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);

    const [editingAdmin, setEditingAdmin] = useState(null);

    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [deleteName, setDeleteName] = useState(""); // 🟢 DIGUNAKAN UNTUK NOTIFIKASI

    // state untuk custom sukses
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const token = localStorage.getItem("token");

    const fetchAdmins = useCallback(async () => {
        let success = false;
        try {
            const res = await fetch(`${API_URL}/admin-cabang`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setAdmins(data.data || []);
            success = true;
        } catch (err) {
            console.error("Failed to fetch admins:", err);
            setAdmins([]);
             addNotification(`[Admin Cabang] Gagal memuat data admin. Cek koneksi server.`, 'error');
        }
        return success;
    }, [token, addNotification]);

    const fetchCabang = useCallback(async () => {
        let success = false;
        try {
            const res = await fetch(`${API_URL}/cabang-without-admin`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setCabang(data.data || []);
            success = true;
        } catch (err) {
            console.error("Failed to fetch cabang:", err);
            setCabang([]);
        }
        return success;
    }, [token]);

    const initialFetch = useCallback(async () => {
        setIsFetching(true);
        // Jalankan kedua fetch secara paralel
        await Promise.all([fetchAdmins(), fetchCabang()]);
        setIsFetching(false);
    }, [fetchAdmins, fetchCabang]);

    useEffect(() => {
        if (token) {
            initialFetch();
        }
    }, [token, initialFetch]);

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    // 🟢 FUNGSI TAMBAH ADMIN
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Loading untuk submit form
        setMessage("");
        // 🎯 Ambil nama yang akan ditambahkan untuk notifikasi
        const newAdminName = formData.nama; 

        try {
            const res = await fetch(`${API_URL}/create-admin-cabang`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (res.status === 201) {
                setMessage("✅ " + data.message);
                setSuccessMessage(data.message || `Berhasil menambahkan Admin Cabang: ${newAdminName}`);
                setShowSuccess(true);
                
                // ✅ Notifikasi Sukses
                addNotification(`[Admin Cabang] Berhasil menambahkan admin: ${newAdminName}`, 'success'); 

                setFormData({ nama: "", email: "", password: "", id_cabang: "" });
                initialFetch(); // Fetch ulang data setelah berhasil
                setShowAddForm(false);
            } else {
                const errorMsg = data.message || "Gagal menambah Admin Cabang.";
                setMessage("❌ " + errorMsg);
                
                // 🛑 Notifikasi Gagal
                addNotification(`[Admin Cabang] Gagal menambahkan admin: ${errorMsg}`, 'error'); 
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setMessage("❌ Error koneksi server");
            
            // 🛑 Notifikasi Error Koneksi
            addNotification(`[Admin Cabang] Error koneksi saat menambahkan admin.`, 'error'); 
        }
        setLoading(false);
    };

    const confirmDelete = (id, name) => {
        setDeleteId(id);
        setDeleteName(name); // 🟢 Simpan nama untuk konfirmasi
        setShowConfirm(true);
    };

    // Handler untuk menutup success popup
    const closeSuccessPopup = () => {
        setShowSuccess(false);
    };

    const handleEdit = (admin) => {
        setEditingAdmin(admin.id_user);
        setFormData({
            nama: admin.nama,
            email: admin.email,
            password: "",
            id_cabang: admin.cabang?.id_cabang || "",
        });
        setShowAddForm(true);
    };

    // 🟢 FUNGSI UPDATE ADMIN
    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true); // Loading untuk submit form
        setMessage("");

        // 🎯 Ambil nama yang di-edit untuk notifikasi
        const editedAdminName = formData.nama;

        try {
            const res = await fetch(`${API_URL}/admin-cabang/${editingAdmin}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage("✅ " + data.message);
                setSuccessMessage(data.message || `Berhasil mengubah data Admin Cabang: ${editedAdminName}`);
                setShowSuccess(true);
                
                // ✅ Notifikasi Sukses
                addNotification(`[Admin Cabang] Berhasil mengubah data admin: ${editedAdminName}`, 'success');

                setEditingAdmin(null);
                setFormData({ nama: "", email: "", password: "", id_cabang: "" });
                initialFetch(); // Fetch ulang data setelah berhasil
                setShowAddForm(false);
            } else {
                const errorMsg = data.message || "Gagal mengubah Admin Cabang.";
                setMessage("❌ " + errorMsg);
                
                // 🛑 Notifikasi Gagal
                addNotification(`[Admin Cabang] Gagal mengubah admin '${editedAdminName}': ${errorMsg}`, 'error');
            }
        } catch (err) {
            console.error("Update error:", err);
            
            // 🛑 Notifikasi Error Koneksi
            addNotification(`[Admin Cabang] Error koneksi saat mengubah data admin.`, 'error');
        }
        setLoading(false);
    };

    // 🟢 FUNGSI DELETE ADMIN
    const handleDelete = async () => {
        // ⚠️ Hapus konfirmasi dulu sebelum fetch agar tidak ter-block
        setShowConfirm(false); 
        
        // 🎯 deleteName sudah disimpan di confirmDelete
        const nameToDelete = deleteName; 

        try {
            const res = await fetch(`${API_URL}/admin-cabang/${deleteId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json(); // Ambil data response

            if (res.ok) {
                setSuccessMessage(data.message || `Berhasil menghapus Admin Cabang: ${nameToDelete}`);
                setShowSuccess(true);
                
                // ✅ Notifikasi Info Hapus
                addNotification(`[Admin Cabang] Berhasil menghapus admin: ${nameToDelete}`, 'info'); 
                
                initialFetch(); // Fetch ulang data setelah berhasil
            } else {
                const errorMsg = data.message || "Gagal menghapus Admin Cabang.";

                // 🛑 Notifikasi Gagal Hapus
                addNotification(`[Admin Cabang] Gagal menghapus admin '${nameToDelete}': ${errorMsg}`, 'error'); 
                
                // Tampilkan pesan error jika diperlukan di UI, meskipun popup sukses/gagal di-handle oleh notifikasi
                setMessage("❌ " + errorMsg);
            }
        } catch (err) {
            console.error("Delete admin error:", err);
            
            // 🛑 Notifikasi Error Koneksi Hapus
            addNotification(`[Admin Cabang] Error koneksi saat menghapus admin.`, 'error');
        }
        setDeleteId(null);
        setDeleteName("");
    };

    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-green-50 via-white to-green-100">
            <motion.h1
                className="text-4xl font-extrabold text-green-700 mb-8 drop-shadow-sm"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                Kelola Admin Cabang
            </motion.h1>

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-green-700">
                    Daftar Admin Cabang
                </h3>
                <Button 
                    onClick={() => {
                        setEditingAdmin(null); // Pastikan mode tambah
                        setFormData({ nama: "", email: "", password: "", id_cabang: "" }); // Reset form
                        setShowAddForm(true);
                    }}
                    // Nonaktifkan tombol saat fetching data
                    disabled={isFetching}
                >
                    <UserPlus size={18} /> Tambah Admin
                </Button>
            </div>

            {/* 🎯 LOADING INDICATOR (Gaya ReportsPage) */}
            {isFetching && (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                    <p className="ml-3 text-lg text-gray-600 font-medium">Memuat data Admin Cabang...</p>
                </div>
            )}

            {/* Grid daftar admin (Hanya tampil saat TIDAK fetching) */}
            {!isFetching && admins.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {admins.map((admin, index) => (
                        <Card
                            key={admin.id_user}
                            className="relative"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <h2 className="text-lg font-bold text-green-800">{admin.nama}</h2>
                            <p className="text-gray-700 text-sm">{admin.email}</p>
                            <p className="text-gray-600 text-sm mt-1">
                                Cabang: **{admin.cabang ? admin.cabang.nama_cabang : "N/A"}**
                            </p>
                            <div className="flex gap-3 mt-5">
                                <Button
                                    onClick={() => handleEdit(admin)}
                                    variant="warning"
                                >
                                    <Edit size={16} /> Edit
                                </Button>
                                <Button
                                    onClick={() =>
                                        confirmDelete(admin.id_user, admin.nama)
                                    }
                                    variant="danger"
                                >
                                    <Trash2 size={16} /> Hapus
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
            
            {/* Pesan jika tidak ada admin dan tidak sedang fetching */}
            {!isFetching && admins.length === 0 && (
                <p className="text-gray-600 mt-4 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                    Tidak ada Admin Cabang yang terdaftar. Silakan tambahkan admin baru.
                </p>
            )}

            {/* Modal Tambah/Edit */}
            <Modal isOpen={showAddForm} onClose={() => {
                setShowAddForm(false);
                setEditingAdmin(null);
                setFormData({ nama: "", email: "", password: "", id_cabang: "" });
            }}>
                <h2 className="text-xl font-semibold mb-4 text-green-700 flex items-center gap-2">
                    <Plus size={18} /> {editingAdmin ? "Edit Admin Cabang" : "Tambah Admin Cabang"}
                </h2>
                <form
                    onSubmit={editingAdmin ? handleUpdate : handleSubmit}
                    className="space-y-3"
                >
                    <input
                        type="text"
                        name="nama"
                        placeholder="Nama Lengkap"
                        value={formData.nama}
                        onChange={handleChange}
                        className="border rounded-lg px-3 py-2 w-full text-gray-800"
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="border rounded-lg px-3 py-2 w-full text-gray-800"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password (Isi hanya jika ingin mengubah)"
                        value={formData.password}
                        onChange={handleChange}
                        className="border rounded-lg px-3 py-2 w-full text-gray-800"
                        required={!editingAdmin}
                    />

                    <select
                        name="id_cabang"
                        value={formData.id_cabang}
                        onChange={handleChange}
                        className="border rounded-lg px-3 py-2 w-full text-gray-800 disabled:opacity-70 disabled:cursor-not-allowed"
                        required
                        disabled={cabang.length === 0 && !editingAdmin} // Nonaktifkan jika tidak ada cabang kosong DAN bukan mode edit
                    >
                        <option value="">
                            {cabang.length === 0 && !editingAdmin
                                ? "Tidak ada cabang yang belum memiliki admin"
                                : "Pilih Cabang"}
                        </option>
                        {/* Jika mode edit, tampilkan cabang yang sedang diedit (jika ada) + cabang yang tersedia */}
                        {editingAdmin && admins.find(a => a.id_user === editingAdmin)?.cabang && (
                            <option value={admins.find(a => a.id_user === editingAdmin).cabang.id_cabang}>
                                {admins.find(a => a.id_user === editingAdmin).cabang.nama_cabang} (Saat Ini)
                            </option>
                        )}
                        {cabang.map((cab) => (
                            <option key={cab.id_cabang} value={cab.id_cabang}>
                                {cab.nama_cabang}
                            </option>
                        ))}
                    </select>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setShowAddForm(false);
                                setEditingAdmin(null);
                                setFormData({ nama: "", email: "", password: "", id_cabang: "" }); // Reset form
                            }}
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
                    {message && (
                        <p className={`mt-4 text-center text-sm font-medium ${message.includes("❌") ? "text-red-600" : "text-green-600"}`}>
                            {message}
                        </p>
                    )}
                </form>
            </Modal>
            
            {/* Modal Konfirmasi Hapus */}
            <ConfirmDeletePopup
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleDelete}
                // 🟢 TAMBAHKAN KUSTOM PESAN
                message={`Anda yakin ingin menghapus Admin Cabang bernama: ${deleteName}? Aksi ini tidak dapat dibatalkan.`}
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

export default BranchAdminPage;