import { useState, useRef, useEffect } from 'react';
import { Search, Bell, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cabang");
    navigate("/");
  };

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-gradient-to-r from-white to-gray-50 p-4 flex justify-between items-center border-b border-gray-200 shadow-sm">
     {/* Search Section */}
      <div 
        className="flex items-center w-1/3 justify-start ml-4" // 👈 tambahin ml-4 (margin-left)
        ref={searchRef}
      >
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search..."
            className={`
              py-2 pr-4 text-gray-700 rounded-full transition-all duration-500 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-green-700
              ${isSearchOpen
                ? 'w-64 pl-10 bg-white shadow-lg opacity-100'
                : 'w-10 pl-10 bg-gray-200 shadow-none opacity-0 pointer-events-none'
              }
            `}
            onFocus={() => setIsSearchOpen(true)}
          />
          <button
            onClick={() => setIsSearchOpen(true)}
            className={`
              absolute inset-y-0 flex items-center transition-all duration-500 ease-in-out
              ${isSearchOpen
                ? 'left-0 ml-3 text-gray-500'
                : 'left-0 ml-0 bg-green-700 p-2 rounded-full text-white hover:bg-green-800'
              }
            `}
            style={isSearchOpen ? { zIndex: 10 } : { zIndex: 20 }}
          >
            <Search size={20} />
          </button>
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

        {/* Greeting User */}
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