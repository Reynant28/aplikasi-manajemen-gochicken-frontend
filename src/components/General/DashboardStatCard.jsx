// src/components/Dashboard/DashboardStatCard.jsx
import React from "react";
import { motion } from "framer-motion";

export default function DashboardStatCard({ title, value, subtitle, icon, loading, theme }) {
    if (loading) return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse shadow-sm">
            <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
            </div>
        </div>
    );
    
    return (
        <motion.div 
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden" 
            whileHover={{ y: -4 }} 
            transition={{ type: "spring", stiffness: 300 }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${theme.quickActionBg} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    {React.cloneElement(icon, { className: theme.primaryAccent })}
                </div>
            </div>
        </motion.div>
    );
}