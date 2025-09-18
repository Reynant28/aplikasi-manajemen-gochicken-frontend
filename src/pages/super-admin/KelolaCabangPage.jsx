// src/pages/KelolaCabangPage.jsx
import { useState, useEffect } from "react";
import { Plus, Edit, Trash } from "lucide-react";
//eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "http://localhost:8000/api";

const KelolaCabangPage = () => {
  const [branches, setBranches] = useState([]);
  const [newBranch, setNewBranch] = useState({
    nama_cabang: "",
    alamat: "",
    telepon: "",
    password_cabang: "",
  });
  const [editBranch, setEditBranch] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCabang = async () => {
      try {
        const res = await fetch(`${API_URL}/cabang`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setBranches(data.data || []);
      } catch (err) {
        console.error("Failed to fetch cabang:", err);
        setBranches([]);
      }
    };

    if (token) fetchCabang();
  }, [token]);


  const fetchCabang = async () => {
    try {
      const res = await fetch(`${API_URL}/cabang`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBranches(data.data || []);
    } catch (err) {
      console.error("Failed to fetch cabang:", err);
      setBranches([]);
    }
  };

  const handleAdd = async () => {
    if (
      !newBranch.nama_cabang ||
      !newBranch.alamat ||
      !newBranch.telepon ||
      !newBranch.password_cabang
    )
      return;

    try {
      const res = await fetch(`${API_URL}/cabang`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newBranch),
      });

      if (res.ok) {
        await fetchCabang();
        setNewBranch({ nama_cabang: "", alamat: "", telepon: "", password_cabang: "" });
      } else {
        console.error("Failed to add cabang");
      }
    } catch (err) {
      console.error("Add cabang error:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/cabang/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchCabang();
    } catch (err) {
      console.error("Delete cabang error:", err);
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`${API_URL}/cabang/${editBranch.id_cabang}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editBranch),
      });
      if (res.ok) {
        await fetchCabang();
        setEditBranch(null);
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
            value={newBranch.nama_cabang}
            onChange={(e) =>
              setNewBranch({ ...newBranch, nama_cabang: e.target.value })
            }
            className="border rounded-lg px-3 py-2 w-full"
          />
          <input
            type="text"
            placeholder="Alamat"
            value={newBranch.alamat}
            onChange={(e) =>
              setNewBranch({ ...newBranch, alamat: e.target.value })
            }
            className="border rounded-lg px-3 py-2 w-full"
          />
          <input
            type="text"
            placeholder="Telepon"
            value={newBranch.telepon}
            onChange={(e) =>
              setNewBranch({ ...newBranch, telepon: e.target.value })
            }
            className="border rounded-lg px-3 py-2 w-full"
          />
          <input
            type="password"
            placeholder="Password Cabang"
            value={newBranch.password_cabang}
            onChange={(e) =>
              setNewBranch({ ...newBranch, password_cabang: e.target.value })
            }
            className="border rounded-lg px-3 py-2 w-full"
          />
          <button
            onClick={handleAdd}
            className="bg-green-600 text-white px-5 py-2 rounded-lg"
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
            key={branch.id_cabang}
            className="bg-white shadow-lg rounded-xl p-6 border-t-4 border-green-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <h3 className="text-xl font-semibold text-green-800">
              {branch.nama_cabang}
            </h3>
            <p className="text-gray-700">{branch.alamat}</p>
            <p className="text-gray-600 text-sm">📞 {branch.telepon}</p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setEditBranch(branch)}
                className="bg-yellow-500 text-white px-3 py-1 rounded-lg"
              >
                <Edit size={16} /> Edit
              </button>
              <button
                onClick={() => handleDelete(branch.id_cabang)}
                className="bg-red-500 text-white px-3 py-1 rounded-lg"
              >
                <Trash size={16} /> Hapus
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Modal edit */}
      <AnimatePresence>
        {editBranch && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border-t-4 border-green-600">
              <h2 className="text-xl font-semibold mb-4 text-green-700">
                ✏️ Edit Cabang
              </h2>
              <input
                type="text"
                value={editBranch.nama_cabang}
                onChange={(e) =>
                  setEditBranch({ ...editBranch, nama_cabang: e.target.value })
                }
                className="border rounded-lg px-3 py-2 w-full mb-3"
              />
              <input
                type="text"
                value={editBranch.alamat}
                onChange={(e) =>
                  setEditBranch({ ...editBranch, alamat: e.target.value })
                }
                className="border rounded-lg px-3 py-2 w-full mb-3"
              />
              <input
                type="text"
                value={editBranch.telepon}
                onChange={(e) =>
                  setEditBranch({ ...editBranch, telepon: e.target.value })
                }
                className="border rounded-lg px-3 py-2 w-full mb-3"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditBranch(null)}
                  className="px-4 py-2 rounded-lg border"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpdate}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg"
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

export default KelolaCabangPage;
