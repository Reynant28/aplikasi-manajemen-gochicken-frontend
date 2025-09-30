// src/pages/PengeluaranPage.jsx
import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash } from "lucide-react";
import { motion } from "framer-motion";
import {
  ConfirmDeletePopup,
  SuccessPopup,
  Button,
  Modal,
} from "../../components/ui";

const API_URL = "http://localhost:8000/api";

const PengeluaranPage = () => {
  const [pengeluaran, setPengeluaran] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    tanggal: "",
    jumlah: "",
    keterangan: "",
  });

  const [editPengeluaran, setEditPengeluaran] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [deleteId, setDeleteId] = useState(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchPengeluaran = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/pengeluaran`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPengeluaran(data.data || []);
    } catch (err) {
      console.error("Fetch pengeluaran error:", err);
      setPengeluaran([]);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchPengeluaran();
  }, [token, fetchPengeluaran]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/pengeluaran`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.status === 201) {
        setSuccessMessage(data.message || "Pengeluaran berhasil ditambahkan!");
        setShowSuccess(true);

        setFormData({ tanggal: "", jumlah: "", keterangan: "" });
        setShowForm(false);
        fetchPengeluaran();
      } else {
        alert("❌ " + (data.message || "Error"));
      }
    } catch (err) {
      console.error("Add pengeluaran error:", err);
    }

    setLoading(false);
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `${API_URL}/pengeluaran/${editPengeluaran.id_pengeluaran}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editPengeluaran),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(data.message || "Pengeluaran berhasil diupdate!");
        setShowSuccess(true);
        fetchPengeluaran();
        setEditPengeluaran(null);
      } else {
        alert("❌ " + (data.message || "Error"));
      }
    } catch (err) {
      console.error("Update pengeluaran error:", err);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/pengeluaran/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setSuccessMessage("Pengeluaran berhasil dihapus!");
        setShowSuccess(true);
        fetchPengeluaran();
      }
    } catch (err) {
      console.error("Delete pengeluaran error:", err);
    }
    setShowConfirm(false);
    setDeleteId(null);
  };

  const closeSuccessPopup = () => setShowSuccess(false);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-green-50 via-white to-green-100">
      <motion.h1
        className="text-4xl font-extrabold text-green-700 mb-8 drop-shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Kelola Pengeluaran
      </motion.h1>

      <div className="mb-6">
        <Button onClick={() => setShowForm(true)}>
          <Plus size={18} /> Tambah Pengeluaran
        </Button>
      </div>

      {/* Tabel pengeluaran */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="overflow-x-auto bg-white shadow-lg rounded-lg"
      >
        {pengeluaran.length === 0 ? (
          <p className="p-4 text-center text-gray-600">
            Belum ada data pengeluaran
          </p>
        ) : (
          <table className="min-w-full rounded-lg overflow-hidden">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left">No</th>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-left">Jumlah</th>
                <th className="px-4 py-3 text-left">Keterangan</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pengeluaran.map((item, index) => (
                <tr
                  key={item.id_pengeluaran}
                  className={`transition duration-200 ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-green-50`}
                >
                  <td className="px-4 py-3 font-semibold text-gray-700">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-600">
                    {item.tanggal}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-600">
                    Rp {parseInt(item.jumlah).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-700 italic">
                    {item.keterangan}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg flex items-center gap-1 shadow"
                        onClick={() => setEditPengeluaran(item)}
                      >
                        <Edit size={16} /> Edit
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 shadow"
                        onClick={() => confirmDelete(item.id_pengeluaran)}
                      >
                        <Trash size={16} /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Modal tambah pengeluaran */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <h2 className="text-xl font-semibold mb-4 text-green-700 flex items-center gap-2">
          <Plus size={18} /> Tambah Pengeluaran
        </h2>
        <form onSubmit={handleAdd}>
          <label className="text-sm font-medium text-gray-700">Tanggal</label>
          <input
            type="date"
            value={formData.tanggal}
            onChange={(e) =>
              setFormData({ ...formData, tanggal: e.target.value })
            }
            className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
            required
          />

          <label className="text-sm font-medium text-gray-700">Jumlah</label>
          <input
            type="number"
            value={formData.jumlah}
            onChange={(e) =>
              setFormData({ ...formData, jumlah: e.target.value })
            }
            className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
            placeholder="Nominal"
            required
          />

          <label className="text-sm font-medium text-gray-700">Keterangan</label>
          <textarea
            value={formData.keterangan}
            onChange={(e) =>
              setFormData({ ...formData, keterangan: e.target.value })
            }
            className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
            rows="3"
            placeholder="Deskripsi penggunaan"
            required
          />

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
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

      {/* Modal edit pengeluaran */}
      <Modal
        isOpen={!!editPengeluaran}
        onClose={() => setEditPengeluaran(null)}
      >
        <h2 className="text-xl font-semibold mb-4 text-green-700">
          ✏️ Edit Pengeluaran
        </h2>
        <label className="text-sm font-medium text-gray-700">Tanggal</label>
        <input
          type="date"
          value={editPengeluaran?.tanggal || ""}
          onChange={(e) =>
            setEditPengeluaran({ ...editPengeluaran, tanggal: e.target.value })
          }
          className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
        />

        <label className="text-sm font-medium text-gray-700">Jumlah</label>
        <input
          type="number"
          value={editPengeluaran?.jumlah || ""}
          onChange={(e) =>
            setEditPengeluaran({ ...editPengeluaran, jumlah: e.target.value })
          }
          className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
        />

        <label className="text-sm font-medium text-gray-700">Keterangan</label>
        <textarea
          value={editPengeluaran?.keterangan || ""}
          onChange={(e) =>
            setEditPengeluaran({
              ...editPengeluaran,
              keterangan: e.target.value,
            })
          }
          className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
          rows="3"
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => setEditPengeluaran(null)}
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

      {/* Modal konfirmasi hapus */}
      <ConfirmDeletePopup
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
      />

      {/* Modal sukses */}
      <SuccessPopup
        isOpen={showSuccess}
        onClose={closeSuccessPopup}
        title="Aksi Berhasil 🎉"
        message={successMessage}
      />
    </div>
  );
};

export default PengeluaranPage;
