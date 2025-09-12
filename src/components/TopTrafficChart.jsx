// src/components/TopTrafficChart.jsx
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { name: 'google.com', value: 148000 },
  { name: 'Others', value: 29000 },
  { name: 'kokiso.com', value: 5000 },
];
const COLORS = ['#166534', '#a3e635', '#f87171'];

const TopTrafficChart = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 h-[420px] flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Top Traffic Channels</h3>
            <select className="border border-gray-300 rounded-md p-1 text-sm focus:outline-none">
                <option>By URL</option>
            </select>
      </div>
      <div className='flex-grow relative'>
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={80} outerRadius={110} fill="#8884d8" paddingAngle={0} dataKey="value" >
                    {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                </Pie>
            </PieChart>
        </ResponsiveContainer>
        {/* Menambahkan teks di tengah */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className='text-3xl font-bold text-gray-800'>148K</span>
        </div>
      </div>
    </div>
  );
};

export default TopTrafficChart;