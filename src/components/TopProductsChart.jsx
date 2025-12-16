// src/components/TopProductsChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';

const getBarColor = (role) => {
    if (role === 'super admin') return '#f97316'; // orange-500
    if (role === 'admin cabang') return '#ef4444'; // red-500
    return '#D4D4D4'; // default green-500
};

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/80 backdrop-blur-sm p-2 border rounded-md shadow-md">
                <p className="text-sm text-gray-700">{`${payload[0].payload.nama_produk}: ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

const TopProductsChart = ({ data, userRole }) => {
    const barColor = getBarColor(userRole);

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[420px] flex flex-col"
        >
            <div className="flex items-center gap-2 mb-4">
                <Award size={20} className={userRole === 'super admin' ? 'text-orange-500' : 'text-red-500'} />
                <h3 className="text-lg font-semibold text-gray-800">5 Produk Terlaris</h3>
            </div>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="nama_produk"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#4b5563' }}
                            width={100}
                            interval={0}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                        <Bar dataKey="total_terjual" barSize={20} radius={[0, 10, 10, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={barColor} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default TopProductsChart;