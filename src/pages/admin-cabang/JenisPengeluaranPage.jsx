import { useState, useEffect, useCallback } from "react";
import { FileText, TrendingUp, DollarSign, Package, Calendar, RefreshCw } from "lucide-react"; 
import { motion } from "framer-motion";

const API_URL = "http://localhost:8000/api";

const JenisPengeluaranPage = () => {
    const [jenisPengeluaran, setJenisPengeluaran] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalJenis: 0,
        jenisAktif: 0,
        jenisTerpopuler: "-",
        updateTerakhir: "-"
    });

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const cabang = JSON.parse(localStorage.getItem("cabang"));

    // Tema warna netral sesuai GoChicken
    const theme = {
        bgGradient: 'from-red-50 via-white to-red-100',
        primary: 'text-red-600',
        primaryBg: 'bg-red-600',
        primaryLight: 'bg-red-50',
        primaryBorder: 'border-red-200',
        cardBg: 'bg-white',
        cardBorder: 'border-gray-200',
        textPrimary: 'text-gray-900',
        textSecondary: 'text-gray-600',
        textMuted: 'text-gray-500'
    };

    // Ambil data jenis pengeluaran
    const fetchJenisPengeluaran = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/jenis-pengeluaran`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setJenisPengeluaran(data.data || []);
            calculateStats(data.data || []);
        } catch (err) {
            console.error("Fetch jenis pengeluaran error:", err);
            setJenisPengeluaran([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const calculateStats = (data) => {
        const totalJenis = data.length;
        const jenisAktif = data.filter(item => item.status === 'active' || !item.status).length;
        const jenisTerpopuler = data.length > 0 ? data[0].jenis_pengeluaran : "-";
        const updateTerakhir = data.length > 0 ? 
            new Date().toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            }) : "-";

        setStats({
            totalJenis,
            jenisAktif,
            jenisTerpopuler,
            updateTerakhir
        });
    };

    useEffect(() => {
        if (token) fetchJenisPengeluaran();
    }, [token, fetchJenisPengeluaran]);

    const StatCard = ({ title, value, icon: Icon, description }) => (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${theme.cardBg} rounded-2xl p-6 shadow-lg border ${theme.cardBorder} hover:shadow-xl transition-all duration-300`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className={`text-sm font-medium ${theme.textSecondary}`}>{title}</p>
                    <p className={`text-2xl font-bold ${theme.textPrimary} mt-2`}>{value}</p>
                    {description && (
                        <p className={`text-xs ${theme.textMuted} mt-1`}>{description}</p>
                    )}
                </div>
                <div className={`p-3 rounded-full ${theme.primaryLight}`}>
                    <Icon className={`w-6 h-6 ${theme.primary}`} />
                </div>
            </div>
        </motion.div>
    );

    const JenisCard = ({ item, index }) => (
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${theme.cardBg} rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border ${theme.cardBorder}`}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`w-3 h-3 rounded-full ${theme.primaryBg}`}></div>
                        <h3 className={`font-semibold ${theme.textPrimary} text-lg`}>
                            {item.jenis_pengeluaran}
                        </h3>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                        <span className={`flex items-center gap-1 ${theme.primaryLight} px-3 py-1 rounded-full ${theme.primary}`}>
                            <FileText size={14} />
                            Jenis Pengeluaran
                        </span>
                        <span className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full text-green-700">
                            <Package size={14} />
                            Aktif
                        </span>
                    </div>
                </div>
                
                <div className="text-right">
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                        <p className={`text-xs ${theme.textMuted}`}>ID</p>
                        <p className="text-sm font-mono text-gray-700">{item.id_jenis}</p>
                    </div>
                </div>
            </div>
            
            {/* Usage Stats Placeholder */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className={`text-xs ${theme.textMuted}`}>Digunakan</p>
                        <p className={`text-sm font-semibold ${theme.textPrimary}`}>-</p>
                    </div>
                    <div>
                        <p className={`text-xs ${theme.textMuted}`}>Transaksi</p>
                        <p className={`text-sm font-semibold ${theme.textPrimary}`}>-</p>
                    </div>
                    <div>
                        <p className={`text-xs ${theme.textMuted}`}>Status</p>
                        <p className="text-sm font-semibold text-green-600">Aktif</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    if (loading) {
        return (
            <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} p-6`}>
                <div className="flex items-center justify-center h-64">
                    <RefreshCw className={`animate-spin h-8 w-8 ${theme.primary} mr-3`} />
                    <p className={`text-lg ${theme.textSecondary}`}>Memuat data jenis pengeluaran...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} p-6`}>
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className={`text-3xl font-bold ${theme.textPrimary} mb-2`}>
                    Katalog Jenis Pengeluaran
                </h1>
                <p className={theme.textSecondary}>
                    Daftar lengkap jenis pengeluaran yang tersedia di sistem
                </p>
            </motion.div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Jenis"
                    value={stats.totalJenis}
                    icon={FileText}
                    description="Jenis pengeluaran tersedia"
                />
                <StatCard
                    title="Jenis Aktif"
                    value={stats.jenisAktif}
                    icon={TrendingUp}
                    description="Dalam sistem"
                />
                <StatCard
                    title="Jenis Terpopuler"
                    value={stats.jenisTerpopuler}
                    icon={DollarSign}
                    description="Paling sering digunakan"
                />
                <StatCard
                    title="Update Terakhir"
                    value={stats.updateTerakhir}
                    icon={Calendar}
                    description="Data terbaru"
                />
            </div>

            {/* Jenis Pengeluaran Grid */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className={`text-xl font-bold ${theme.textPrimary}`}>Daftar Jenis Pengeluaran</h2>
                        <p className={`${theme.textSecondary} text-sm`}>
                            {jenisPengeluaran.length} jenis pengeluaran ditemukan
                        </p>
                    </div>
                    <button 
                        onClick={fetchJenisPengeluaran}
                        className={`flex items-center gap-2 px-4 py-2 ${theme.cardBg} ${theme.textSecondary} rounded-lg hover:bg-gray-50 transition-colors border ${theme.cardBorder}`}
                    >
                        <RefreshCw size={16} />
                        Refresh Data
                    </button>
                </div>

                {jenisPengeluaran.length === 0 ? (
                    <div className={`text-center py-12 ${theme.cardBg} rounded-2xl shadow-lg`}>
                        <FileText className={`mx-auto h-16 w-16 ${theme.textMuted} mb-4`} />
                        <p className={`${theme.textSecondary} text-lg`}>Belum ada data jenis pengeluaran</p>
                        <p className={`${theme.textMuted} text-sm mt-1`}>
                            Data akan muncul di sini ketika tersedia
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jenisPengeluaran.map((item, index) => (
                            <JenisCard 
                                key={item.id_jenis} 
                                item={item} 
                                index={index}
                            />
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Informasi Tambahan */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`${theme.cardBg} rounded-2xl shadow-lg p-6`}
            >
                <h3 className={`text-lg font-semibold ${theme.textPrimary} mb-4`}>Informasi Sistem</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className={`${theme.primaryLight} rounded-xl p-4 inline-block`}>
                            <FileText className={`w-8 h-8 ${theme.primary} mx-auto mb-2`} />
                        </div>
                        <p className={`text-sm ${theme.textSecondary} mt-2`}>Jenis pengeluaran digunakan untuk mengkategorikan setiap transaksi pengeluaran</p>
                    </div>
                    <div className="text-center">
                        <div className="bg-green-50 rounded-xl p-4 inline-block">
                            <Package className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        </div>
                        <p className={`text-sm ${theme.textSecondary} mt-2`}>Semua jenis pengeluaran dalam status aktif dan siap digunakan</p>
                    </div>
                    <div className="text-center">
                        <div className={`${theme.primaryLight} rounded-xl p-4 inline-block`}>
                            <TrendingUp className={`w-8 h-8 ${theme.primary} mx-auto mb-2`} />
                        </div>
                        <p className={`text-sm ${theme.textSecondary} mt-2`}>Data diperbarui secara real-time dari sistem</p>
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats Footer */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center"
            >
                <div className={`${theme.cardBg} rounded-xl p-4 shadow-md`}>
                    <p className={`text-sm ${theme.textSecondary}`}>Cabang Aktif</p>
                    <p className={`text-lg font-semibold ${theme.textPrimary}`}>{cabang?.nama_cabang || 'N/A'}</p>
                </div>
                <div className={`${theme.cardBg} rounded-xl p-4 shadow-md`}>
                    <p className={`text-sm ${theme.textSecondary}`}>Periode Data</p>
                    <p className={`text-lg font-semibold ${theme.textPrimary}`}>
                        {new Date().toLocaleDateString('id-ID', { 
                            month: 'long', 
                            year: 'numeric' 
                        })}
                    </p>
                </div>
                <div className={`${theme.cardBg} rounded-xl p-4 shadow-md`}>
                    <p className={`text-sm ${theme.textSecondary}`}>Status Sistem</p>
                    <p className="text-lg font-semibold text-green-600">Aktif</p>
                </div>
            </motion.div>
        </div>
    );
};

export default JenisPengeluaranPage;