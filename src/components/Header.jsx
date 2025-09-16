// src/components/Header.jsx
import { Search, Bell } from "lucide-react";
import { motion } from "framer-motion";

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-white to-gray-50 p-4 flex justify-between items-center border-b border-gray-200 shadow-sm">
      {/* Search */}
      <div className="flex items-center w-1/3">
        <div className="relative w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-full bg-gray-100 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Notification Button */}
        <motion.button
          className="p-2 rounded-full hover:bg-gray-100 relative"
          whileTap={{ scale: 0.9 }}
          whileHover={{ rotate: [0, -10, 10, -10, 0], transition: { duration: 0.4 } }}
        >
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
        </motion.button>

        {/* Profile */}
        <div className="flex items-center space-x-2">
          <motion.img
            src="https://i.pravatar.cc/40"
            alt="Admin"
            className="w-9 h-9 rounded-full border-2 border-green-400 shadow-sm"
            whileHover={{ scale: 1.1 }}
          />
          <span className="text-sm font-semibold text-gray-700">Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
