import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Edit,
  Trash,
  CircleDollarSign,
  PlusCircle,
  User,
} from "lucide-react";

const KaryawanPage = () => {
  const [formData, setFormData] = useState({ nama: "", gaji: "" });
  const [karyawan, setKaryawan] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

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
  };

  const handleEdit = (index) => {
    setFormData(karyawan[index]);
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    if (window.confirm("Yakin hapus data karyawan ini?")) {
      setKaryawan(karyawan.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Form Tambah / Edit */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-lg rounded-2xl overflow-hidden max-w-lg mx-auto"
      >
        {/* Header Card */}
        <div className="bg-green-600 p-4 flex items-center gap-2">
          <PlusCircle className="text-white" size={22} />
          <h2 className="text-lg font-bold text-white">
            {editingIndex !== null ? "Edit Karyawan" : "Tambah Karyawan"}
          </h2>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-4">
          {/* Input Nama */}
          <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-green-500">
            <User className="text-gray-400 mr-2" size={18} />
            <input
              type="text"
              name="nama"
              placeholder="Nama Karyawan"
              value={formData.nama}
              onChange={handleChange}
              className="w-full outline-none text-gray-900 placeholder-gray-500"
              required
            />
          </div>

          {/* Input Gaji */}
          <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-green-500">
            <CircleDollarSign className="text-gray-400 mr-2" size={18} />
            <input
              type="number"
              name="gaji"
              placeholder="Masukkan Gaji"
              value={formData.gaji}
              onChange={handleChange}
              className="w-full outline-none text-gray-900 placeholder-gray-500"
              required
            />
          </div>

          {/* Tombol Submit */}
          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            onClick={handleSubmit}
            className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition font-semibold shadow-md"
          >
            {editingIndex !== null ? "Update" : "Simpan"}
          </motion.button>
        </div>
      </motion.div>

      {/* List Karyawan */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-green-700">
          Daftar Karyawan
        </h3>
        {karyawan.length === 0 ? (
          <p className="text-gray-500 italic">Belum ada data.</p>
        ) : (
          <div className="space-y-4">
            {karyawan.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center bg-white shadow-md rounded-xl p-4 hover:shadow-lg transition"
              >
                {/* Info Karyawan */}
                <div>
                  <p className="text-gray-900 font-semibold">{item.nama}</p>
                  <p className="text-green-700 font-bold flex items-center gap-1">
                    <CircleDollarSign size={18} /> Rp{" "}
                    {parseInt(item.gaji).toLocaleString()}
                  </p>
                </div>

                {/* Aksi di kanan */}
                <div className="flex gap-2">
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

export default KaryawanPage;
