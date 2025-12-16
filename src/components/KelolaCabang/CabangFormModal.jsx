import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Edit, Plus, Eye, EyeOff, Loader2 } from "lucide-react";

const CabangFormModal = ({ 
  showAddForm, 
  editCabang, 
  setEditCabang, 
  setShowAddForm, 
  formData, // newCabang state dari parent
  setFormData, // setNewCabang setter
  theme, 
  actionLoading, 
  handleAdd, 
  handleUpdate 
}) => {
  
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  // Reset form state saat modal tutup
  const close = () => {
    setShowAddForm(false);
    setEditCabang(null);
    setShowPassword(false);
    setShowEditPassword(false);
  };

  // Helper password strength
  const checkPasswordStrength = (password) => {
    if (!password) return "";
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const length = password.length;
    let score = 0;
    if (length >= 8) score++;
    if (hasLower) score++;
    if (hasUpper) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;
    if (score <= 2) return { text: "Lemah", color: "text-red-500", bg: "bg-red-100" };
    if (score <= 4) return { text: "Cukup", color: "text-yellow-500", bg: "bg-yellow-100" };
    return { text: "Kuat", color: "text-green-500", bg: "bg-green-100" };
  };

  // Generate Random Password
  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));
    
    if (editCabang) {
      setEditCabang({ ...editCabang, password_cabang: password });
    } else {
      setFormData({ ...formData, password_cabang: password });
    }
  };

  useEffect(() => {
    const pwd = editCabang ? (editCabang.password_cabang || "") : (formData.password_cabang || "");
    setPasswordStrength(checkPasswordStrength(pwd));
  }, [editCabang, formData.password_cabang]);

  return (
    <AnimatePresence>
      {(showAddForm || editCabang) && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={close}
        >
          <motion.div 
            className={`bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border-t-4 ${theme.modalBorder} relative`} 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.9, opacity: 0 }} 
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={close} className={`absolute top-4 right-4 p-2 rounded-full transition ${theme.closeButton}`}>
              <X size={20} />
            </button>
            
            <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${theme.primaryText}`}>
              {editCabang ? <><Edit size={20} /> Edit Cabang</> : <><Plus size={20} /> Tambah Cabang</>}
            </h2>
            
            <form onSubmit={editCabang ? handleUpdate : handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Cabang</label>
                <input 
                  type="text" 
                  value={editCabang ? editCabang.nama_cabang : formData.nama_cabang} 
                  onChange={(e) => editCabang ? setEditCabang({ ...editCabang, nama_cabang: e.target.value }) : setFormData({ ...formData, nama_cabang: e.target.value })} 
                  className={`w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 ${theme.focusRing} text-gray-900 placeholder:text-gray-400 transition`} 
                  placeholder="Contoh: Cabang Cimahi" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <input 
                  type="text" 
                  value={editCabang ? editCabang.alamat : formData.alamat} 
                  onChange={(e) => editCabang ? setEditCabang({ ...editCabang, alamat: e.target.value }) : setFormData({ ...formData, alamat: e.target.value })} 
                  className={`w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 ${theme.focusRing} text-gray-900 placeholder:text-gray-400 transition`} 
                  placeholder="Jl. Jenderal Sudirman No. 1" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                <input 
                  type="text" 
                  value={editCabang ? editCabang.telepon : formData.telepon} 
                  onChange={(e) => editCabang ? setEditCabang({ ...editCabang, telepon: e.target.value }) : setFormData({ ...formData, telepon: e.target.value })} 
                  className={`w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 ${theme.focusRing} text-gray-900 placeholder:text-gray-400 transition`} 
                  placeholder="08123456789" 
                  required 
                />
              </div>
              
              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editCabang ? "Password Baru (opsional)" : "Password Cabang"}
                </label>
                <div className="relative">
                  <input 
                    type={editCabang ? (showEditPassword ? "text" : "password") : (showPassword ? "text" : "password")} 
                    value={editCabang ? (editCabang.password_cabang || "") : formData.password_cabang} 
                    onChange={(e) => editCabang ? setEditCabang({ ...editCabang, password_cabang: e.target.value }) : setFormData({ ...formData, password_cabang: e.target.value })} 
                    className={`w-full p-3 pr-20 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 ${theme.focusRing} text-gray-900 placeholder:text-gray-400 transition`} 
                    placeholder={editCabang ? "Kosongkan jika tidak ingin mengubah" : "Password untuk login cabang"} 
                    required={!editCabang}
                    minLength="6"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                    <button type="button" onClick={() => editCabang ? setShowEditPassword(!showEditPassword) : setShowPassword(!showPassword)} className="p-1 text-gray-500 hover:text-gray-700 transition">
                      {editCabang ? (showEditPassword ? <EyeOff size={18} /> : <Eye size={18} />) : (showPassword ? <EyeOff size={18} /> : <Eye size={18} />)}
                    </button>
                    <button type="button" onClick={generateRandomPassword} className="p-1 text-blue-500 hover:text-blue-700 transition text-sm font-medium">Generate</button>
                  </div>
                </div>
                
                {/* Strength Indicator (Only for New or when typing in Edit) */}
                {(!editCabang || (editCabang && editCabang.password_cabang)) && formData.password_cabang !== "" && (
                   <div className="mt-2 flex justify-between items-center text-xs">
                      <span>Kekuatan: <span className={`px-2 py-0.5 rounded ${passwordStrength.bg} ${passwordStrength.color} font-medium`}>{passwordStrength.text}</span></span>
                   </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={close} className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100 transition">Batal</button>
                <button type="submit" disabled={actionLoading} className={`flex items-center justify-center px-4 py-2 rounded-lg ${theme.primaryBg} ${theme.primaryHoverBg} text-white font-semibold transition disabled:bg-gray-400 w-28`}>
                  {actionLoading ? <Loader2 className="animate-spin" size={20} /> : "Simpan"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CabangFormModal;