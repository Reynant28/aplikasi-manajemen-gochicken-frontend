// src/pages/KelolaCabangPage.jsx
import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash, AlertTriangle, CheckCircle } from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ConfirmDeletePopup, SuccessPopup, Card, Button, Modal } from "../../components/ui";


const API_URL = "http://localhost:8000/api";

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

    // Handler untuk menutup success popup
    const closeSuccessPopup = () => {
        setShowSuccess(false);
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

export default KelolaCabangPage;