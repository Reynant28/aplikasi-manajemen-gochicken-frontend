import React from "react";
import { motion } from "framer-motion";
import { Edit, Trash2, UserCircle, Mail, Building2, Shield } from "lucide-react";

const AdminCabangCard = ({ admin, index, onEdit, onDelete }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
        >
            {/* Header with Avatar */}
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mb-3 shadow-lg">
                    <UserCircle size={40} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 text-center">
                    {admin.nama}
                </h3>
                <div className="mt-2 px-3 py-1 bg-gray-700 bg-opacity-90 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                    <Shield size={12} />
                    Admin Cabang
                </div>
            </div>

            {/* Info Section */}
            <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                    <Mail size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600 truncate">{admin.email}</span>
                </div>
                <div className="flex items-start gap-2 text-sm pt-2 border-t border-gray-100">
                    <Building2 size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">
                        {admin.cabang ? admin.cabang.nama_cabang : "N/A"}
                    </span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 p-4 bg-gray-50 border-t border-gray-100">
                <button
                    onClick={() => onEdit(admin)}
                    className="flex-1 text-xs px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium flex items-center justify-center gap-1"
                >
                    <Edit size={14} /> Edit
                </button>
                <button
                    onClick={() => onDelete(admin.id_user)}
                    className="flex-1 text-xs px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium flex items-center justify-center gap-1"
                >
                    <Trash2 size={14} /> Hapus
                </button>
            </div>
        </motion.div>
    );
};

export default AdminCabangCard;