// src/pages/KelolaCabangPage.jsx
import { useState } from "react";
import { Plus, Edit, Trash } from "lucide-react";
//eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const AdvertisingPage = () => {
  const [branches, setBranches] = useState([
    { id: 1, name: "Cabang Jakarta", address: "Jl. Sudirman No. 1" },
    { id: 2, name: "Cabang Bandung", address: "Jl. Asia Afrika No. 10" },
  ]);

  const [newBranch, setNewBranch] = useState({ name: "", address: "" });
  const [editBranch, setEditBranch] = useState(null);

  const handleAdd = () => {
    if (!newBranch.name || !newBranch.address) return;
    setBranches([
      ...branches,
      { id: Date.now(), name: newBranch.name, address: newBranch.address },
    ]);
    setNewBranch({ name: "", address: "" });
  };

  const handleDelete = (id) => {
    setBranches(branches.filter((b) => b.id !== id));
  };

  const handleUpdate = () => {
    setBranches(
      branches.map((b) => (b.id === editBranch.id ? { ...editBranch } : b))
    );
    setEditBranch(null);
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

      {/* Form tambah cabang */}
      <motion.div
        className="bg-green-50 shadow-md rounded-xl p-6 mb-8 border border-green-200"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-lg font-semibold mb-3 text-green-800">
          Tambah Cabang
        </h2>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Nama Cabang"
            value={newBranch.name}
            onChange={(e) =>
              setNewBranch({ ...newBranch, name: e.target.value })
            }
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-green-500 outline-none text-gray-800 bg-white"
          />
          <input
            type="text"
            placeholder="Alamat"
            value={newBranch.address}
            onChange={(e) =>
              setNewBranch({ ...newBranch, address: e.target.value })
            }
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-green-500 outline-none text-gray-800 bg-white"
          />
          <button
            onClick={handleAdd}
            className="bg-green-600 hover:bg-green-700 transition-all duration-200 text-white px-5 py-2 rounded-lg flex items-center gap-2 shadow-md"
          >
            <Plus size={18} /> Tambah
          </button>
        </div>
      </motion.div>

      {/* Grid daftar cabang */}
      <motion.div
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {branches.map((branch, index) => (
          <motion.div
            key={branch.id}
            className="bg-white shadow-lg rounded-xl p-6 hover:shadow-2xl transition-all duration-300 border-t-4 border-green-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <h3 className="text-xl font-semibold text-green-800">
              {branch.name}
            </h3>
            <p className="text-gray-700 mt-1">{branch.address}</p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setEditBranch(branch)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition-all duration-200 shadow"
              >
                <Edit size={16} /> Edit
              </button>
              <button
                onClick={() => handleDelete(branch.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition-all duration-200 shadow"
              >
                <Trash size={16} /> Hapus
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Modal edit cabang */}
      <AnimatePresence>
        {editBranch && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border-t-4 border-green-600"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h2 className="text-xl font-semibold mb-4 text-green-700">
                ✏️ Edit Cabang
              </h2>
              <input
                type="text"
                value={editBranch.name}
                onChange={(e) =>
                  setEditBranch({ ...editBranch, name: e.target.value })
                }
                className="border rounded-lg px-3 py-2 w-full mb-3 focus:ring-2 focus:ring-green-500 outline-none text-gray-800 bg-green-50"
              />
              <input
                type="text"
                value={editBranch.address}
                onChange={(e) =>
                  setEditBranch({ ...editBranch, address: e.target.value })
                }
                className="border rounded-lg px-3 py-2 w-full mb-3 focus:ring-2 focus:ring-green-500 outline-none text-gray-800 bg-green-50"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditBranch(null)}
                  className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100 transition-all duration-200"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpdate}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
                >
                  Simpan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvertisingPage;
