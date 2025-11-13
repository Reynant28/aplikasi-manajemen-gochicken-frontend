import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, AlertTriangle, RefreshCw } from "lucide-react";
import { ConfirmDeletePopup, SuccessPopup } from "../../components/ui";
import KaryawanForm from "../../components/karyawan/KaryawanForm";
import KaryawanCard from "../../components/karyawan/KaryawanCard";
import axios from 'axios';

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
    const [loading, setLoading] = useState(true);
    const [karyawan, setKaryawan] = useState([]);
    const [newKaryawan, setNewKaryawan] = useState({ 
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
    const [error, setError] = useState(null);

    const token = localStorage.getItem("token");
    const cabang = JSON.parse(localStorage.getItem("cabang") || "null");
    const cabangId = cabang?.id_cabang;

    const fetchKaryawan = useCallback(async () => {
        if (!cabangId) {
            setError("Data cabang tidak ditemukan.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_URL}/cabang/${cabangId}/karyawan`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.data.status === 'success') {
                setKaryawan(res.data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch karyawan:", err);
            setError("Gagal mengambil data karyawan.");
            setKaryawan([]);
        } finally {
            setLoading(false);
        }
    }, [token, cabangId]);

    useEffect(() => {
        if (token) {
            fetchKaryawan();
        }
    }, [token, fetchKaryawan]);

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const karyawanData = {
                ...newKaryawan,
                id_cabang: cabangId
            };

            const res = await axios.post(`${API_URL}/karyawan`, karyawanData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.data.status === 'success') {
                setSuccessMessage(res.data.message || "Karyawan berhasil ditambahkan!");
                setShowSuccess(true);
                setNewKaryawan({
                    nama_karyawan: "",
                    alamat: "",
                    telepon: "",
                    gaji: ""
                });
                setShowAddForm(false);
                fetchKaryawan();
            }
        } catch (err) {
            console.error("Add karyawan error:", err);
            const errorMsg = err.response?.data?.message || "Gagal menambahkan karyawan.";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (karyawan) => {
        setDeleteId(karyawan.id_karyawan);
        setShowConfirm(true);
    };

    const handleDelete = async () => {
        try {
            const res = await axios.delete(`${API_URL}/karyawan/${deleteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.data.status === 'success') {
                setSuccessMessage("Karyawan berhasil dihapus!");
                setShowSuccess(true);
                fetchKaryawan();
            }
        } catch (err) {
            console.error("Delete karyawan error:", err);
            const errorMsg = err.response?.data?.message || "Gagal menghapus karyawan.";
            setError(errorMsg);
        }
        setShowConfirm(false);
        setDeleteId(null);
    };

    const handleUpdate = async () => {
        try {
            const karyawanData = {
                ...editKaryawan,
                id_cabang: cabangId
            };

            const res = await axios.put(`${API_URL}/karyawan/${editKaryawan.id_karyawan}`, karyawanData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.data.status === 'success') {
                setSuccessMessage(`Karyawan ${editKaryawan.nama_karyawan} berhasil diupdate!`);
                setShowSuccess(true);
                await fetchKaryawan();
                setEditKaryawan(null);
            }
        } catch (err) {
            console.error("Update karyawan error:", err);
            const errorMsg = err.response?.data?.message || "Gagal mengupdate karyawan.";
            setError(errorMsg);
        }
    };

    // Clear error when modal opens/closes
    useEffect(() => {
        if (showAddForm || editKaryawan) {
            setError(null);
        }
    }, [showAddForm, editKaryawan]);

    return (
        <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl font-bold text-gray-800">Kelola Karyawan</h1>
                    <p className="text-gray-500 mt-1">
                        Manajemen data karyawan untuk cabang <strong>{cabang?.nama_cabang || 'N/A'}</strong>
                    </p>
                </motion.div>
                
                <motion.button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 bg-gray-600 text-white px-5 py-2.5 rounded-lg hover:bg-gray-700 transition-all shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Plus size={20} /> Tambah Karyawan
                </motion.button>
            </div>

            {/* Error Message */}
            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200"
                >
                    <AlertTriangle size={20} />
                    <span className="font-medium">{error}</span>
                    <button 
                        onClick={() => setError(null)}
                        className="ml-auto text-red-500 hover:text-red-700"
                    >
                        <X size={16} />
                    </button>
                </motion.div>
            )}

            {/* Loading State */}
            {loading && karyawan.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl shadow-md border border-gray-100">
                    <RefreshCw className="animate-spin text-gray-400 mb-4" size={32} />
                    <p className="text-gray-500">Memuat data karyawan...</p>
                </div>
            ) : (
                <>
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
                </>
            )}

            {/* Add Karyawan Form */}
            <AnimatePresence>
                {showAddForm && (
                    <KaryawanForm
                        isOpen={showAddForm}
                        onClose={() => setShowAddForm(false)}
                        karyawanData={newKaryawan}
                        onChange={setNewKaryawan}
                        onSubmit={handleAdd}
                        loading={loading}
                        isEdit={false}
                    />
                )}
            </AnimatePresence>

            {/* Edit Karyawan Form */}
            <AnimatePresence>
                {editKaryawan && (
                    <KaryawanForm
                        isOpen={!!editKaryawan}
                        onClose={() => setEditKaryawan(null)}
                        karyawanData={editKaryawan}
                        onChange={setEditKaryawan}
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleUpdate();
                        }}
                        loading={loading}
                        isEdit={true}
                    />
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