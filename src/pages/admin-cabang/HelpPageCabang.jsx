// src/pages/HelpPageCabang.jsx
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  BarChart2,
  Package,
  Users,
  Wallet,
  ShoppingCart,
  ArrowRight,
  HelpCircle,
  ExternalLink
} from "lucide-react";

const HelpPageCabang = () => {
  const navigate = useNavigate();

  const guides = [
    {
      icon: <BookOpen className="text-green-600" size={24} />,
      title: "General Page",
      desc: "Menampilkan dashboard utama untuk setiap cabang. Semua data yang muncul di sini berdasarkan cabang yang sedang login, sehingga setiap cabang memiliki tampilan dan statistik yang berbeda. Pantau performa penjualan, aktivitas terbaru, serta ringkasan laporan operasional secara real-time.",
      path: "/admin-cabang/dashboard/general",
      color: "green"
    },
    {
      icon: <BarChart2 className="text-blue-600" size={24} />,
      title: "Reports Page",
      desc: "Berisi laporan rinci dari aktivitas operasional cabang. Lihat data penjualan, pengeluaran, serta performa karyawan secara spesifik untuk cabang masing-masing. Evaluasi keuangan dan operasional harian dengan tampilan grafik dan tabel yang mudah dibaca.",
      path: "/admin-cabang/dashboard/reports",
      color: "blue"
    },
    {
      icon: <ShoppingCart className="text-violet-600" size={24} />,
      title: "Pemesanan Page",
      desc: "Kelola seluruh proses pemesanan dari pelanggan cabang. Buat pesanan baru, lacak status pemesanan, kelola pembayaran, dan proses penyelesaian order. Fitur ini memudahkan pengelolaan transaksi harian dengan antarmuka yang intuitif dan efisien.",
      path: "/admin-cabang/dashboard/pemesanan",
      color: "violet"
    },
    {
      icon: <Package className="text-amber-600" size={24} />,
      title: "Manajemen Stok Page",
      desc: "Pantau dan kelola stok produk di cabang. Tambah stok baru, kurangi stok yang terpakai, pastikan data persediaan selalu akurat. Kontrol bahan dan ketersediaan produk dapat dilakukan lebih cepat dan efisien untuk operasional harian.",
      path: "/admin-cabang/dashboard/stok",
      color: "amber"
    },
    {
      icon: <Users className="text-indigo-600" size={24} />,
      title: "Manajemen Karyawan Page",
      desc: "Kelola data karyawan di cabang, termasuk informasi personal dan rincian gaji. Tambah karyawan baru sesuai kebutuhan operasional (menunggu persetujuan Super Admin). Kelola jadwal kerja dan informasi kontak tim cabang.",
      path: "/admin-cabang/dashboard/karyawan",
      color: "indigo"
    },
    {
      icon: <Wallet className="text-emerald-600" size={24} />,
      title: "Pengeluaran Page",
      desc: "Tampilkan seluruh data pengeluaran yang tercatat di cabang. Setiap transaksi pengeluaran berisi informasi rinci seperti tanggal, jumlah, dan deskripsi penggunaan dana. Kontrol keuangan operasional harian dengan lebih akurat dan terorganisir.",
      path: "/admin-cabang/dashboard/pengeluaran",
      color: "emerald"
    },
  ];

  const handleNavigate = (path) => {
    navigate(path);
  };

  // Function to get color classes dynamically
  const getColorClasses = (color) => {
    const colorMap = {
      green: {
        bg: "bg-green-100",
        text: "text-green-600",
        bgGradient: "from-green-50 to-green-100/50",
        border: "border-green-200/30",
        badge: "bg-green-100 text-green-700",
        button: "bg-green-600 hover:bg-green-700",
        gradient: "from-green-400 to-green-600"
      },
      blue: {
        bg: "bg-blue-100",
        text: "text-blue-600",
        bgGradient: "from-blue-50 to-blue-100/50",
        border: "border-blue-200/30",
        badge: "bg-blue-100 text-blue-700",
        button: "bg-blue-600 hover:bg-blue-700",
        gradient: "from-blue-400 to-blue-600"
      },
      violet: {
        bg: "bg-violet-100",
        text: "text-violet-600",
        bgGradient: "from-violet-50 to-violet-100/50",
        border: "border-violet-200/30",
        badge: "bg-violet-100 text-violet-700",
        button: "bg-violet-600 hover:bg-violet-700",
        gradient: "from-violet-400 to-violet-600"
      },
      amber: {
        bg: "bg-amber-100",
        text: "text-amber-600",
        bgGradient: "from-amber-50 to-amber-100/50",
        border: "border-amber-200/30",
        badge: "bg-amber-100 text-amber-700",
        button: "bg-amber-600 hover:bg-amber-700",
        gradient: "from-amber-400 to-amber-600"
      },
      indigo: {
        bg: "bg-indigo-100",
        text: "text-indigo-600",
        bgGradient: "from-indigo-50 to-indigo-100/50",
        border: "border-indigo-200/30",
        badge: "bg-indigo-100 text-indigo-700",
        button: "bg-indigo-600 hover:bg-indigo-700",
        gradient: "from-indigo-400 to-indigo-600"
      },
      emerald: {
        bg: "bg-emerald-100",
        text: "text-emerald-600",
        bgGradient: "from-emerald-50 to-emerald-100/50",
        border: "border-emerald-200/30",
        badge: "bg-emerald-100 text-emerald-700",
        button: "bg-emerald-600 hover:bg-emerald-700",
        gradient: "from-emerald-400 to-emerald-600"
      }
    };
    
    return colorMap[color] || colorMap.green;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 p-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-green-100 rounded-2xl">
            <HelpCircle className="text-green-600" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Help Center - Admin Cabang
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Panduan Lengkap Penggunaan Sistem GoChicken untuk Cabang
            </p>
          </div>
        </div>
        <p className="text-gray-500 max-w-2xl mx-auto text-sm">
          Temukan panduan penggunaan setiap fitur dalam sistem manajemen GoChicken khusus untuk admin cabang. 
          Klik tombol "Buka Halaman" untuk langsung mengakses fitur yang diinginkan.
        </p>
      </motion.div>

      {/* Guide Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {guides.map((item, index) => {
          const colorClasses = getColorClasses(item.color);
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
              }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -5,
                transition: { duration: 0.2 }
              }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/60 overflow-hidden group"
            >
              {/* Header dengan gradient */}
              <div className={`bg-gradient-to-r ${colorClasses.bgGradient} p-6 border-b ${colorClasses.border}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 ${colorClasses.bg} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                        {item.title}
                      </h3>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${colorClasses.badge} text-xs font-medium mt-2`}>
                        <ExternalLink size={12} />
                        {item.path.split('/').pop()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-600 leading-relaxed text-sm mb-6">
                  {item.desc}
                </p>
                
                {/* Action Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center justify-center gap-2 ${colorClasses.button} text-white py-3 px-4 rounded-xl transition-all duration-300 font-semibold group/btn`}
                >
                  <span>Buka Halaman</span>
                  <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </motion.button>
              </div>

              {/* Decorative Element */}
              <div className={`h-1 bg-gradient-to-r ${colorClasses.gradient}`}></div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Help Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center mt-12 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 max-w-2xl mx-auto"
      >
        <div className="flex items-center justify-center gap-2 text-gray-500 mb-2">
          <HelpCircle size={18} />
          <span className="font-medium">Butuh Bantuan Lebih Lanjut?</span>
        </div>
        <p className="text-sm text-gray-500">
          Jika mengalami kendala atau memiliki pertanyaan tambahan, 
          hubungi tim support kami melalui email support@gochicken.com
          atau hubungi Super Admin untuk bantuan teknis.
        </p>
      </motion.div>
    </div>
  );
};

export default HelpPageCabang;