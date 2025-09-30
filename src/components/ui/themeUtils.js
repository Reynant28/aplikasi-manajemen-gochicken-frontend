// Daftar Tema Warna yang Tersedia
export const availableThemes = [
    { name: 'Hijau (Standar)', value: 'green', primary: 'bg-green-600', hover: 'hover:bg-green-700', text: 'text-green-600', gradient: 'from-green-500 to-green-600', stroke: '#10b981' },
    { name: 'Biru', value: 'blue', primary: 'bg-blue-600', hover: 'hover:bg-blue-700', text: 'text-blue-900', gradient: 'from-blue-500 to-blue-600', stroke: '#3b82f6' },
    { name: 'Ungu', value: 'purple', primary: 'bg-purple-600', hover: 'hover:bg-purple-700', text: 'text-purple-900', gradient: 'from-purple-500 to-purple-600', stroke: '#9333ea' },
    { name: 'Jingga', value: 'orange', primary: 'bg-orange-600', hover: 'hover:bg-orange-700', text: 'text-orange-900', gradient: 'from-amber-500 to-amber-600', stroke: '#f59e0b' },
];

// Fungsi untuk mendapatkan data tema dari localStorage
export const getThemeClasses = () => {
    // 1. Ambil nilai tema dari localStorage (default: 'green')
    const savedThemeValue = localStorage.getItem('appTheme') || 'green';
    
    // 2. Cari objek tema yang sesuai
    const theme = availableThemes.find(t => t.value === savedThemeValue);

    // 3. Jika tidak ditemukan (error), kembalikan tema Hijau (indeks 0)
    return theme || availableThemes[0];
};

// Fungsi untuk menyimpan tema (digunakan di SettingsPage)
export const saveThemeToStorage = (themeValue) => {
    localStorage.setItem('appTheme', themeValue);
};