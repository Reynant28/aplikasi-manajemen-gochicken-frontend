import React from "react";
import { motion } from "framer-motion";

const DailyReportCard = ({ title, value, icon, bgColor = "bg-white", textColor = "text-gray-800", iconBg = "bg-gray-100", isPositive = true }) => {
  return (
    <motion.div
      className={`${bgColor} rounded-2xl shadow-md hover:shadow-xl  p-6 border border-gray-100 overflow-hidden relative`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: "easeOut" }}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${iconBg} shadow-lg`}>
            {icon}
          </div>
          <div className={`text-xs font-semibold px-3 py-1 rounded-full ${
            isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isPositive ? '↑' : '↓'}
          </div>
        </div>
        <h3 
          className="text-font-medium text-gray-500 mb-1"
          style={{ fontSize: "clamp(0.6rem, 1vw, 1.5rem)", lineHeight: "1.2" }}
        >
          {title}
        </h3>

        <p
          className={`font-bold ${textColor}`}
          style={{
            fontSize: "clamp(0.9rem, 1.5vw, 1.5rem)",
            lineHeight: "1.2",
          }}
        >
          {value}
        </p>
      </div>
    </motion.div>
  );
};

export default DailyReportCard;