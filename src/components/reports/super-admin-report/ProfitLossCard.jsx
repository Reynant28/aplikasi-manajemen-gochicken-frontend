// src/components/ProfitLossCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const ProfitLossCard = ({ data, theme }) => {
    const { 
        totalRevenue, 
        totalCOGS, 
        grossProfit, 
        operationalCosts, 
        netProfit, 
        profitMargin 
    } = data;

    const formatRupiah = (value = 0) => {
        try {
            return new Intl.NumberFormat("id-ID", { 
                style: "currency", 
                currency: "IDR", 
                maximumFractionDigits: 0 
            }).format(value);
        } catch {
            return `Rp ${value}`;
        }
    };

    const isProfit = netProfit >= 0;

    return (
        <motion.div 
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-l-orange-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Analisis Laba/Rugi</h3>
                <DollarSign className={`w-6 h-6 ${isProfit ? 'text-green-500' : 'text-red-500'}`} />
            </div>

            <div className="space-y-3">
                {/* Pendapatan */}
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pendapatan Kotor:</span>
                    <span className="font-semibold text-gray-800">{formatRupiah(totalRevenue)}</span>
                </div>

                {/* HPP */}
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Harga Pokok Penjualan:</span>
                    <span className="font-semibold text-red-500">-{formatRupiah(totalCOGS)}</span>
                </div>

                {/* Garis pemisah */}
                <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Laba Kotor:</span>
                        <span className="font-semibold text-blue-600">{formatRupiah(grossProfit)}</span>
                    </div>
                </div>

                {/* Biaya Operasional */}
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Biaya Operasional:</span>
                    <span className="font-semibold text-orange-500">-{formatRupiah(operationalCosts)}</span>
                </div>

                {/* Garis pemisah akhir */}
                <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-lg font-bold text-gray-800">Laba Bersih:</span>
                        <div className="flex items-center">
                            {isProfit ? (
                                <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-red-500 mr-2" />
                            )}
                            <span className={`text-lg font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                {formatRupiah(netProfit)}
                            </span>
                        </div>
                    </div>
                    
                    {/* Profit Margin */}
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Margin Laba:</span>
                        <span className={`font-semibold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                            {profitMargin.toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProfitLossCard;