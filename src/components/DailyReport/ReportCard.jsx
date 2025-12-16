// src/components/DailyReport/ReportCard.jsx
import React from "react";
import { motion } from "framer-motion";

export default function ReportCard({ title, value, icon, theme }) {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-md p-5 border-l-4"
      style={{ borderColor: theme.raw.primary }}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${theme.quickActionBg}`}>
          {React.cloneElement(icon, { className: theme.primaryAccent, size: 22 })}
        </div>
      </div>
    </motion.div>
  );
}