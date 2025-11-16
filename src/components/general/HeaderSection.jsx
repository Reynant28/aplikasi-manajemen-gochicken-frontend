import React from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

const HeaderSection = ({ onRefresh, loading }) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Ringkasan bisnis dan aktivitas terkini</p>
      </motion.div>
      
      <motion.div 
        className="flex gap-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 text-white bg-gray-700 rounded-lg hover:bg-gray-800 transition-all font-medium shadow-sm disabled:bg-gray-400"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </motion.div>
    </div>
  );
};

export default HeaderSection;