import React, { useState, useRef } from 'react';
import { 
  Database, Download, Upload, AlertTriangle, 
  CheckCircle, XCircle, FileText, RefreshCw,
  HardDrive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { backupService } from '../../services/backupService'; 

const BackupRestorePage = () => {
  // --- States ---
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: '' }
  
  const fileInputRef = useRef(null);

  // --- Theme Logic (Hardcoded Super Admin Orange for this specific page) ---
  const theme = {
    gradient: "from-orange-600 to-orange-700",
    text: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    button: "bg-orange-600 hover:bg-orange-700",
    lightButton: "bg-white text-orange-600 hover:bg-orange-50 border border-orange-200"
  };

  // --- Handlers ---

  const showNotification = (type, message) => {
    setNotification({ type, message });
    // Auto hide after 5 seconds
    setTimeout(() => setNotification(null), 5000);
  };

  const handleExport = async () => {
    if (isBackingUp) return;
    setIsBackingUp(true);
    setNotification(null);

    try {
      const result = await backupService.exportDatabase();
      showNotification('success', `Backup berhasil! File ${result.filename} telah diunduh.`);
    } catch (error) {
      showNotification('error', error.message || 'Gagal melakukan backup database.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi ekstensi sederhana
      if (!file.name.endsWith('.sql')) {
        showNotification('error', 'Hanya file .sql yang diperbolehkan.');
        return;
      }
      setSelectedFile(file);
      setNotification(null);
    }
  };

  const handleRestore = async () => {
    if (!selectedFile || isRestoring) return;

    // Double Confirmation
    const confirmMessage = `PERINGATAN KERAS:\n\nAnda akan melakukan RESTORE database menggunakan file "${selectedFile.name}".\n\n1. Semua data saat ini akan DITIMPA/DIHAPUS.\n2. Proses ini tidak dapat dibatalkan.\n\nKetik "RESTORE" untuk melanjutkan:`;
    
    const userInput = window.prompt(confirmMessage);
    
    if (userInput !== "RESTORE") {
      showNotification('error', 'Proses dibatalkan. Konfirmasi tidak sesuai.');
      return;
    }

    setIsRestoring(true);
    setNotification(null);

    try {
      const result = await backupService.restoreDatabase(selectedFile);
      showNotification('success', result.message || 'Database berhasil direstore!');
      setSelectedFile(null); // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      showNotification('error', error.message || 'Gagal melakukan restore database.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Database className="text-orange-600" size={28} />
            Database Management
          </h1>
          <p className="text-gray-500 mt-1">
            Lakukan backup rutin untuk keamanan data atau restore data dari file cadangan.
          </p>
        </div>
      </div>

      {/* --- Notification Area --- */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm ${
              notification.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            <div className="flex-1 text-sm font-medium">{notification.message}</div>
            <button onClick={() => setNotification(null)} className="opacity-50 hover:opacity-100">
              <XCircle size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* === CARD 1: EXPORT / BACKUP === */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full"
        >
          <div className={`p-6 bg-gradient-to-r ${theme.gradient} text-white`}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Download size={20} /> Export Database
                </h2>
                <p className="text-orange-100 text-sm mt-1 opacity-90">
                  Unduh seluruh data sistem dalam format SQL.
                </p>
              </div>
              <div className="bg-white/20 p-2 rounded-lg">
                <HardDrive size={24} className="text-white" />
              </div>
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                <div className="mt-1"><CheckCircle size={18} className="text-blue-600" /></div>
                <div>
                  <h4 className="font-semibold text-blue-800 text-sm">Rekomendasi</h4>
                  <p className="text-blue-600 text-xs mt-1 leading-relaxed">
                    Lakukan backup secara berkala (misal: setiap hari setelah tutup toko) untuk mencegah kehilangan data akibat kesalahan sistem atau human error.
                  </p>
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                <p className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  Format file: <strong>.sql</strong>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  Ukuran: Tergantung jumlah transaksi
                </p>
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={isBackingUp || isRestoring}
              className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]
                ${isBackingUp 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                  : `${theme.button} text-white shadow-orange-200`
                }`}
            >
              {isBackingUp ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  Memproses Backup...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Download Backup Sekarang
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* === CARD 2: IMPORT / RESTORE === */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full"
        >
          <div className="p-6 bg-gray-800 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Upload size={20} /> Restore Database
                </h2>
                <p className="text-gray-300 text-sm mt-1">
                  Kembalikan data sistem dari file backup.
                </p>
              </div>
              <div className="bg-white/10 p-2 rounded-lg">
                <RefreshCw size={24} className="text-gray-300" />
              </div>
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col space-y-6">
            {/* Warning Box */}
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex gap-3">
              <div className="mt-1"><AlertTriangle size={18} className="text-red-600" /></div>
              <div>
                <h4 className="font-semibold text-red-800 text-sm">Zona Berbahaya</h4>
                <p className="text-red-600 text-xs mt-1 leading-relaxed">
                  Proses restore akan <strong>MENIMPA & MENGHAPUS</strong> seluruh data saat ini. 
                  Pastikan Anda menggunakan file backup yang benar. Aksi ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            {/* File Upload Area */}
            <div className="flex-1 flex flex-col justify-end space-y-4">
              <label 
                htmlFor="file-upload"
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors
                  ${selectedFile 
                    ? 'border-orange-300 bg-orange-50' 
                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
                  }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {selectedFile ? (
                    <>
                      <FileText className="w-8 h-8 text-orange-500 mb-2" />
                      <p className="text-sm font-medium text-gray-700 text-center px-4 break-all">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Klik untuk upload</span> file SQL
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Hanya file .sql</p>
                    </>
                  )}
                </div>
                <input 
                  ref={fileInputRef}
                  id="file-upload" 
                  type="file" 
                  accept=".sql"
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </label>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    if(fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  disabled={!selectedFile || isRestoring}
                  className="py-3 px-4 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleRestore}
                  disabled={!selectedFile || isRestoring || isBackingUp}
                  className={`py-3 px-4 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-md
                    ${!selectedFile || isRestoring
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 shadow-red-200'
                    }`}
                >
                  {isRestoring ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Memulihkan...
                    </>
                  ) : (
                    <>
                      Restore Data
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BackupRestorePage;