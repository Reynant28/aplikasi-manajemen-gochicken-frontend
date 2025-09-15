import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash, CircleDollarSign } from "lucide-react";

const KaryawanPage = () => {
  const [formData, setFormData] = useState({
    nama: "",
    jabatan: "",
    gaji: "",
  });

  const [karyawan, setKaryawan] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

    setFormData({ nama: "", jabatan: "", gaji: "" });
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
      {/* Form Input */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-3xl mx-auto border-l-4 border-blue-600"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-700">
          <Plus className="text-blue-600" />{" "}
          {editingIndex !== null ? "Edit Karyawan" : "Tambah Karyawan"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="nama"
            placeholder="Nama Karyawan"
            value={formData.nama}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            required
          />
          <input
            type="text"
            name="jabatan"
            placeholder="Jabatan"
            value={formData.jabatan}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            required
          />

          {/* Input Gaji dengan Icon */}
          <div className="flex items-center border rounded-lg p-3 focus-within:ring-2 focus-within:ring-blue-500 text-gray-900">
            <CircleDollarSign className="text-green-600 mr-2" />
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

          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            {editingIndex !== null ? "Update" : "Simpan"}
          </motion.button>
        </form>
      </motion.div>

      {/* List Karyawan */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-blue-700">Daftar Karyawan</h3>
        {karyawan.length === 0 ? (
          <p className="text-gray-500 italic">Belum ada data karyawan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow-md rounded-xl overflow-hidden">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-2 text-left">Nama</th>
                  <th className="px-4 py-2 text-left">Jabatan</th>
                  <th className="px-4 py-2 text-left">Gaji</th>
                  <th className="px-4 py-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {karyawan.map((item, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b odd:bg-gray-50 even:bg-gray-100 hover:bg-gray-200"
                  >
                    <td className="px-4 py-2 text-gray-900 font-semibold">
                      {item.nama}
                    </td>
                    <td className="px-4 py-2 text-gray-700">{item.jabatan}</td>
                    <td className="px-4 py-2 flex items-center gap-1 text-green-700 font-bold">
                      <CircleDollarSign size={18} className="text-green-600" />
                      Rp {parseInt(item.gaji).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(index)}
                        className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 font-medium"
                      >
                        <Edit size={16} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 font-medium"
                      >
                        <Trash size={16} /> Hapus
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default KaryawanPage;
