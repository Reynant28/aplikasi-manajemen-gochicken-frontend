import React from "react";
import { motion } from "framer-motion";
import TopProductsChart from "../TopProductsChart";

const TopProductsSection = ({ loading, error, data }) => {
  return (
    <motion.div
      className="lg:col-span-1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      {loading ? (
        <div className="flex justify-center items-center h-full bg-white rounded-2xl shadow-md border border-gray-100 text-gray-500">
          Memuat data...
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-full bg-white rounded-2xl shadow-md border border-gray-100 text-red-500">
          {error}
        </div>
      ) : data.length === 0 ? (
        <div className="flex justify-center items-center h-full bg-white rounded-2xl shadow-md border border-gray-100 text-gray-400">
          Tidak ada data produk terlaris.
        </div>
      ) : (
        <TopProductsChart data={data} filter="bulan" />
      )}
    </motion.div>
  );
};

export default TopProductsSection;