// src/components/Sidebar.jsx

import { NavLink } from 'react-router-dom';
import { 
  Home, 
  BarChart2, 
  Users, 
  Layers, 
  Map, 
  Target, 
  Settings, 
  HelpCircle,
  Building2,
  UserCog,
  Wallet
} from 'lucide-react';

const Sidebar = () => {
  const linkClass = ({ isActive }) => 
    isActive 
      ? "flex items-center p-2 bg-green-100 text-green-700 font-semibold rounded-lg"
      : "flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg";

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Management</h1>
      </div>
      <div className="flex-grow p-4 space-y-2">
        <div className="p-2 rounded-lg border border-gray-200 flex justify-between items-center">
          <span className='text-gray-600  '>All sites</span>
          <span className="text-gray-500">⌄</span>
        </div>
        <nav className="space-y-1">
          <NavLink to="/general" className={linkClass}>
            <Home size={20} className="mr-3" /> General
          </NavLink>
          <NavLink to="/reports" className={linkClass}>
            <BarChart2 size={20} className="mr-3" /> Reports
          </NavLink>
          <NavLink to="/advertising" className={linkClass}>
            <Building2 size={20} className="mr-3" /> Kelola Cabang
            <span className="mr-3"></span>
          </NavLink>
          <NavLink to="/karyawan" className={linkClass}>
            <Users size={20} className="mr-3" /> Karyawan
          </NavLink>
          <NavLink to="/branch" className={linkClass}>
            <UserCog size={20} className="mr-3" /> Kelola Admin Cabang
          </NavLink>
          <NavLink to="/pengeluaran" className={linkClass}>
            <Wallet size={20} className="mr-3" /> Pengeluaran
          </NavLink>
          {/* Link lainnya */}
          <a href="#" className="flex items-center p-2 text-gray-400 cursor-not-allowed">
            <Layers size={20} className="mr-3" /> Bahan
          </a>
          <a href="#" className="flex items-center p-2 text-gray-400 cursor-not-allowed">
            <Map size={20} className="mr-3" /> Heatmap
          </a>
          <a href="#" className="flex items-center p-2 text-gray-400 cursor-not-allowed">
            <Home size={20} className="mr-3" /> Domain
          </a>
        </nav>
      </div>
      <div className="p-4 border-t border-gray-200 space-y-2">
        <a href="#" className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <HelpCircle size={20} className="mr-3" /> Help Center
        </a>
        <a href="#" className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <Settings size={20} className="mr-3" /> Settings
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
