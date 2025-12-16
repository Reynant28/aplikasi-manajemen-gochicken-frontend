// src/components/AkunAdminAdvertising/AdminAdvertisingFormModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Edit, X, Loader2 } from "lucide-react";

export default function AdminAdvertisingFormModal({
  showAddForm,
  editingAdmin,
  formData,
  cabang,
  theme,
  actionLoading,
  closeModal,
  handleChange,
  handleFormSubmit,
}) {
  const isEditing = !!editingAdmin;
  const currentAdmin = isEditing
    ? // Mencari data admin yang sedang diedit dari cabang yang sudah ada
      cabang.find((c) => c.id_cabang === formData.id_cabang)
    : null;

  return (
    <AnimatePresence>
      {showAddForm && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
        >
          <motion.div
            className={`bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg mx-auto border-t-4 ${theme.modalBorder} relative`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className={`absolute top-4 right-4 p-2 rounded-full transition ${theme.closeButton}`}
            >
              <X size={20} />
            </button>
            <h2
              className={`text-2xl font-bold mb-6 flex items-center gap-2 ${theme.primaryText}`}
            >
              {isEditing ? (
                <>
                  <Edit size={20} /> Edit Admin
                </>
              ) : (
                <>
                  <UserPlus size={20} /> Tambah Admin
                </>
              )}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nama Lengkap */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    className={`w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 ${theme.focusRing} text-gray-900 transition`}
                    required
                  />
                </div>
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 ${theme.focusRing} text-gray-900 transition`}
                    required
                  />
                </div>
              </div>
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={isEditing ? "Isi hanya jika ingin mengubah" : ""}
                  className={`w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 ${theme.focusRing} text-gray-900 transition`}
                  required={!isEditing}
                />
              </div>
              {/* Hubungkan ke Cabang */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hubungkan ke Cabang
                </label>
                <select
                  name="id_cabang"
                  value={formData.id_cabang}
                  onChange={handleChange}
                  className={`w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 ${theme.focusRing} text-gray-900 transition disabled:opacity-70`}
                >
                  <option value="">
                    {cabang.length === 0 && !isEditing
                      ? "Tidak ada cabang tersedia"
                      : "Pilih Cabang"}
                  </option>
                  {/* Opsi Cabang Saat Ini untuk mode Edit */}
                  {isEditing &&
                    currentAdmin &&
                    !cabang.some((c) => c.id_cabang === currentAdmin.id_cabang) && (
                      <option value={currentAdmin.id_cabang}>
                        {currentAdmin.nama_cabang} (Saat Ini)
                      </option>
                    )}
                  {/* Opsi Cabang yang belum ada adminnya */}
                  {cabang.map((cab) => (
                    <option key={cab.id_cabang} value={cab.id_cabang}>
                      {cab.nama_cabang}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`flex items-center justify-center px-4 py-2 rounded-lg ${theme.primaryBg} ${theme.primaryHoverBg} text-white font-semibold transition disabled:bg-gray-400 w-28`}
                >
                  {actionLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Simpan"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}