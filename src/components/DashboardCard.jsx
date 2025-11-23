// src/components/DashboardCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

const DashboardCard = ({ title, value, icon, children }) => {

  const getTextSizeClass = (text) => {
    if (!text) return 'text-2xl';

    const length = text.toString().length;
    if (length <= 5) return 'text-2xl';
    if (length <= 15) return 'text-xl';
    return 'text-lg';
  }

  return (
    <motion.div
      className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</h3>
        {icon && (
          <div className="p-2 bg-gray-100 rounded-lg">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-2">
        {value && (
          <p className={`${getTextSizeClass(value)} font-bold text-gray-800 break-normal md:break-all`}>
            {value}
          </p>
        )}
        {children}
      </div>
    </motion.div>
  );
};

export default DashboardCard;