// src/components/Header.jsx
import { Search, Bell, LogOut } from "lucide-react";
//eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cabang");
    navigate("/");
  };

  const user = JSON.parse(localStorage.getItem("user"));

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
          whileHover={{
            rotate: [0, -10, 10, -10, 0],
            transition: { duration: 0.4 },
          }}
        >
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
        </motion.button>

        {/* Greeting User (No Profile Picture) */}
        <div className="flex items-center">
          <span className="text-sm font-semibold text-gray-700">
            Hello, {user?.nama || "Guest"}
          </span>
        </div>

        {/* Logout Logo */}
        <motion.div
          onClick={handleLogout}
          className="relative w-10 h-10 flex items-center justify-center rounded-full cursor-pointer overflow-hidden group"
          whileTap={{ scale: 0.9 }}
        >
          <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          <motion.div
            initial={{ x: 0 }}
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <LogOut size={22} className="text-red-600" />
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
};

export default Header;
