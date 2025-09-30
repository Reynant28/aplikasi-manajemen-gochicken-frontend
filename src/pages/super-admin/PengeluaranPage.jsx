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
          className="overflow-hidden bg-white shadow-md rounded-xl"
        >
          {pengeluaran.length === 0 ? (
            <p className="p-4 text-center text-gray-600">Belum ada data pengeluaran</p>
          ) : (
            <table className="min-w-full text-sm text-gray-700 border-separate border-spacing-0">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold border-b border-gray-200">
                    No
                  </th>
                  <th className="px-6 py-4 text-left font-semibold border-b border-gray-200">
                    Keterangan
                  </th>
                  <th className="px-6 py-4 text-left font-semibold border-b border-gray-200">
                    Jumlah
                  </th>
                  <th className="px-6 py-4 text-left font-semibold border-b border-gray-200">
                    Tanggal
                  </th>
                  <th className="px-6 py-4 text-center font-semibold border-b border-gray-200">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {pengeluaran.map((item, index) => (
                  <tr
                    key={item.id_pengeluaran}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 font-bold text-gray-800 border-b border-gray-200">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-gray-600 italic border-b border-gray-200">
                      {item.keterangan}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-200">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          parseInt(item.jumlah) > 500000
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        Rp {parseInt(item.jumlah).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 border-b border-gray-200">
                      {item.tanggal}
                    </td>
                    <td className="px-6 py-4 text-center border-b border-gray-200">
                      <div className="flex justify-center gap-3">
                        <button
                          className="text-green-600 hover:text-green-800"
                          onClick={() => setEditPengeluaran(item)}
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => confirmDelete(item.id_pengeluaran)}
                          title="Hapus"
                        >
                          <Trash size={18} />
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
