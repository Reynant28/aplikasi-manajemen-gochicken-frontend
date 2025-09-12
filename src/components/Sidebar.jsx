// src/components/Sidebar.jsx
import { Home, BarChart2, Users, Layers, Map, Target, Settings, HelpCircle } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Super Admin</h1>
      </div>
      <div className="flex-grow p-4 space-y-2">
        <div className="p-2 rounded-lg border border-gray-200 flex justify-between items-center">
          <span>All sites</span>
          <span className="text-gray-500">⌄</span>
        </div>
        <nav className="space-y-1">
          <a href="#" className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Home size={20} className="mr-3" /> General
          </a>
          <a href="#" className="flex items-center p-2 bg-green-100 text-green-700 font-semibold rounded-lg">
            <BarChart2 size={20} className="mr-3" /> Reports
          </a>
          <a href="#" className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Target size={20} className="mr-3" /> Advertising <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">1</span>
          </a>
          <a href="#" className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Users size={20} className="mr-3" /> Audience
          </a>
          <a href="#" className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Layers size={20} className="mr-3" /> Retention
          </a>
          <a href="#" className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Map size={20} className="mr-3" /> Heatmap
          </a>
          <a href="#" className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
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