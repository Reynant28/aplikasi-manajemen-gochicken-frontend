// src/pages/PengeluaranPage.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash } from "lucide-react";

const PengeluaranPage = () => {
  const [formData, setFormData] = useState({
    jenis: "",
    deskripsi: "",
  });

  const [pengeluaran, setPengeluaran] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingIndex !== null) {
      // update data
      const updated = [...pengeluaran];
      updated[editingIndex] = formData;
      setPengeluaran(updated);
      setEditingIndex(null);
    } else {
      // tambah data baru
      setPengeluaran([...pengeluaran, formData]);
    }

    // reset form
    setFormData({ jenis: "", deskripsi: "" });
  };

  const handleEdit = (index) => {
    setFormData(pengeluaran[index]);
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    if (window.confirm("Yakin hapus pengeluaran ini?")) {
      setPengeluaran(pengeluaran.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Form Input */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl mx-auto"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
          <Plus className="text-green-600" />{" "}
          {editingIndex !== null ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="jenis"
            placeholder="Jenis Pengeluaran"
            value={formData.jenis}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            required
          />
          <textarea
            name="deskripsi"
            placeholder="Deskripsi penggunaan"
            value={formData.deskripsi}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            rows="3"
            required
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition"
          >
            {editingIndex !== null ? "Update" : "Simpan"}
          </motion.button>
        </form>
      </motion.div>

      {/* List Pengeluaran */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Daftar Pengeluaran</h3>
        {pengeluaran.length === 0 ? (
          <p className="text-gray-500">Belum ada data pengeluaran.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {pengeluaran.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="bg-white p-5 rounded-xl shadow-md border-l-4 border-green-600"
              >
                <h2 className="text-lg font-semibold">{item.jenis}</h2>
                <p className="text-gray-600 text-sm">{item.deskripsi}</p>

                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => handleEdit(index)}
                    className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600"
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
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
    </div>
  );
};

export default PengeluaranPage;
