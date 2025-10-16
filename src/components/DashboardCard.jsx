// src/components/DashboardCard.jsx
import { MoreHorizontal } from 'lucide-react';

const DashboardCard = ({ title, value, children }) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 w-full overflow-hidden">
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <button className="text-gray-400 hover:text-gray-600"/>
      </div>
      <div className="mt-2">
        {value && <p className="text-2xl font-bold text-gray-800 break-normal md:break-all">{value}</p>}
        {children}
      </div>
    </div>
  );
};

export default DashboardCard;