import React from "react";
import { motion } from "framer-motion";
import { Drumstick, ArrowRightLeft, Wallet, Briefcase } from "lucide-react";

const formatRupiah = (value = 0) => {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `Rp ${value}`;
  }
};

const StatsCards = ({ loading, totalProduk, transaksiHariIni, pendapatanBulanIni, produkTerlaris }) => {
  const stats = [
    {
      title: "Total Produk",
      value: totalProduk,
      icon: <Drumstick size={24} />,
      color: "text-gray-700",
      bg: "bg-gray-100",
    },
    {
      title: "Transaksi Hari Ini",
      value: transaksiHariIni,
      icon: <ArrowRightLeft size={24} />,
      color: "text-gray-700",
      bg: "bg-gray-100",
    },
    {
      title: "Pendapatan Bulan Ini",
      value: formatRupiah(pendapatanBulanIni),
      icon: <Wallet size={24} />,
      color: "text-gray-700",
      bg: "bg-gray-100",
    },
    {
      title: "Produk Terlaris",
      value: produkTerlaris ?? "—",
      icon: <Briefcase size={24} />,
      color: "text-gray-700",
      bg: "bg-gray-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((item, index) => (
        <motion.div
          key={index}
          className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600"
                style={{ fontSize: "clamp(0.6rem, 1vw, 1.5rem)" }}
              >
                {item.title}
              </p>
              {loading ? (
                <p className="text-xl font-bold text-gray-800 mt-1 animate-pulse">...</p>
              ) : (
                <p
                  className={`font-bold text-gray-800 mt-1 ${String(item.value).length > 15 ? "text-md" : "text-lg"
                    }`}
                  style={{
                    lineHeight: "1.2",
                  }}
                >
                  {item.value}
                </p>
              )}
            </div>
            <div className={`p-3 rounded-xl ${item.bg}`}>
              <div className={item.color}>{item.icon}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;