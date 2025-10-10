// src/pages/BahanPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { PlusCircle, Edit, Trash2, X } from "lucide-react";
import { motion, number } from "framer-motion";
import {
  ConfirmDeletePopup,
  SuccessPopup,
  Button,
  Modal,
} from "../../components/ui";

const API_URL = "http://localhost:8000/api";

const BahanPage = () => {
  const [bahanList, setBahanList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nama_bahan: "",
    jumlah_stok: "",
    satuan: "",
    harga_satuan: "",
  });

  const [editBahan, setEditBahan] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const token = localStorage.getItem("token");

  // --- Fetch data bahan ---
  const fetchBahan = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/bahan-baku`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBahanList(data.data || []);
    } catch (err) {
      console.error("Fetch bahan error:", err);
      setBahanList([]);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchBahan();
  }, [token, fetchBahan]);

  // --- Tambah bahan ---
  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/bahan-baku`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.status === 201) {
        setSuccessMessage(data.message || "Bahan baku berhasil ditambahkan!");
        setShowSuccess(true);
        setFormData({ nama_bahan: "", jumlah_stok: "", satuan: "", harga_satuan: "" });
        setShowForm(false);
        fetchBahan();
      } else {
        alert("❌ " + (data.message || "Error"));
      }
    } catch (err) {
      console.error("Add bahan error:", err);
    }
    setLoading(false);
  };

  // --- Update bahan ---
  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `${API_URL}/bahan-baku/${editBahan.id_bahan_baku}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nama_bahan: editBahan.nama_bahan,
            jumlah_stok: Number(editBahan.jumlah_stok),
            satuan: Number(editBahan.satuan),
            harga_satuan: Number(editBahan.harga_satuan),
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(data.message || "Bahan baku berhasil diupdate!");
        setShowSuccess(true);
        fetchBahan();
        setEditBahan(null);
      } else {
        alert("❌ " + (data.message || "Error"));
      }
    } catch (err) {
      console.error("Update bahan error:", err);
    }
  };

  // --- Hapus bahan ---
  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/bahan-baku/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(data.message || "Bahan baku berhasil dihapus!");
        setShowSuccess(true);
        fetchBahan();
      } else {
        alert("❌ " + (data.message || "Error"));
      }
    } catch (err) {
      console.error("Delete bahan error:", err);
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
        Daftar Bahan Baku
      </motion.h1>

      <div className="mb-6 flex justify-between items-center">
        <p className="text-gray-600">Manajemen stok dan harga bahan baku.</p>
        <Button onClick={() => setShowForm(true)}>
          <PlusCircle size={18} /> Tambah Bahan Baru
        </Button>
      </div>

      {/* Tabel bahan baku */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="overflow-hidden bg-white shadow-md rounded-xl"
      >
        {bahanList.length === 0 ? (
          <p className="p-4 text-center text-gray-600">
            ⏳ Memuat data...
          </p>
        ) : (
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">ID</th>
                <th className="px-6 py-4 text-left font-semibold">Nama Bahan</th>
                <th className="px-6 py-4 text-left font-semibold">Stok</th>
                <th className="px-6 py-4 text-left font-semibold">Satuan</th>
                <th className="px-6 py-4 text-left font-semibold">
                  Harga Satuan
                </th>
                <th className="px-6 py-4 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {bahanList.map((item) => (
                <tr
                  key={item.id_bahan_baku}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 font-bold">
                    {item.id_bahan_baku}
                  </td>
                  <td className="px-6 py-4">{item.nama_bahan}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.jumlah_stok < 5
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {item.jumlah_stok}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {Number(item.satuan) % 1 === 0
                    ? Number(item.satuan) 
                    : Number(item.satuan).toFixed(1)} kg
                  </td>
                  <td className="px-6 py-4">
                    Rp {parseInt(item.harga_satuan).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        className="text-green-600 hover:text-green-800"
                        onClick={() => setEditBahan(item)}
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => confirmDelete(item.id_bahan_baku)}
                        title="Hapus"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Modal tambah bahan */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <h2 className="text-xl font-semibold mb-4 text-green-700 flex items-center gap-2">
          <PlusCircle size={18} /> Tambah Bahan Baku
        </h2>
        <form onSubmit={handleAdd}>
          <label className="text-sm font-medium text-gray-700">
            Nama Bahan
          </label>
          <input
            type="text"
            value={formData.nama_bahan}
            onChange={(e) =>
              setFormData({ ...formData, nama_bahan: e.target.value })
            }
            className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
            required
          />

          <label className="text-sm font-medium text-gray-700">
            Jumlah Stok
          </label>
          <input
            type="number"
            value={formData.jumlah_stok}
            onChange={(e) =>
              setFormData({ ...formData, jumlah_stok: e.target.value })
            }
            className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
            required
          />

          <label className="text-sm font-medium text-gray-700">
            Satuan
          </label>
          <input
            type="number"
            value={formData.satuan}
            onChange={(e) =>
              setFormData({ ...formData, satuan: e.target.value })
            }
            className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
            required
          />

          <label className="text-sm font-medium text-gray-700">
            Harga Satuan
          </label>
          <input
            type="number"
            value={formData.harga_satuan}
            onChange={(e) =>
              setFormData({ ...formData, harga_satuan: e.target.value })
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

      {/* Modal edit bahan */}
      <Modal isOpen={!!editBahan} onClose={() => setEditBahan(null)}>
        <h2 className="text-xl font-semibold mb-4 text-green-700">
          ✏️ Edit Bahan Baku
        </h2>

        <label className="text-sm font-medium text-gray-700">Nama Bahan</label>
        <input
          type="text"
          value={editBahan?.nama_bahan || ""}
          onChange={(e) =>
            setEditBahan({ ...editBahan, nama_bahan: e.target.value })
          }
          className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
        />

        <label className="text-sm font-medium text-gray-700">Jumlah Stok</label>
        <input
          type="number"
          value={editBahan?.jumlah_stok || ""}
          onChange={(e) =>
            setEditBahan({ ...editBahan, jumlah_stok: e.target.value })
          }
          className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
        />

        <label className="text-sm font-medium text-gray-700">Satuan</label>
        <input
          type="number"
          value={editBahan?.satuan || ""}
          onChange={(e) =>
            setEditBahan({ ...editBahan, satuan: e.target.value })
          }
          className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
        />

        <label className="text-sm font-medium text-gray-700">
          Harga Satuan
        </label>
        <input
          type="number"
          value={editBahan?.harga_satuan || ""}
          onChange={(e) =>
            setEditBahan({ ...editBahan, harga_satuan: e.target.value })
          }
          className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => setEditBahan(null)}
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

export default BahanPage;
