// src/pages/PengeluaranPage.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash, X } from "lucide-react";

const PengeluaranPage = () => {
  const [formData, setFormData] = useState({
    jenis: "",
    deskripsi: "",
  });

  const [pengeluaran, setPengeluaran] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingIndex !== null) {
      const updated = [...pengeluaran];
      updated[editingIndex] = formData;
      setPengeluaran(updated);
      setEditingIndex(null);
    } else {
      setPengeluaran([...pengeluaran, formData]);
    }

    setFormData({ jenis: "", deskripsi: "" });
    setShowForm(false); // tutup form setelah submit
  };

  const handleEdit = (index) => {
    setFormData(pengeluaran[index]);
    setEditingIndex(index);
    setShowForm(true);
  };

  const confirmDelete = (index) => {
    setDeleteIndex(index);
    setShowDelete(true);
  };

  const handleDelete = () => {
    setPengeluaran(pengeluaran.filter((_, i) => i !== deleteIndex));
    setShowDelete(false);
    setDeleteIndex(null);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-green-50 via-white to-green-100">
      <motion.h1
        className="text-4xl font-extrabold text-green-700 mb-6 drop-shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Kelola Pengeluaran
      </motion.h1>

      {/* Tombol Tambah */}
      <div className="mb-6">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-green-700 shadow-md"
        >
          <Plus size={20} /> Tambah Pengeluaran
        </motion.button>
      </div>

      {/* Form Input */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="bg-white shadow-lg rounded-xl p-6 w-full max-w-2xl mx-auto border-t-4 border-green-600 mb-8"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-green-700">
              <Plus className="text-green-600" />{" "}
              {editingIndex !== null ? "✏️ Edit Pengeluaran" : "➕ Tambah Pengeluaran"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="jenis"
                placeholder="Jenis Pengeluaran"
                value={formData.jenis}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                required
              />
              <textarea
                name="deskripsi"
                placeholder="Deskripsi penggunaan"
                value={formData.deskripsi}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                rows="3"
                required
              />

              <div className="flex gap-3">
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  {editingIndex !== null ? "Simpan Perubahan" : "Tambah Pengeluaran"}
                </motion.button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ jenis: "", deskripsi: "" });
                    setEditingIndex(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-800 p-3 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Batal
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List Pengeluaran */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4 text-green-700">
          Daftar Pengeluaran
        </h3>
        {pengeluaran.length === 0 ? (
          <p className="text-gray-500">Belum ada data pengeluaran.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {pengeluaran.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white p-5 rounded-xl shadow-lg border-t-4 border-green-600"
              >
                <h2 className="text-lg font-bold text-green-800">
                  {item.jenis}
                </h2>
                <p className="text-gray-700 text-sm">{item.deskripsi}</p>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleEdit(index)}
                    className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600"
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    onClick={() => confirmDelete(index)}
                    className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                  >
                    <Trash size={16} /> Hapus
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Delete Modal */}
      <AnimatePresence>
        {showDelete && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative border-t-4 border-red-600"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
            >
              <button
                onClick={() => setShowDelete(false)}
                className="absolute top-3 right-3 text-red-500 hover:text-red-700"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-semibold mb-4 text-red-600">
                Hapus Pengeluaran
              </h2>
              <p className="text-gray-700 mb-6">
                Apakah kamu yakin ingin menghapus pengeluaran ini?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDelete(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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

export default PengeluaranPage;
