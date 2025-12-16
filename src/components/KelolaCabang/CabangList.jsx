import React from "react";
import { motion } from "framer-motion";
import { Building2, MapPin, Phone, Edit, Trash } from "lucide-react";

const CabangList = ({ cabang, loading, theme, setEditCabang, confirmDelete }) => {
  if (loading) return null; // Loader ditangani di parent atau di sini optional

  if (cabang.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center p-10 bg-white/50 rounded-xl shadow-inner">
        <Building2 size={48} className="text-gray-400 mb-4" />
        <p className="text-gray-600 font-semibold text-lg">Tidak Ada Data Cabang</p>
        <p className="text-gray-500 text-sm">Belum ada cabang yang sesuai dengan pencarian.</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cabang.map((branch, index) => (
        <motion.div 
          key={branch.id_cabang} 
          className={`bg-white shadow-lg rounded-2xl p-6 border-l-4 ${theme.modalBorder} hover:shadow-xl transition-shadow`} 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: index * 0.05 }}
        >
          <div className="flex items-start gap-3 mb-2">
            <Building2 className={`${theme.primaryText} mt-1 flex-shrink-0`} size={20} />
            <h3 className={`text-xl font-bold ${theme.primaryText} break-words`}>{branch.nama_cabang}</h3>
          </div>
          <div className="space-y-2 text-sm text-gray-600 pl-8">
            <p className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 flex-shrink-0" />
              {branch.alamat}
            </p>
            <p className="flex items-start gap-2">
              <Phone size={14} className="mt-0.5 flex-shrink-0" />
              {branch.telepon}
            </p>
          </div>
          <div className="flex gap-3 mt-5 pl-8">
            <button 
              onClick={() => setEditCabang(branch)} 
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 text-sm transition-colors"
            >
              <Edit size={14} /> <span>Edit</span>
            </button>
            <button 
              onClick={() => confirmDelete(branch.id_cabang)} 
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 text-sm transition-colors"
            >
              <Trash size={14} /> <span>Hapus</span>
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default CabangList;