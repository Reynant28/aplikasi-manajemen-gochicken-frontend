// src/components/DashboardCard.jsx
import { MoreHorizontal } from 'lucide-react';

const DashboardCard = ({ title, value, children }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal size={20} />
        </button>
      </div>
      <div className="mt-2">
        {value && <p className="text-3xl font-bold text-gray-800">{value}</p>}
        {children}
      </div>
    </div>
  );
};

export default DashboardCard;