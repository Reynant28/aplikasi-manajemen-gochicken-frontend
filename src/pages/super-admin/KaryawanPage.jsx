// src/pages/KaryawanPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Edit, Trash, X, CircleDollarSign, User, AlertTriangle, CheckCircle, Plus } from "lucide-react";
import { ConfirmDeletePopup, SuccessPopup, Card, Button, Modal } from "../../components/ui";

import { a } from "framer-motion/client";

const API_URL = "http://localhost:8000/api";

const KaryawanPage = () => {
    const [loading, setLoading] = useState(false);
    const [karyawan, setKaryawan] = useState([]);
    const [cabang, setCabang] = useState([]);
    const [newKaryawan, setNewKaryawan] = useState({ id_cabang: "", nama_karyawan: "", alamat: "", telepon: "",  gaji: ""});
    const [editKaryawan, setEditKaryawan] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    // state untuk custom confirm dan success
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

    // Handler untuk menutup success popup
    const closeSuccessPopup = () => {
        setShowSuccess(false);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage("");

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
                // Panggil Success Popup
                setSuccessMessage(data.message || "karyawan berhasil ditambahkan!");
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
                setSuccessMessage("❌ " + (data.message || "Error"));
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setSuccessMessage("❌ Error koneksi server");
        }

        setLoading(false);
    };

    const confirmDelete = (index) => {
        setDeleteId(index);
        setShowConfirm(true);
    };

    const handleDelete = async () => {
        try {
            const res = await fetch(`${API_URL}/karyawan/${deleteId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                // Tampilkan pesan sukses setelah hapus
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
                // Tampilkan pesan sukses setelah update
                setSuccessMessage(`Karywawan ${editKaryawan.nama_karyawan} berhasil diupdate!`);
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
        <div className="min-h-screen p-6 bg-gradient-to-br from-green-50 via-white to-green-100">
            <motion.h1
                className="text-4xl font-extrabold text-green-700 mb-8 drop-shadow-sm"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                Kelola Karyawan
            </motion.h1>

            {/* Tombol tambah cabang */}
            <div className="mb-6">
                <Button onClick={() => setShowAddForm(true)}>
                <Plus size={18} /> Tambah Karyawan
                </Button>
            </div>

            {/* Grid daftar karyawan */}
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
                    <p className="text-gray-700 font-medium">🏢 {item.cabang?.nama_cabang}</p>
                    <p className="text-gray-700 font-medium">🏠 {item.alamat}</p>
                    <p className="text-gray-600 text-sm mt-1">📞 {item.telepon}</p>
                    <p className="text-gray-600 text-sm mt-1">💸 {item.gaji}</p>
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
            {karyawan.length === 0 && !loading && (
                <p className="text-gray-600 mt-4">Belum ada karyawan. Tambah karyawan baru!</p>
            )}

            {loading && <p className="text-gray-600 mt-4">Memuat data karyawan...</p>}

            {/* Modal tambah karyawan */}
            <Modal isOpen={showAddForm} onClose={() => setShowAddForm(false)}>
                <h2 className="text-xl font-semibold mb-4 text-green-700 flex items-center gap-2">
                <Plus size={18} /> Tambah Karyawan
                </h2>
                <form onSubmit={handleAdd}>
                <label className="text-sm font-medium text-gray-700">
                    Nama Karyawan
                </label>
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
                <label className="text-sm font-medium text-gray-700">
                    Alamat
                </label>
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
                <label className="text-sm font-medium text-gray-700">
                    Telepon
                </label>
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
                <label className="text-sm font-medium text-gray-700">
                    Gaji
                </label>
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
                    placeholder="Gaji"
                    required
                />
                <label className="text-sm font-medium text-gray-700">
                    Cabang
                </label>
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
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    >
                    {loading ? "Menyimpan..." : "Simpan"}
                    </button>
                </div>
                </form>
            </Modal>

            {/* Modal edit */}
            <Modal isOpen={!!editKaryawan} onClose={() => setEditKaryawan(null)}>
                <h2 className="text-xl font-semibold mb-4 text-green-700">✏️ Edit Karyawan</h2>
                <label className="text-sm font-medium text-gray-700">
                Nama Karyawan
                </label>
                <input
                type="text"
                value={editKaryawan?.nama_karyawan || ""}
                onChange={(e) =>
                    setEditKaryawan({ ...editKaryawan, nama_karyawan: e.target.value })
                }
                className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
                />
                <label className="text-sm font-medium text-gray-700">
                Alamat
                </label>
                <input
                type="text"
                value={editKaryawan?.alamat || ""}
                onChange={(e) =>
                    setEditKaryawan({ ...editKaryawan, alamat: e.target.value })
                }
                className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
                />
                <label className="text-sm font-medium text-gray-700">
                Telepon
                </label>
                <input
                type="text"
                value={editKaryawan?.telepon || ""}
                onChange={(e) =>
                    setEditKaryawan({ ...editKaryawan, telepon: e.target.value })
                }
                className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
                />
                <label className="text-sm font-medium text-gray-700">
                Gaji
                </label>
                <input
                type="number"
                value={editKaryawan?.gaji || ""}
                onChange={(e) =>
                    setEditKaryawan({ ...editKaryawan, gaji: e.target.value })
                }
                className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
                />
                <label className="text-sm font-medium text-gray-700">
                Cabang
                </label>
                <select
                name="id_cabang"
                value={editKaryawan?.id_cabang || ""}
                onChange={(e) =>
                    setEditKaryawan({ ...editKaryawan, id_cabang: e.target.value })
                }
                className="border rounded-lg px-3 py-2 w-full text-gray-800 disabled:opacity-70 disabled:cursor-not-allowed"
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
                    onClick={() => setEditKaryawan(null)}
                    className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
                >
                    Batal
                </button>
                <button
                    onClick={handleUpdate}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                    Simpan
                </button>
                </div>
            </Modal>

            {/* --- CUSTOM POPUPS (Menggantikan modal bawaan dan menyesuaikan tema) --- */}
            
            {/* Modal Konfirmasi Hapus */}
            <ConfirmDeletePopup
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleDelete}
            />

            {/* Modal Sukses */}
            <SuccessPopup
                isOpen={showSuccess}
                onClose={closeSuccessPopup} // Menggunakan handler untuk menutup
                title="Aksi Berhasil! 🎉"
                message={successMessage}
            />
        </div>
    );
};

export default KaryawanPage;