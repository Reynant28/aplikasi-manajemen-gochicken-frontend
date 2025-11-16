import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, LoaderCircle, AlertTriangle } from "lucide-react";
import { ConfirmDeletePopup, SuccessPopup } from "../../components/ui";
import KaryawanCard from "../../components/karyawan/KaryawanCard";
import KaryawanForm from "../../components/karyawan/KaryawanForm";

const API_URL = "http://localhost:8000/api";

const KaryawanPage = () => {
    const [loading, setLoading] = useState(true); // Changed to true initially
    const [error, setError] = useState(null);
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
            setError("Gagal memuat data karyawan");
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
            setError("Gagal memuat data cabang");
            setCabang([]);
        }
    }, [token]);

    // Combined fetch function
    const fetchAllData = useCallback(async () => {
        if (!token) return;
        
        setLoading(true);
        setError(null);
        
        try {
            await Promise.all([fetchKaryawan(), fetchCabang()]);
        } catch (err) {
            console.error("Failed to fetch all data:", err);
            setError("Gagal memuat data");
        } finally {
            setLoading(false);
        }
    }, [token, fetchKaryawan, fetchCabang]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handleAdd = async (formData) => {
        setLoading(true);
        setError(null);

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
                await fetchAllData(); // Refresh all data
            } else {
                setError(data.message || "Gagal menambahkan karyawan");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Error koneksi server");
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (id) => {
        setDeleteId(id);
        setShowConfirm(true);
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/karyawan/${deleteId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setSuccessMessage("Karyawan berhasil dihapus!");
                setShowSuccess(true);
                await fetchAllData(); // Refresh all data
            } else {
                setError("Gagal menghapus karyawan");
            }
        } catch (err) {
            console.error("Delete karyawan error:", err);
            setError("Error koneksi server saat menghapus");
        } finally {
            setLoading(false);
            setShowConfirm(false);
            setDeleteId(null);
        }
    };

    const handleUpdate = async (formData) => {
        setLoading(true);
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
                await fetchAllData(); // Refresh all data
                setEditKaryawan(null);
            } else {
                setError("Gagal mengupdate karyawan");
            }
        } catch (err) {
            console.error("Update karyawan error:", err);
            setError("Error koneksi server saat mengupdate");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            className="p-6 space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
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

            {/* Loading State - Now shows first */}
            {loading && (
              <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-md border border-gray-100">
                <div className="text-center">
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <LoaderCircle className="animate-spin h-6 w-6 mr-3" /> Memuat...
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <motion.div 
                className="p-5 bg-red-50 text-red-700 rounded-2xl border-2 border-red-200 flex items-start gap-3 shadow-md"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg mb-1">Terjadi Kesalahan</p>
                  <p className="text-sm">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Karyawan Grid - Only shows when not loading and no error */}
            {!loading && !error && (
              <>
                {karyawan.length === 0 ? (
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

            {/* Rest of your components remain the same */}
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
        </motion.div>
    );
};

export default KaryawanPage;