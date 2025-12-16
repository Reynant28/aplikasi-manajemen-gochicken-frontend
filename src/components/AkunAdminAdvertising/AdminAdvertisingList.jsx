// src/components/AkunAdminAdvertising/AdminAdvertisingList.jsx
import React from "react";
import { motion } from "framer-motion";
import { Loader2, Users, User, Mail, Home, Edit, Trash2 } from "lucide-react";

export default function AdminAdvertisingList({
  admins,
  isFetching,
  theme,
  openEditModal,
  confirmDelete,
}) {
  // --- GAYA LOADING DIKEMBALIKAN ---
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className={`w-8 h-8 ${theme.primaryAccent} animate-spin`} />
        <p className="ml-3 text-lg text-gray-600 font-medium">
          Memuat data admin...
        </p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {admins.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center p-10 bg-white/50 rounded-xl shadow-inner">
          <Users size={48} className="text-gray-400 mb-4" />
          <p className="text-gray-600 font-semibold text-lg">
            Belum Ada Admin Cabang
          </p>
          <p className="text-gray-500 text-sm">
            Silakan tambahkan admin baru untuk memulai.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {admins.map((admin, index) => (
            <motion.div
              key={admin.id_user}
              className={`bg-white shadow-lg rounded-2xl p-6 border-l-4 ${theme.modalBorder} hover:shadow-xl transition-shadow flex flex-col justify-between`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <User
                    className={`${theme.primaryText} mt-1 flex-shrink-0`}
                    size={20}
                  />
                  <h3 className={`text-xl font-bold ${theme.primaryText} break-words`}>
                    {admin.nama}
                  </h3>
                </div>
                <div className="space-y-2 text-sm text-gray-600 pl-8">
                  <p className="flex items-start gap-2">
                    <Mail size={14} className="mt-0.5 flex-shrink-0" />
                    {admin.email}
                  </p>
                  <p className="flex items-start gap-2">
                    <Home size={14} className="mt-0.5 flex-shrink-0" />
                    {admin.cabang
                      ? admin.cabang.nama_cabang
                      : "Belum terhubung"}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-5 pl-8">
                <button
                  onClick={() => openEditModal(admin)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 text-sm"
                >
                  <Edit size={14} /> <span>Edit</span>
                </button>
                <button
                  onClick={() => confirmDelete(admin.id_user, admin.nama)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 text-sm"
                >
                  <Trash2 size={14} /> <span>Hapus</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}