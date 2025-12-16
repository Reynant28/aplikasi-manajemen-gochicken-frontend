import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Users, TrendingDown, BarChart3, Calendar } from "lucide-react";

export default function DashboardQuickActions({ theme, user, cabangId }) {
    const navigate = useNavigate();

    const quickActions = [
        { 
            label: "Laporan", 
            path: user?.role === 'super admin' ? "/super-admin/dashboard/reports" : `/admin-cabang/${cabangId}/dashboard/reports`, 
            icon: <BarChart3 size={24} /> 
        },
        { 
            label: "Pengeluaran", 
            path: user?.role === 'super admin' ? "/super-admin/dashboard/pengeluaran" : `/admin-cabang/${cabangId}/dashboard/pengeluaran`, 
            icon: <TrendingDown size={24} /> 
        },
        { 
            label: "Karyawan", 
            path: user?.role === 'super admin' ? "/super-admin/dashboard/karyawan" : `/admin-cabang/${cabangId}/dashboard/karyawan`, 
            icon: <Users size={24} /> 
        },
        { 
            label: "Laporan Harian", 
            path: user?.role === 'super admin' ? "/super-admin/dashboard/daily" : `/admin-cabang/${cabangId}/dashboard/daily`, 
            icon: <Calendar size={24} /> 
        },
    ];

    return (
        // Tambahkan 'h-full flex flex-col' agar panel memanjang mengikuti tetangganya
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Aksi Cepat</h3>
            
            {/* Ubah grid menjadi 'grid-cols-2' agar membentuk kotak 2x2 yang lebih proporsional */}
            {/* 'flex-1' akan memastikan grid mengisi ruang yang tersedia jika panel tertarik panjang */}
            <div className="grid grid-cols-2 gap-4 flex-1">
                {quickActions.map((action, index) => (
                    <motion.button 
                        key={index}
                        onClick={() => navigate(action.path)}
                        // Hapus fixed padding 'p-4' jika ingin tombol merenggang otomatis, 
                        // tapi 'py-6' biasanya memberikan tampilan tombol dashboard yang lebih enak dilihat
                        className={`py-6 px-4 bg-gradient-to-br ${theme.quickActionBg} rounded-xl transition-all duration-300 group cursor-pointer flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md border border-gray-100 h-full`}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className={`p-3 rounded-full bg-white/60 ${theme.primaryText}`}>
                            {action.icon}
                        </div>
                        <span className={`text-sm font-bold ${theme.quickActionText}`}>
                            {action.label}
                        </span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}