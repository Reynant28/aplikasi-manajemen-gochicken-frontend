// src/components/SalesTrendChart.jsx
import React from "react";
import { ResponsiveContainer, LineChart, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, Bar, Area } from "recharts";
import { Inbox, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

// --- Palet Warna Dinamis ---
const getChartColors = (role) => {
    if (role === 'super admin') {
        return {
            PENDAPATAN_COLOR: "#f97316", // Orange-500 (Pendapatan)
            // PERUBAHAN DISINI: Awalnya biru (#38bdf8), sekarang jadi Merah (#ef4444)
            TRANSAKSI_COLOR: "#ef4444",  // Red-500 (Transaksi)
            ICON_COLOR: "text-orange-500",
        };
    }
    if (role === 'admin cabang') {
        return {
            PENDAPATAN_COLOR: "#dc2626", // Red-600 (Merah Tua untuk Pendapatan)
            TRANSAKSI_COLOR: "#fca5a5",  // Red-300 (Merah Muda untuk Transaksi - Biar kontras sesama merah)
            ICON_COLOR: "text-red-600",
        };
    }
    // Default (jika tidak ada role)
    return {
        PENDAPATAN_COLOR: "#ea580c", // Orange-600
        TRANSAKSI_COLOR: "#dc2626",  // Red-600
        ICON_COLOR: "text-orange-600",
    };
};

const GRID_COLOR = "#f3f4f6";

// Formatter
const formatCompact = (v) => new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(v);
const formatRupiah = (v) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

// Tooltip & Legend menerima warna sebagai props
const CustomTooltip = ({ active, payload, label, colors }) => {
    if (active && payload && payload.length) {
        const pendapatanData = payload.find((p) => p.dataKey === "total_pendapatan");
        const transaksiData = payload.find((p) => p.dataKey === "jumlah_transaksi");
        return (
            <div className="bg-white/90 backdrop-blur-md p-3 border border-gray-200 rounded-lg shadow-md">
                <p className="font-semibold text-gray-800 mb-2">{label}</p>
                <div className="space-y-1">
                    {pendapatanData && (
                        <div className="flex items-center">
                            <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: colors.PENDAPATAN_COLOR }} />
                            <span className="text-sm text-gray-700">Pendapatan: <span className="font-semibold text-gray-900">{formatRupiah(pendapatanData.value)}</span></span>
                        </div>
                    )}
                    {transaksiData && (
                        <div className="flex items-center">
                            <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: colors.TRANSAKSI_COLOR }} />
                            <span className="text-sm text-gray-700">Transaksi: <span className="font-semibold text-gray-900">{transaksiData.value}</span></span>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

const CustomLegend = ({ colors }) => (
    <div className="flex justify-center items-center gap-6 mt-3">
        <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors.PENDAPATAN_COLOR }} />
            <span className="text-sm text-gray-600">Pendapatan</span>
        </div>
        <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors.TRANSAKSI_COLOR }} />
            <span className="text-sm text-gray-600">Transaksi</span>
        </div>
    </div>
);

const SalesTrendChart = ({ data, userRole }) => {
    // Tentukan warna berdasarkan userRole prop
    const chartColors = getChartColors(userRole);
    const useBarChart = data?.length <= 1;

    if (!data || data.length === 0) {
        return (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="bg-white p-6 rounded-xl border border-gray-200 h-[420px] flex flex-col">
                <h3 className="text-lg font-semibold text-gray-800">Tren Penjualan</h3>
                <div className="flex-grow flex flex-col justify-center items-center text-gray-400">
                    <Inbox size={48} className="mb-3" />
                    <p className="font-medium text-gray-500">Belum Ada Data</p>
                    <p className="text-sm text-gray-400 text-center mt-1">Tidak ada data penjualan untuk periode yang dipilih.</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[420px] flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={20} className={chartColors.ICON_COLOR} />
                <h3 className="text-lg font-semibold text-gray-800">Tren Penjualan</h3>
                <span className="text-xs text-gray-500 mt-0.5">(Pendapatan & Transaksi)</span>
            </div>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    {useBarChart ? (
                        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_COLOR} />
                            <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#6b7280" }} tickFormatter={formatCompact} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip colors={chartColors} />} cursor={{ fill: "#f9fafb" }} />
                            <Legend content={<CustomLegend colors={chartColors} />} />
                            
                            {/* Bar Pendapatan */}
                            <Bar yAxisId="left" dataKey="total_pendapatan" fill={chartColors.PENDAPATAN_COLOR} name="Pendapatan" barSize={40} radius={[8, 8, 0, 0]} />
                            {/* Bar Transaksi (Warnanya sekarang merah/sesuai role) */}
                            <Bar yAxisId="right" dataKey="jumlah_transaksi" fill={chartColors.TRANSAKSI_COLOR} name="Transaksi" barSize={40} radius={[8, 8, 0, 0]} />
                        </BarChart>
                    ) : (
                        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="gradientPendapatan" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={chartColors.PENDAPATAN_COLOR} stopOpacity={0.4} />
                                    <stop offset="95%" stopColor={chartColors.PENDAPATAN_COLOR} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradientTransaksi" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={chartColors.TRANSAKSI_COLOR} stopOpacity={0.4} />
                                    <stop offset="95%" stopColor={chartColors.TRANSAKSI_COLOR} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_COLOR} />
                            <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#6b7280" }} tickFormatter={formatCompact} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip colors={chartColors} />} />
                            <Legend content={<CustomLegend colors={chartColors} />} />
                            
                            <Area yAxisId="left" type="monotone" dataKey="total_pendapatan" stroke="none" fill="url(#gradientPendapatan)" />
                            <Line yAxisId="left" type="monotone" dataKey="total_pendapatan" name="Pendapatan" stroke={chartColors.PENDAPATAN_COLOR} strokeWidth={2.5} dot={{ r: 4, fill: chartColors.PENDAPATAN_COLOR, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 7 }} />
                            <Line yAxisId="right" type="monotone" dataKey="jumlah_transaksi" name="Transaksi" stroke={chartColors.TRANSAKSI_COLOR} strokeWidth={2.5} dot={{ r: 4, fill: chartColors.TRANSAKSI_COLOR, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 7 }} />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default SalesTrendChart;