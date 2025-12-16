// src/components/Dashboard/DashboardStokKritis.jsx
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PackageCheck, AlertCircle } from "lucide-react";

export default function DashboardStokKritis({
    stokKritis,
    stokLoading,
    stokError,
    theme,
    user,
    cabangId,
}) {
    const navigate = useNavigate();

    const getBadgeColor = (stock) => {
        if (stock === 0) return 'bg-gradient-to-r from-red-600 to-red-700';
        if (stock <= 2) return 'bg-gradient-to-r from-red-500 to-red-600';
        if (stock <= 3) return 'bg-gradient-to-r from-orange-500 to-orange-600';
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    };

    const getBadgeText = (stock) => {
        if (stock === 0) return 'Habis';
        if (stock <= 2) return 'Sangat Kritis';
        if (stock <= 3) return 'Kritis';
        return 'Perhatian';
    };

    const criticalItems = stokKritis
        .filter(item => {
            const sisa = Math.floor(parseFloat(item.jumlah_stok) || 0);
            return sisa <= 3; // Hanya tampilkan yang stoknya <= 3
        });

    return (
        <motion.div 
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm" 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
        >
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-gray-900">Stok Segera Habis</h2>
                    <p className="text-sm text-gray-600">Bahan baku yang perlu diisi ulang</p>
                </div>
                <motion.button 
                    onClick={() => navigate(user?.role === 'super admin' 
                        ? "/super-admin/dashboard/bahan" 
                        : `/admin-cabang/${cabangId}/dashboard/bahan`
                    )} 
                    className={`text-sm font-semibold ${theme.primaryText} hover:opacity-80 transition-all px-3 py-1.5 rounded-lg bg-gradient-to-r ${theme.quickActionBg} shadow-sm`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Cek Bahan
                </motion.button>
            </div>
            <div className="space-y-3 h-80 overflow-y-auto pr-2">
                {stokLoading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="animate-pulse flex items-center justify-between p-4 rounded-xl bg-gray-50">
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                            <div className="h-6 bg-gray-200 rounded w-8"></div>
                        </div>
                    ))
                ) : stokError ? (
                    <div className="text-center py-8 text-gray-500 space-y-3">
                        <AlertCircle size={40} className="mx-auto text-gray-300" />
                        <p className="text-sm font-medium">Gagal Memuat Data</p>
                    </div>
                ) : criticalItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 space-y-3">
                        <PackageCheck size={40} className="mx-auto text-green-400" />
                        <p className="text-sm font-medium">Semua Stok Aman</p>
                    </div>
                ) : (
                    criticalItems.map((item, index) => {
                        const sisa = Math.floor(parseFloat(item.jumlah_stok) || 0);
                        
                        return (
                            <motion.div 
                                key={item.id_bahan_baku} 
                                className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50/80 backdrop-blur-sm shadow-sm"
                                initial={{ opacity: 0, x: 20 }} 
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <span className="text-sm font-semibold text-red-800">
                                    {item.nama_bahan}
                                </span>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-red-700">
                                        Sisa: <strong>{sisa}</strong>
                                    </span>
                                    <span className={`text-xs font-bold text-white px-3 py-1.5 rounded-full ${getBadgeColor(sisa)} shadow-sm`}>
                                        {getBadgeText(sisa)}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
}