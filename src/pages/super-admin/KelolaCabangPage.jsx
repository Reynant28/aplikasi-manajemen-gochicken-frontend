// src/pages/KelolaCabangPage.jsx
import { useState, useEffect } from "react";
import { Plus, Edit, Trash } from "lucide-react";
//eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "http://localhost:8000/api";

const KelolaCabangPage = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [cabang, setCabang] = useState([]);
  const [newCabang, setNewCabang] = useState({
    nama_cabang: "",
    alamat: "",
    telepon: "",
    password_cabang: "",
  });
  const [editCabang, setEditCabang] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCabang = async () => {
      try {
        const res = await fetch(`${API_URL}/cabang`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCabang(data.data || []);
      } catch (err) {
        console.error("Failed to fetch cabang:", err);
        setCabang([]);
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
      setCabang(data.data || []);
    } catch (err) {
      console.error("Failed to fetch cabang:", err);
      setCabang([]);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
        const res = await fetch(`${API_URL}/cabang`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(newCabang), // ⬅️ Kirim newCabang tanpa id_cabang
        });

        const data = await res.json();
        if (res.status === 201) {
            setMessage("✅ " + data.message);
            setNewCabang({
              nama_cabang: "",
              alamat: "",
              telepon: "",
              password_cabang: "",
            });
            fetchCabang();
        } else {
            setMessage("❌ " + (data.message || "Error"));
        }
    } catch (err) {
        console.error("Fetch error:", err);
        setMessage("❌ Error koneksi server");
    }

    setLoading(false);
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
      const res = await fetch(`${API_URL}/cabang/${editCabang.id_cabang}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editCabang),
      });
      if (res.ok) {
        await fetchCabang();
        setEditCabang(null);
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
            value={newCabang.nama_cabang}
            onChange={(e) =>
              setNewCabang({ ...newCabang, nama_cabang: e.target.value })
            }
            className="border rounded-lg px-3 py-2 w-full text-gray-800"
          />
          <input
            type="text"
            placeholder="Alamat"
            value={newCabang.alamat}
            onChange={(e) =>
              setNewCabang({ ...newCabang, alamat: e.target.value })
            }
            className="border rounded-lg px-3 py-2 w-full text-gray-800"
          />
          <input
            type="text"
            placeholder="Telepon"
            value={newCabang.telepon}
            onChange={(e) =>
              setNewCabang({ ...newCabang, telepon: e.target.value })
            }
            className="border rounded-lg px-3 py-2 w-full text-gray-800"
          />
          <input
            type="password"
            placeholder="Password Cabang"
            value={newCabang.password_cabang}
            onChange={(e) =>
              setNewCabang({ ...newCabang, password_cabang: e.target.value })
            }
            className="border rounded-lg px-3 py-2 w-full text-gray-800"
          />
          <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAdd}
              disabled={loading || cabang.length === 0}
              className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition font-semibold"
          >
              {loading ? "Menyimpan..." : "Tambah Admin"}
          </motion.button>
        </div>
      </motion.div>

      {/* Grid daftar cabang */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {cabang.map((branch, index) => (
            <motion.div
              key={branch.id_cabang}
              className="bg-white shadow-lg rounded-xl p-6 border-t-4 border-green-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <h3 className="text-xl font-bold text-green-800 mb-1">
                {branch.nama_cabang}
              </h3>
              <p className="text-gray-700 font-medium">🏠 {branch.alamat}</p>
              <p className="text-gray-600 text-sm mt-1">📞 {branch.telepon}</p>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setEditCabang(branch)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                >
                  <Edit size={16} /> <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(branch.id_cabang)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                >
                  <Trash size={16} /> <span>Hapus</span>
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Modal edit */}
        <AnimatePresence> 
          {editCabang && (
            <motion.div
              className="fixed inset-0 bg-white bg-opacity-40 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border-t-4 border-green-600">
                <h2 className="text-xl font-semibold mb-4 text-green-700">
                  ✏️ Edit Cabang
                </h2>
                <label className="text-sm font-medium text-gray-700">
                  Nama Cabang
                </label>
                <input
                  type="text"
                  value={editCabang.nama_cabang}
                  onChange={(e) =>
                    setEditCabang({ ...editCabang, nama_cabang: e.target.value })
                  }
                  className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
                />
                <label className="text-sm font-medium text-gray-700">
                  Alamat
                </label>
                <input
                  type="text"
                  value={editCabang.alamat}
                  onChange={(e) =>
                    setEditCabang({ ...editCabang, alamat: e.target.value })
                  }
                  className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
                />
                <label className="text-sm font-medium text-gray-700">
                  Telepon
                </label>
                <input
                  type="text"
                  value={editCabang.telepon}
                  onChange={(e) =>
                    setEditCabang({ ...editCabang, telepon: e.target.value })
                  }
                  className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
                />
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setEditCabang(null)}
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
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
};

export default KelolaCabangPage;
