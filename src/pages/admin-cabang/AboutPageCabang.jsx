// src/pages/BackupPage.jsx
import React, { useState } from "react";
//eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Download, Database, Clock, HardDrive, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

const BackupPage = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [backupHistory, setBackupHistory] = useState([]);

    const token = localStorage.getItem("token");

    const handleBackup = async () => {
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const response = await axios.post(
                `${API_URL}/backup`,
                {},
                {
                    headers: { 
                        Authorization: `Bearer ${token}` 
                    },
                    responseType: 'blob' // Important for file download
                }
            );

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Get filename from content-disposition header or use default
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'gochicken_backup.sql';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1];
                }
            }
            
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setMessage({ 
                type: "success", 
                text: "Backup database berhasil didownload!" 
            });

            // Add to backup history
            const newBackup = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                filename: filename,
                size: response.data.size
            };
            setBackupHistory(prev => [newBackup, ...prev.slice(0, 4)]); // Keep last 5 backups

        } catch (error) {
            console.error("Backup error:", error);
            setMessage({ 
                type: "error", 
                text: error.response?.data?.message || "Gagal membuat backup database" 
            });
        } finally {
            setLoading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>

            <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Backup Database</h1>
                        <p className="text-gray-500 text-sm sm:text-base">Backup dan kelola data sistem GoChicken</p>
                    </div>
                </div>

                {/* Message Display */}
                {message.text && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className={`p-3 rounded-lg flex items-center gap-3 text-sm font-semibold ${
                            message.type === "success" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"
                        }`}
                    >
                        {message.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        {message.text}
                    </motion.div>
                )}

                {/* Backup Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Backup Information */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Database className="text-blue-600" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Backup Database GoChicken</h2>
                                    <p className="text-sm text-gray-500">Database: gochicken</p>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <HardDrive size={16} className="text-gray-400" />
                                    <span>Format file: <strong>SQL</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-gray-400" />
                                    <span>Backup terakhir: <strong>{
                                        backupHistory.length > 0 
                                            ? formatDate(backupHistory[0].timestamp)
                                            : 'Belum ada backup'
                                    }</strong></span>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-700">
                                    <strong>Penting:</strong> Backup database secara berkala untuk mencegah kehilangan data. 
                                    File backup berisi semua data transaksi, produk, karyawan, dan pengeluaran.
                                </p>
                            </div>
                        </div>

                        {/* Backup Action */}
                        <div className="lg:w-64 flex flex-col justify-center">
                            <button
                                onClick={handleBackup}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-semibold disabled:bg-red-400 w-full"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Membuat Backup...
                                    </>
                                ) : (
                                    <>
                                        <Download size={18} />
                                        Download Backup
                                    </>
                                )}
                            </button>
                            <p className="text-xs text-gray-500 text-center mt-2">
                                File akan didownload secara otomatis
                            </p>
                        </div>
                    </div>
                </div>

                {/* Backup History */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Riwayat Backup Terbaru</h3>
                    
                    {backupHistory.length > 0 ? (
                        <div className="space-y-3">
                            {backupHistory.map((backup) => (
                                <motion.div
                                    key={backup.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                            <Database className="text-green-600" size={16} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{backup.filename}</p>
                                            <p className="text-sm text-gray-500">{formatDate(backup.timestamp)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-700">
                                            {formatFileSize(backup.size)}
                                        </p>
                                        <p className="text-xs text-green-600 font-semibold">Berhasil</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Database className="mx-auto text-gray-400 mb-3" size={32} />
                            <p className="text-gray-500">Belum ada riwayat backup</p>
                            <p className="text-sm text-gray-400 mt-1">Backup database untuk melihat riwayat di sini</p>
                        </div>
                    )}
                </div>

                {/* Information Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                            <AlertCircle size={16} />
                            Tips Backup
                        </h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                            <li>• Backup database secara berkala (minimal 1x seminggu)</li>
                            <li>• Simpan file backup di lokasi yang aman</li>
                            <li>• Test restore backup secara periodik</li>
                        </ul>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                            <CheckCircle size={16} />
                            Yang Tercakup
                        </h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Semua data transaksi dan penjualan</li>
                            <li>• Data produk dan bahan baku</li>
                            <li>• Data karyawan dan pengguna</li>
                            <li>• Data pengeluaran dan laporan</li>
                        </ul>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default BackupPage;