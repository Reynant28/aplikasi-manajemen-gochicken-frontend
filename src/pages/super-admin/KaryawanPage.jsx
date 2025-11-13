import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users } from "lucide-react";
import { ConfirmDeletePopup, SuccessPopup } from "../../components/ui";
import KaryawanCard from "../../components/karyawan/KaryawanCard";
import KaryawanForm from "../../components/karyawan/KaryawanForm";

const API_URL = "http://localhost:8000/api";

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

    const handleAdd = async (formData) => {
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/karyawan`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
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

    const handleUpdate = async (formData) => {
        try {
            const res = await fetch(`${API_URL}/karyawan/${formData.id_karyawan}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                setSuccessMessage(`Karyawan ${formData.nama_karyawan} berhasil diupdate!`);
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
                        <KaryawanCard
                            key={item.id_karyawan}
                            karyawan={item}
                            index={index}
                            onEdit={setEditKaryawan}
                            onDelete={confirmDelete}
                        />
                    ))}
                </div>
            )}

            {loading && (
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-600">Memuat data karyawan...</p>
                </div>
            )}

            {/* Add Karyawan Form */}
            <AnimatePresence>
                <KaryawanForm
                    isOpen={showAddForm}
                    onClose={() => setShowAddForm(false)}
                    onSubmit={handleAdd}
                    formData={newKaryawan}
                    onFormChange={setNewKaryawan}
                    cabang={cabang}
                    loading={loading}
                    mode="add"
                />
            </AnimatePresence>

            {/* Edit Karyawan Form */}
            <AnimatePresence>
                <KaryawanForm
                    isOpen={!!editKaryawan}
                    onClose={() => setEditKaryawan(null)}
                    onSubmit={handleUpdate}
                    formData={editKaryawan || {}}
                    onFormChange={setEditKaryawan}
                    cabang={cabang}
                    mode="edit"
                />
            </AnimatePresence>

            {/* Custom Popups */}
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