// src/pages/KaryawanPage.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Edit, Trash2, X, CircleDollarSign, User, AlertTriangle } from "lucide-react";

const KaryawanPage = () => {
  const [formData, setFormData] = useState({ nama: "", gaji: "" });
  const [karyawan, setKaryawan] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // state untuk custom confirm
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingIndex !== null) {
      const updated = [...karyawan];
      updated[editingIndex] = formData;
      setKaryawan(updated);
      setEditingIndex(null);
    } else {
      setKaryawan([...karyawan, formData]);
    }
    setFormData({ nama: "", gaji: "" });
    setShowForm(false);
  };

  const handleEdit = (index) => {
    setFormData(karyawan[index]);
    setEditingIndex(index);
    setShowForm(true);
  };

  const confirmDelete = (index) => {
    setDeleteIndex(index);
    setShowConfirm(true);
  };

  const handleDelete = () => {
    setKaryawan(karyawan.filter((_, i) => i !== deleteIndex));
    setShowConfirm(false);
    setDeleteIndex(null);
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

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-green-700">Daftar Karyawan</h3>
        <button
          onClick={() => {
            setFormData({ nama: "", gaji: "" });
            setEditingIndex(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          <PlusCircle size={18} /> Tambah Karyawan
        </button>
      </div>

      {/* Grid daftar karyawan */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {karyawan.length === 0 ? (
          <p className="text-gray-500 italic col-span-full">
            Belum ada data karyawan.
          </p>
        ) : (
          karyawan.map((item, index) => (
            <motion.div
              key={index}
              className="bg-white shadow-lg rounded-xl p-6 border-t-4 border-green-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <h2 className="text-lg font-bold text-green-800 flex items-center gap-2">
                <User size={18} /> {item.nama}
              </h2>
              <p className="text-green-700 font-semibold flex items-center gap-1 mt-2">
                <CircleDollarSign size={16} /> Rp{" "}
                {parseInt(item.gaji || 0).toLocaleString()}
              </p>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => handleEdit(index)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                >
                  <Edit size={16} /> Edit
                </button>
                <button
                  onClick={() => confirmDelete(index)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                >
                  <Trash2 size={16} /> Hapus
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal Tambah/Edit */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 bg-white bg-opacity-40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border-t-4 border-green-600 relative"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
            >
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingIndex(null);
                  setFormData({ nama: "", gaji: "" });
                }}
                className="absolute top-3 right-3 text-red-500 hover:text-red-700"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-semibold mb-4 text-green-700">
                {editingIndex !== null ? "✏️ Edit Karyawan" : "➕ Tambah Karyawan"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  name="nama"
                  placeholder="Nama Karyawan"
                  value={formData.nama}
                  onChange={handleChange}
                  className="border rounded-lg px-3 py-2 w-full text-gray-800"
                  required
                />
                <input
                  type="number"
                  name="gaji"
                  placeholder="Masukkan Gaji"
                  value={formData.gaji}
                  onChange={handleChange}
                  className="border rounded-lg px-3 py-2 w-full text-gray-800"
                  required
                />

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  {editingIndex !== null ? "Simpan Perubahan" : "Tambah Karyawan"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Confirm Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="fixed inset-0 bg-white bg-opacity-40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-red-500" size={28} />
                <h2 className="text-lg font-bold text-gray-800">
                  Konfirmasi Hapus
                </h2>
              </div>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus karyawan ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KaryawanPage;
