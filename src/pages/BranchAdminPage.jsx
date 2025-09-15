// src/pages/BranchAdminPage.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, Edit, Trash } from "lucide-react";

const BranchAdminPage = () => {
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    email: "",
    password_pribadi: "",
    branch: "",
    password_cabang: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [admins, setAdmins] = useState([]);
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await fetch("http://localhost/api/admins/list.php");
      const data = await res.json();
      setAdmins(data.admins || []);
    } catch {
      setAdmins([]);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const url = formData.id
      ? "http://localhost/api/admins/update.php"
      : "http://localhost/api/admins/create.php";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("✅ " + data.message);
        setFormData({
          id: null,
          name: "",
          email: "",
          password_pribadi: "",
          branch: "",
          password_cabang: "",
        });
        fetchAdmins();
        setShowForm(false);
      } else {
        setMessage("❌ " + data.message);
      }
    } catch {
      setMessage("❌ Error koneksi server");
    }

    setLoading(false);
  };

  const handleEdit = (admin) => {
    setFormData({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      password_pribadi: "",
      branch: admin.branch,
      password_cabang: "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus admin ini?")) return;

    try {
      const res = await fetch("http://localhost/api/admins/delete.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("✅ " + data.message);
        fetchAdmins();
      } else {
        setMessage("❌ " + data.message);
      }
    } catch {
      setMessage("❌ Error koneksi server");
    }
  };

  const branchBadge = (branch) => {
    switch (branch) {
      case "jakarta":
        return "bg-red-100 text-red-700";
      case "bandung":
        return "bg-green-100 text-green-700";
      case "surabaya":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Form tambah/edit admin */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg mx-auto border-l-4 border-blue-600"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-700">
            <UserPlus className="text-blue-600" />{" "}
            {formData.id ? "Edit Admin Cabang" : "Tambah Admin Cabang"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Nama Lengkap"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              required
            />
            <input
              type="password"
              name="password_pribadi"
              placeholder="Password Pribadi"
              value={formData.password_pribadi}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              required={!formData.id}
            />
            <select
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            >
              <option value="">Pilih Cabang</option>
              <option value="jakarta">Jakarta</option>
              <option value="bandung">Bandung</option>
              <option value="surabaya">Surabaya</option>
            </select>
            <input
              type="text"
              name="password_cabang"
              placeholder="Password Cabang"
              value={formData.password_cabang}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              required
            />

            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              {loading ? "Menyimpan..." : formData.id ? "Update Admin" : "Tambah Admin"}
            </motion.button>
          </form>

          {message && (
            <p
              className={`mt-4 text-center text-sm font-medium ${
                message.includes("✅") ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </motion.div>
      )}

      {/* List admin */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-blue-700">Daftar Admin Cabang</h3>
        <div className="grid md:grid-cols-2 gap-5">
          {admins.map((admin) => (
            <motion.div
              key={admin.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-600"
            >
              <h2 className="text-lg font-semibold text-gray-900">{admin.name}</h2>
              <p className="text-gray-700 text-sm">{admin.email}</p>
              <span
                className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${branchBadge(
                  admin.branch
                )}`}
              >
                Cabang: {admin.branch}
              </span>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleEdit(admin)}
                  className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600"
                >
                  <Edit size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(admin.id)}
                  className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                >
                  <Trash size={16} /> Hapus
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BranchAdminPage;
