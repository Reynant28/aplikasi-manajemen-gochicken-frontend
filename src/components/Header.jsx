// src/components/Header.jsx
import { Search, Bell } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white p-4 flex justify-between items-center border-b border-gray-200">
      <div className="flex items-center w-1/3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-full bg-gray-100 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-100 relative">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        <div className="flex items-center space-x-2">
            <img src="https://i.pravatar.cc/40" alt="Admin" className="w-8 h-8 rounded-full" />
            <span className="text-sm font-semibold">Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Header;