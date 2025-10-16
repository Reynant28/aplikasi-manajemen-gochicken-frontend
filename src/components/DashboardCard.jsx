// src/components/DashboardCard.jsx

import { MoreHorizontal } from 'lucide-react';

const DashboardCard = ({ title, value, children }) => {
  
  // Deteksi apakah nilainya adalah teks panjang (seperti nama produk atau hari)
  const isLongText = typeof value === 'string' && value.length > 15 && !value.startsWith('Rp');

  return (
    // PENYESUAIAN PADDING CARD: Mengubah p-4 sm:p-5 menjadi p-3 sm:p-4
    <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200">
      <div className="flex justify-between items-start">
        <h3 className="text-xs sm:text-sm font-medium text-gray-900">{title}</h3> 
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal size={18} /> {/* Mengurangi ukuran ikon sedikit */}
        </button>
      </div>
      <div className="mt-2">
        {value && (
          // PENYESUAIAN UKURAN FONT UTAMA (VALUE): Ukuran font dikecilkan lagi
          <p className={`font-bold text-green-600 break-words 
            ${isLongText 
              ? 'text-base sm:text-lg' // Teks panjang: Dari lg/xl menjadi base/lg
              : 'text-lg sm:text-xl lg:text-2xl' // Angka/Rupiah: Dari xl/2xl/3xl menjadi lg/xl/2xl
            }`}
          >
            {value}
          </p>
        )}
        {children}
      </div>
    </div>
  );
};

export default DashboardCard;