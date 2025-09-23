// src/components/UserTrafficChart.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { name: 'Jan', UserActive: 4000, NewUser: 2400, EventCount: 2400 },
  { name: 'Feb', UserActive: 3000, NewUser: 1398, EventCount: 2210 },
  { name: 'Mar', UserActive: 2000, NewUser: 9800, EventCount: 2290 },
  { name: 'Apr', UserActive: 2780, NewUser: 3908, EventCount: 2000 },
  { name: 'May', UserActive: 1890, NewUser: 4800, EventCount: 2181 },
  { name: 'Jun', UserActive: 10500, NewUser: 8500, EventCount: 12200 }, // Data puncak
  { name: 'Jul', UserActive: 3490, NewUser: 4300, EventCount: 2100 },
  { name: 'Aug', UserActive: 4100, NewUser: 3900, EventCount: 2800 },
  { name: 'Sep', UserActive: 3900, NewUser: 3500, EventCount: 2600 },
  { name: 'Oct', UserActive: 4500, NewUser: 4100, EventCount: 3100 },
  { name: 'Nov', UserActive: 4200, NewUser: 3800, EventCount: 2900 },
  { name: 'Dec', UserActive: 4800, NewUser: 4300, EventCount: 3200 },
];

const UserTrafficChart = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 h-[420px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">User Traffic Overtime</h3>
        <select className="border border-gray-300 rounded-md p-1 text-sm focus:outline-none">
          <option>Monthly</option>
          <option>Weekly</option>
        </select>
      </div>
      <div className="flex space-x-8 mb-4">
        <div>
            <p className="text-sm text-gray-500">User Active</p>
            <p className="text-2xl font-bold text-gray-800 flex items-center">443K <span className="ml-2 text-sm font-semibold text-green-500">↑ 11.9%</span></p>
        </div>
         <div>
            <p className="text-sm text-gray-500">New User</p>
            <p className="text-2xl font-bold text-gray-800 flex items-center">87K <span className="ml-2 text-sm font-semibold text-red-500">↓ 6.3%</span></p>
        </div>
         <div>
            <p className="text-sm text-gray-500">Event Count</p>
            <p className="text-2xl font-bold text-gray-800 flex items-center">115K <span className="ml-2 text-sm font-semibold text-green-500">↑ 16%</span></p>
        </div>
      </div>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value / 1000}K`} />
            <Tooltip />
            <Legend iconType="circle" />
            <Line type="monotone" dataKey="UserActive" stroke="#22c55e" strokeWidth={2} dot={false} name="User Active" />
            <Line type="monotone" dataKey="NewUser" stroke="#f43f5e" strokeWidth={2} dot={false} name="New User" />
            <Line type="monotone" dataKey="EventCount" stroke="#a8a29e" strokeWidth={2} dot={false} name="Event Count" />
            </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UserTrafficChart;