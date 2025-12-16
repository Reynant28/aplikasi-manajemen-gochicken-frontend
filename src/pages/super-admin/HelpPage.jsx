// src/pages/HelpPage.jsx
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  BarChart2,
  Layers,
  Users,
  Building2,
  UserCog,
  Wallet,
  Receipt,
  Package,
  ArrowRight,
  HelpCircle,
  ExternalLink
} from "lucide-react";

const HelpPage = () => {
  const navigate = useNavigate();

  const guides = [
    {
      icon: <BookOpen className="text-blue-600" size={24} />,
      title: "General Page",
      desc: "Menampilkan ringkasan aktivitas operasional, statistik utama, dan aktivitas terbaru. Pantau performa sistem, penjualan, serta aktivitas harian melalui grafik interaktif.",
      path: "/super-admin/dashboard/general",
      color: "blue"
    },
    {
      icon: <BarChart2 className="text-green-600" size={24} />,
      title: "Reports Page",
      desc: "Menampilkan laporan data secara mendetail dengan diagram dan visualisasi untuk analisis penjualan, pengeluaran, dan performa karyawan yang dapat difilter.",
      path: "/super-admin/dashboard/reports",
      color: "green"
    },
    {
      icon: <BarChart2 className="text-violet-600" size={24} />,
      title: "Daily Report Page",
      desc: "Akses laporan harian operasional dengan ringkasan performa, pencapaian target, dan aktivitas penting hari ini.",
      path: "/super-admin/dashboard/daily",
      color: "violet"
    },
    {
      icon: <Building2 className="text-purple-600" size={24} />,
      title: "Kelola Cabang Page",
      desc: "Kelola data seluruh cabang di sistem. Tambah, perbarui, atau nonaktifkan cabang dengan informasi lengkap termasuk lokasi dan kontak.",
      path: "/super-admin/dashboard/kelola-cabang",
      color: "purple"
    },
    {
      icon: <Layers className="text-amber-600" size={24} />,
      title: "Kelola Produk Page",
      desc: "Kelola katalog produk dengan deskripsi, harga, gambar, dan kategori. Tambah, edit, atau hapus produk sesuai kebutuhan inventori.",
      path: "/super-admin/dashboard/produk",
      color: "amber"
    },
    {
      icon: <Users className="text-indigo-600" size={24} />,
      title: "Karyawan Page",
      desc: "Kelola data karyawan di semua cabang. Kelola informasi personal, jabatan, dan hak akses setiap anggota tim.",
      path: "/super-admin/dashboard/karyawan",
      color: "indigo"
    },
    {
      icon: <UserCog className="text-red-600" size={24} />,
      title: "Admin Cabang Page",
      desc: "Kelola akun Admin Cabang dan tentukan wewenang akses untuk setiap cabang. Pastikan keamanan dan kontrol akses yang tepat.",
      path: "/super-admin/dashboard/branch",
      color: "red"
    },
    {
      icon: <Wallet className="text-emerald-600" size={24} />,
      title: "Pengeluaran Page",
      desc: "Catat dan pantau semua pengeluaran operasional. Kelola anggaran, kategori pengeluaran, dan laporan keuangan secara real-time.",
      path: "/super-admin/dashboard/pengeluaran",
      color: "emerald"
    },
    {
      icon: <Receipt className="text-pink-600" size={24} />,
      title: "Jenis Pengeluaran Page",
      desc: "Kelola kategori dan jenis pengeluaran untuk organisasi yang lebih baik. Buat kategori custom sesuai kebutuhan bisnis.",
      path: "/super-admin/dashboard/jenis-pengeluaran",
      color: "pink"
    },
    {
      icon: <Receipt className="text-orange-600" size={24} />,
      title: "Transaksi Page",
      desc: "Akses riwayat transaksi lengkap dengan detail pembayaran, status, dan ekspor data untuk analisis lebih lanjut.",
      path: "/super-admin/dashboard/transaksi",
      color: "orange"
    },
    {
      icon: <Package className="text-cyan-600" size={24} />,
      title: "Daftar Bahan Baku Page",
      desc: "Kelola inventori bahan baku produksi. Pantau stok, tambah bahan baru, dan kelola persediaan untuk operasional yang lancar.",
      path: "/super-admin/dashboard/bahan",
      color: "cyan"
    },
    {
      icon: <Package className="text-teal-600" size={24} />,
      title: "Bahan Baku Pakai Page",
      desc: "Pantau penggunaan bahan baku dalam produksi. Lacak konsumsi bahan dan optimalkan penggunaan resources.",
      path: "/super-admin/dashboard/bahan-baku-pakai",
      color: "teal"
    },
  ];

  const handleNavigate = (path) => {
    navigate(path);
  };

  // Function to get color classes dynamically
  const getColorClasses = (color) => {
    const colorMap = {
      blue: {
        bg: "bg-blue-100",
        text: "text-blue-600",
        bgGradient: "from-blue-50 to-blue-100/50",
        border: "border-blue-200/30",
        badge: "bg-blue-100 text-blue-700",
        button: "bg-blue-600 hover:bg-blue-700",
        gradient: "from-blue-400 to-blue-600"
      },
      green: {
        bg: "bg-green-100",
        text: "text-green-600",
        bgGradient: "from-green-50 to-green-100/50",
        border: "border-green-200/30",
        badge: "bg-green-100 text-green-700",
        button: "bg-green-600 hover:bg-green-700",
        gradient: "from-green-400 to-green-600"
      },
      purple: {
        bg: "bg-purple-100",
        text: "text-purple-600",
        bgGradient: "from-purple-50 to-purple-100/50",
        border: "border-purple-200/30",
        badge: "bg-purple-100 text-purple-700",
        button: "bg-purple-600 hover:bg-purple-700",
        gradient: "from-purple-400 to-purple-600"
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
      red: {
        bg: "bg-red-100",
        text: "text-red-600",
        bgGradient: "from-red-50 to-red-100/50",
        border: "border-red-200/30",
        badge: "bg-red-100 text-red-700",
        button: "bg-red-600 hover:bg-red-700",
        gradient: "from-red-400 to-red-600"
      },
      emerald: {
        bg: "bg-emerald-100",
        text: "text-emerald-600",
        bgGradient: "from-emerald-50 to-emerald-100/50",
        border: "border-emerald-200/30",
        badge: "bg-emerald-100 text-emerald-700",
        button: "bg-emerald-600 hover:bg-emerald-700",
        gradient: "from-emerald-400 to-emerald-600"
      },
      orange: {
        bg: "bg-orange-100",
        text: "text-orange-600",
        bgGradient: "from-orange-50 to-orange-100/50",
        border: "border-orange-200/30",
        badge: "bg-orange-100 text-orange-700",
        button: "bg-orange-600 hover:bg-orange-700",
        gradient: "from-orange-400 to-orange-600"
      },
      cyan: {
        bg: "bg-cyan-100",
        text: "text-cyan-600",
        bgGradient: "from-cyan-50 to-cyan-100/50",
        border: "border-cyan-200/30",
        badge: "bg-cyan-100 text-cyan-700",
        button: "bg-cyan-600 hover:bg-cyan-700",
        gradient: "from-cyan-400 to-cyan-600"
      },
      pink: {
        bg: "bg-pink-100",
        text: "text-pink-600",
        bgGradient: "from-pink-50 to-pink-100/50",
        border: "border-pink-200/30",
        badge: "bg-pink-100 text-pink-700",
        button: "bg-pink-600 hover:bg-pink-700",
        gradient: "from-pink-400 to-pink-600"
      },
      teal: {
        bg: "bg-teal-100",
        text: "text-teal-600",
        bgGradient: "from-teal-50 to-teal-100/50",
        border: "border-teal-200/30",
        badge: "bg-teal-100 text-teal-700",
        button: "bg-teal-600 hover:bg-teal-700",
        gradient: "from-teal-400 to-teal-600"
      },
      violet: {
        bg: "bg-violet-100",
        text: "text-violet-600",
        bgGradient: "from-violet-50 to-violet-100/50",
        border: "border-violet-200/30",
        badge: "bg-violet-100 text-violet-700",
        button: "bg-violet-600 hover:bg-violet-700",
        gradient: "from-violet-400 to-violet-600"
      }
    };
    
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-2xl">
            <HelpCircle className="text-blue-600" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Help Center
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Panduan Lengkap Penggunaan Sistem GoChicken
            </p>
          </div>
        </div>
        <p className="text-gray-500 max-w-2xl mx-auto text-sm">
          Temukan panduan penggunaan setiap fitur dalam sistem manajemen GoChicken. 
          Klik tombol "Buka Halaman" untuk langsung mengakses fitur yang diinginkan.
        </p>
      </motion.div>

      {/* Guide Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
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
        </p>
      </motion.div>
    </div>
  );
};

export default HelpPage;