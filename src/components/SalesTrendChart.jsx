// src/components/SalesTrendChart.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const formatRupiah = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

const SalesTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <motion.div 
        className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 h-full flex flex-col items-center justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <TrendingUp className="text-gray-300 mb-3" size={48} />
        <p className="text-gray-500">Tidak ada data penjualan tersedia</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 h-[400px] flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="text-gray-700" size={24} />
        <h3 className="text-lg font-semibold text-gray-800">Tren Penjualan</h3>
      </div>
      
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="period" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6b7280' }} 
            />
            <YAxis 
              yAxisId="left" 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(value)} 
              tick={{ fontSize: 12, fill: '#6b7280' }} 
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6b7280' }} 
            />
            <Tooltip
              formatter={(value, name) => (name === 'Pendapatan' ? formatRupiah(value) : `${value} transaksi`)}
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "0.75rem",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Legend 
              iconType="circle" 
              wrapperStyle={{ paddingTop: '10px' }}
            />
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="total_pendapatan" 
              stroke="#374151" 
              strokeWidth={2} 
              dot={false} 
              name="Pendapatan" 
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="jumlah_transaksi" 
              stroke="#6b7280" 
              strokeWidth={2} 
              dot={false} 
              name="Transaksi" 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default SalesTrendChart;