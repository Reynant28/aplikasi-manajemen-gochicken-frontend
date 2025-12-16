// src/components/Dashboard/DashboardChartPanel.jsx
import React from "react";
import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { BarChart3 } from "lucide-react";

// Helper function formatRupiah dan formatCompact harus tersedia di sini (atau diimpor)
const formatRupiah = (value = 0) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
const formatCompact = (value) => new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 0 }).format(value);

const CustomTooltip = ({ active, payload, label, formatRupiah }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-sm p-4 border border-gray-200 rounded-xl shadow-lg">
                <p className="font-bold text-gray-800 mb-1">{label}</p>
                <p className="text-sm text-gray-700">
                    Jumlah: <span className="font-semibold">{formatRupiah(payload[0].value)}</span>
                </p>
            </div>
        );
    }
    return null;
};

export default function DashboardChartPanel({
    chartData,
    chartLoading,
    chartError,
    chartMode,
    chartFilter,
    setChartMode,
    setChartFilter,
    theme,
}) {
    const useBarChart = !chartLoading && !chartError && chartData.length === 1;

    return (
        <motion.div 
            className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm" 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-gray-900">Analisis Finansial</h2>
                    <p className="text-sm text-gray-600">
                        Performa {chartMode} berdasarkan periode waktu
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    {/* Mode Selector */}
                    <div className="flex bg-gray-100 rounded-xl p-1.5 shadow-inner">
                        <button 
                            onClick={() => setChartMode('pendapatan')} 
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                                chartMode === 'pendapatan' 
                                    ? `bg-white ${theme.primaryText} shadow-sm` 
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            Pendapatan
                        </button>
                        <button 
                            onClick={() => setChartMode('pengeluaran')} 
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                                chartMode === 'pengeluaran' 
                                    ? 'bg-white text-red-600 shadow-sm' 
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            Pengeluaran
                        </button>
                    </div>
                    {/* Filter Selector */}
                    <div className="flex bg-gray-100 rounded-xl p-1.5 shadow-inner">
                        {['minggu', 'bulan', 'tahun'].map((filter) => (
                            <button 
                                key={filter}
                                onClick={() => setChartFilter(filter)} 
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all capitalize ${
                                    chartFilter === filter 
                                        ? 'bg-white text-gray-900 shadow-sm' 
                                        : 'text-gray-600 hover:text-gray-800'
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="h-80">
                {chartLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className={`animate-spin rounded-full h-10 w-10 border-b-2 ${theme.modalBorder}`}></div>
                    </div>
                ) : chartError || chartData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-3">
                        <BarChart3 size={56} className="text-gray-300" />
                        <p className="text-gray-600 font-medium">
                            {chartError || "Tidak ada data tersedia"}
                        </p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        {useBarChart ? (
                            <BarChart 
                                data={chartData} 
                                margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                                <XAxis 
                                    dataKey="name" 
                                    tick={{ fontSize: 12, fill: '#64748b' }} 
                                    axisLine={false} 
                                    tickLine={false} 
                                />
                                <YAxis 
                                    tickFormatter={formatCompact} 
                                    tick={{ fontSize: 12, fill: '#64748b' }} 
                                    axisLine={false} 
                                    tickLine={false} 
                                />
                                <Tooltip 
                                    content={<CustomTooltip formatRupiah={formatRupiah} />} 
                                    cursor={{ fill: 'rgba(0,0,0,0.03)' }} 
                                />
                                <Bar 
                                    dataKey="value" 
                                    fill={chartMode === 'pendapatan' ? theme.chartRevenue : theme.chartExpense} 
                                    barSize={50} 
                                    radius={[8, 8, 0, 0]} 
                                />
                            </BarChart>
                        ) : (
                            <AreaChart 
                                data={chartData} 
                                margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                            >
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop 
                                            offset="5%" 
                                            stopColor={chartMode === 'pendapatan' ? theme.chartRevenue : theme.chartExpense} 
                                            stopOpacity={0.4}
                                        />
                                        <stop 
                                            offset="95%" 
                                            stopColor={chartMode === 'pendapatan' ? theme.chartRevenue : theme.chartExpense} 
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                                <XAxis 
                                    dataKey="name" 
                                    tick={{ fontSize: 12, fill: '#64748b' }} 
                                    axisLine={false} 
                                    tickLine={false} 
                                />
                                <YAxis 
                                    tickFormatter={formatCompact} 
                                    tick={{ fontSize: 12, fill: '#64748b' }} 
                                    axisLine={false} 
                                    tickLine={false} 
                                />
                                <Tooltip 
                                    content={<CustomTooltip formatRupiah={formatRupiah} />} 
                                    cursor={{ fill: 'rgba(0,0,0,0.03)' }} 
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke={chartMode === 'pendapatan' ? theme.chartRevenue : theme.chartExpense} 
                                    strokeWidth={3}
                                    fill="url(#chartGradient)" 
                                />
                            </AreaChart>
                        )}
                    </ResponsiveContainer>
                )}
            </div>
        </motion.div>
    );
}