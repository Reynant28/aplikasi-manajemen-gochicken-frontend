// src/pages/KelolaCabangPage.jsx
import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash, AlertTriangle, CheckCircle } from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:8000/api";

// --- Custom SuccessPopup Component DENGAN COUNTDOWN ---
const SuccessPopup = ({ isOpen, onClose, title, message }) => {
    const [countdown, setCountdown] = useState(4); // State untuk hitungan mundur

    // Efek untuk mengelola countdown
    useEffect(() => {
        if (isOpen) {
            setCountdown(4); // Reset hitungan saat modal dibuka
            
            const timerInterval = setInterval(() => {
                setCountdown((prevCount) => {
                    if (prevCount <= 1) {
                        clearInterval(timerInterval);
                        onClose(); // Tutup modal saat hitungan mencapai 0
                        return 0;
                    }
                    return prevCount - 1;
                });
            }, 1000); // Hitungan setiap 1 detik

            // Cleanup function untuk membersihkan interval
            return () => clearInterval(timerInterval);
        }
    }, [isOpen, onClose]); // Dependensi: isOpen dan onClose

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    // Background putih transparan
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
                            
                            {/* Tampilan Countdown */}
                            <p className="text-xs text-gray-500 font-bold text-center mt-2">
                                (Otomatis tertutup dalam {countdown} detik)
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <button
                                type="button"
                                onClick={onClose}
                                // Tombol dinonaktifkan sementara selama hitungan mundur (opsional)
                                // disabled={countdown > 0} 
                                className="w-full py-3 px-4 text-sm font-medium rounded-lg text-white bg-green-500 hover:bg-green-600 transition-colors disabled:bg-green-300"
                            >
                                Tutup
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
                                Konfirmasi Hapus
                            </h2>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Apakah Anda yakin ingin menghapus cabang ini? Tindakan ini tidak dapat dibatalkan.
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


// --- KelolaCabangPage Component ---
const KelolaCabangPage = () => {
    const [loading, setLoading] = useState(false);
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

    // state untuk custom sukses
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const token = localStorage.getItem("token");

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
        if (token) fetchCabang();
    }, [token, fetchCabang]);

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

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
                // Panggil Success Popup
                setSuccessMessage(data.message || "Cabang berhasil ditambahkan!");
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
                setMessage("❌ " + (data.message || "Error"));
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setMessage("❌ Error koneksi server");
        }

        setLoading(false);
    };

    // buka modal konfirmasi hapus
    const confirmDelete = (id) => {
        setDeleteId(id);
        setShowConfirm(true);
    };

    // eksekusi hapus setelah konfirmasi
    const handleDelete = async () => {
        try {
            const res = await fetch(`${API_URL}/cabang/${deleteId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                // Tampilkan pesan sukses setelah hapus
                setSuccessMessage("Cabang berhasil dihapus!");
                setShowSuccess(true); 
                fetchCabang();
            }
        } catch (err) {
            console.error("Delete cabang error:", err);
        }
        setShowConfirm(false);
        setDeleteId(null);
    };

    const handleUpdate = async () => {
        try {
            const res = await fetch(`${API_URL}/cabang/${editCabang.id_cabang}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editCabang),
            });
            if (res.ok) {
                // Tampilkan pesan sukses setelah update
                setSuccessMessage(`Cabang ${editCabang.nama_cabang} berhasil diupdate!`);
                setShowSuccess(true);
                await fetchCabang();
                setEditCabang(null);
            }
        } catch (err) {
            console.error("Update cabang error:", err);
        }
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
        <Button onClick={() => setShowAddForm(true)}>
          <Plus size={18} /> Tambah Cabang
        </Button>
      </div>
      

      {/* Grid daftar cabang */}
      <motion.div
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {cabang.map((branch, index) => (
          <Card
            key={branch.id_cabang}
            className="relative"
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
              <Button variant="warning" onClick={() => setEditCabang(branch)}>
                <Edit size={16} /> Edit
              </Button>
              <Button variant="danger" onClick={() => confirmDelete(branch.id_cabang)}>
                <Trash size={16} /> Hapus
              </Button>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Modal tambah cabang */}
      <Modal isOpen={showAddForm} onClose={() => setShowAddForm(false)}>
        <h2 className="text-xl font-semibold mb-4 text-green-700 flex items-center gap-2">
          <Plus size={18} /> Tambah Cabang
        </h2>
        <form onSubmit={handleAdd}>
          <label className="text-sm font-medium text-gray-700">
            Nama Cabang
          </label>
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
          <label className="text-sm font-medium text-gray-700">
            Alamat
          </label>
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
          <label className="text-sm font-medium text-gray-700">
            Telepon
          </label>
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
          <label className="text-sm font-medium text-gray-700">
            Password Cabang
          </label>
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
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal edit */}
      
      <Modal isOpen={!!editCabang} onClose={() => setEditCabang(null)}>
        <h2 className="text-xl font-semibold mb-4 text-green-700">✏️ Edit Cabang</h2>
        <label className="text-sm font-medium text-gray-700">
          Nama Cabang
        </label>
        <input
          type="text"
          value={editCabang?.nama_cabang || ""}
          onChange={(e) =>
            setEditCabang({ ...editCabang, nama_cabang: e.target.value })
          }
          className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
        />
        <label className="text-sm font-medium text-gray-700">
          Alamat
        </label>
        <input
          type="text"
          value={editCabang?.alamat || ""}
          onChange={(e) =>
            setEditCabang({ ...editCabang, alamat: e.target.value })
          }
          className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
        />
        <label className="text-sm font-medium text-gray-700">
          Telepon
        </label>
        <input
          type="text"
          value={editCabang?.telepon || ""}
          onChange={(e) =>
            setEditCabang({ ...editCabang, telepon: e.target.value })
          }
          className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
        />
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => setEditCabang(null)}
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

      {/* 🔥 Modal Konfirmasi Hapus */}
        <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} maxWidth="max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-red-500" size={28} />
          <h2 className="text-lg font-bold text-gray-800">Konfirmasi Hapus</h2>
        </div>
        <p className="text-gray-600 mb-6">
          Apakah Anda yakin ingin menghapus cabang ini? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setShowConfirm(false)}>
            Batal
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Hapus
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default KelolaCabangPage;