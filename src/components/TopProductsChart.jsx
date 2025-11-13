// src/components/TopProductsChart.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const TopProductsChart = ({ data, filter = "bulan" }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="text-green-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-800">Produk Terlaris</h3>
        </div>
        <div className="flex items-center justify-center h-full text-gray-500">
          Tidak ada data produk
        </div>
      </div>
    );
  }

  const filterLabel =
    filter === "minggu"
      ? "Minggu Ini"
      : filter === "tahun"
      ? "Tahun Ini"
      : "Bulan Ini";

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-green-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-800">5 Produk Terlaris</h3>
        </div>
        <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
          {filterLabel}
        </span>
      </div>
      
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            layout="vertical" 
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
            <XAxis 
              type="number" 
              hide 
            />
            <YAxis 
              type="category" 
              dataKey="nama_produk" 
              width={100}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <Tooltip 
              cursor={{ fill: '#f3f4f6' }} 
              formatter={(value) => [`${value} terjual`, 'Jumlah']}
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "0.75rem",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Bar 
              dataKey="total_terjual" 
              fill="#10b981" 
              barSize={20} 
              radius={[0, 4, 4, 0]}
            >
              <LabelList 
                dataKey="total_terjual" 
                position="right" 
                style={{ fill: '#374151', fontSize: 12, fontWeight: 500 }} 
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default TopProductsChart;