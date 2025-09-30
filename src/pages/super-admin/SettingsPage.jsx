import React, { useState, useEffect } from 'react';
import { Palette, Users, Settings as SettingsIcon, Shield, CheckCircle } from 'lucide-react';
import { availableThemes, saveThemeToStorage, getThemeClasses } from "../../components/ui/themeUtils.js"; 

// --- Komponen Notifikasi Sukses Sederhana ---
const SimpleToast = ({ message, theme, onClose }) => {
    // Menggunakan theme.primary untuk warna latar belakang Toast
    const themeClass = availableThemes.find(t => t.value === theme) || availableThemes[0];
    
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-5 right-5 z-50">
            <div className={`p-4 rounded-lg shadow-2xl text-white flex items-center space-x-3 transition-transform duration-300 ease-out transform translate-y-0 ${themeClass.primary}`}>
                <CheckCircle size={20} />
                <p className="font-semibold">{message}</p>
            </div>
        </div>
    );
};

const SettingsPage = () => {
    // State theme diambil dari localStorage saat mount
    const [themeColor, setThemeColor] = useState(getThemeClasses().value);
    
    // SIMULASI ROLE (Tidak Berubah)
    const [userRole, setUserRole] = useState('branch_admin'); 
    const [branchName, setBranchName] = useState('Cabang Utama Bandung');
    const [notificationSettings, setNotificationSettings] = useState(true);
    const [systemMessage, setSystemMessage] = useState(''); 
    const [isAlertVisible, setIsAlertVisible] = useState(false);

    const currentTheme = availableThemes.find(t => t.value === themeColor) || availableThemes[0];
    const isSuperAdmin = userRole === 'super_admin';
    const isAdmin = userRole === 'branch_admin' || isSuperAdmin;

    // Logika Notifikasi
    const showAlert = (message) => {
        setSystemMessage(message);
        setIsAlertVisible(true);
    };

    // --- Logika Penyimpanan Tema ---
    const handleThemeChange = (color) => {
        setThemeColor(color);
        saveThemeToStorage(color); // Gunakan utilitas untuk menyimpan ke localStorage
        showAlert(`Tema berhasil diubah menjadi ${availableThemes.find(t => t.value === color).name}!`);
        // Catatan: Anda perlu me-refresh aplikasi/page agar komponen lain memuat tema baru
        // window.location.reload(); // Hanya di lingkungan development/testing
    };

    const handleSaveGeneralSettings = (e) => {
        e.preventDefault();
        console.log("Menyimpan Pengaturan Umum:", { branchName, notificationSettings });
        showAlert("Pengaturan umum cabang berhasil disimpan!");
    };
    
    const handleSaveSuperAdminSettings = (e) => {
        e.preventDefault();
        console.log("Menyimpan Pengaturan Super Admin:", { systemMessage });
        showAlert("Pengaturan sistem lanjutan berhasil disimpan!");
    };
    
    // Pemuatan tema awal
    useEffect(() => {
        const initialTheme = getThemeClasses().value;
        setThemeColor(initialTheme);
    }, []);


    // --- Render Komponen ---
    if (!isAdmin) {
        return <div className="p-6 text-red-600 font-bold">Akses ditolak. Anda bukan Admin.</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {isAlertVisible && (
                <SimpleToast 
                    message={systemMessage} 
                    theme={themeColor}
                    onClose={() => setIsAlertVisible(false)} 
                />
            )}
            
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2 flex items-center space-x-3">
                <SettingsIcon size={28} className={currentTheme.text} />
                <span>Pengaturan Aplikasi</span>
            </h1>

            <div className="text-sm mb-6 p-3 rounded-lg bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500">
                <p>Role saat ini: <span className="font-bold uppercase">{userRole.replace('_', ' ')}</span>. Ganti peran di kode untuk menguji fitur Super Admin.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Kolom 1: Pengaturan Tampilan */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg h-fit">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center space-x-2">
                        <Palette size={20} className={currentTheme.text} />
                        <span>Tema Tampilan</span>
                    </h2>
                    <p className="text-gray-600 mb-4">Pilih warna tema utama untuk aplikasi.</p>
                    
                    <div className="space-y-3">
                        {availableThemes.map((theme) => (
                            <button
                                key={theme.value}
                                onClick={() => handleThemeChange(theme.value)}
                                className={`w-full flex items-center justify-between p-3 rounded-lg font-semibold transition duration-150 border-2 ${
                                    themeColor === theme.value 
                                        ? `${theme.primary} text-white border-white ring-2 ring-offset-2 ring-opacity-50 ${theme.value === 'green' ? 'ring-green-500' : theme.value === 'blue' ? 'ring-blue-500' : theme.value === 'purple' ? 'ring-purple-500' : 'ring-orange-500'}`
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'
                                }`}
                            >
                                <span>{theme.name}</span>
                                <div className={`w-5 h-5 rounded-full ${theme.primary}`}></div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Kolom 2: Pengaturan Umum Cabang dan Super Admin */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center space-x-2">
                        <Users size={20} className={currentTheme.text} />
                        <span>Pengaturan Umum Cabang</span>
                    </h2>
                    
                    <form onSubmit={handleSaveGeneralSettings} className="space-y-6">
                        {/* Nama Cabang */}
                        <div>
                            <label htmlFor="branchName" className="block text-sm font-medium text-gray-700">Nama Cabang</label>
                            <input
                                id="branchName"
                                type="text"
                                value={branchName}
                                onChange={(e) => setBranchName(e.target.value)}
                                required
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-opacity-50 p-2 border"
                            />
                        </div>

                        {/* Pengaturan Notifikasi */}
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                            <label htmlFor="notifications" className="text-sm font-medium text-gray-700">
                                Aktifkan Notifikasi Stok Rendah
                            </label>
                            <button
                                type="button"
                                onClick={() => setNotificationSettings(prev => !prev)}
                                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                    notificationSettings ? currentTheme.primary.replace('bg-', 'focus:ring-') : 'bg-gray-200'
                                }`}
                            >
                                <span
                                    aria-hidden="true"
                                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                                        notificationSettings ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                ></span>
                            </button>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                className={`font-semibold py-2 px-6 rounded-lg shadow-md transition duration-200 text-white ${currentTheme.primary} ${currentTheme.hover}`}
                            >
                                Simpan Pengaturan Umum
                            </button>
                        </div>
                    </form>
                    
                    {/* Pengaturan Khusus Super Admin */}
                    {isSuperAdmin && (
                        <>
                            <div className="my-8 border-t border-dashed pt-6"></div>
                            <h2 className="text-xl font-semibold text-red-600 mb-4 border-b pb-2 flex items-center space-x-2">
                                <Shield size={20} />
                                <span>Pengaturan Sistem Lanjutan (Super Admin Only)</span>
                            </h2>
                            <form onSubmit={handleSaveSuperAdminSettings} className="space-y-6">
                                {/* Pesan Sistem Global */}
                                <div>
                                    <label htmlFor="systemMessage" className="block text-sm font-medium text-gray-700">Pesan Sistem Global (Banner)</label>
                                    <textarea
                                        id="systemMessage"
                                        value={systemMessage}
                                        onChange={(e) => setSystemMessage(e.target.value)}
                                        placeholder="Masukkan pesan penting yang akan ditampilkan di seluruh aplikasi..."
                                        rows="3"
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-500 focus:ring-opacity-50 p-2 border"
                                    />
                                </div>
                                
                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        className="font-semibold py-2 px-6 rounded-lg shadow-md transition duration-200 text-white bg-red-600 hover:bg-red-700"
                                    >
                                        Simpan Pengaturan Lanjutan
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;