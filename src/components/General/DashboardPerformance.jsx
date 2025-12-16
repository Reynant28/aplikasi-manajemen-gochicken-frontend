import React from "react";
import { TrendingUp, TrendingDown, AlertCircle, Activity, Minus, CheckCircle } from "lucide-react";

const formatPercent = (val) => `${Math.abs(val).toFixed(1)}%`;

const DashboardPerformance = ({ 
    loading, 
    revenueCurrent = 0, 
    revenueLastMonth = 0, 
    productTrend = null 
}) => {
    
    // 1. Hitung Persentase Kenaikan/Penurunan Pendapatan
    let revenueDiffPercent = 0;
    let isRevenueUp = true;
    
    if (revenueLastMonth > 0) {
        revenueDiffPercent = ((revenueCurrent - revenueLastMonth) / revenueLastMonth) * 100;
        isRevenueUp = revenueDiffPercent >= 0;
    } else if (revenueCurrent > 0 && revenueLastMonth === 0) {
        revenueDiffPercent = 100; // Anggap naik 100% jika bulan lalu 0
        isRevenueUp = true;
    } else {
        isRevenueUp = false; // Kasus revenueCurrent 0
    }

    // 2. LOGIKA STATUS DINAMIS (Sesuai Request Kamu)
    // Default (Stabil / Biasa Saja)
    let statusSistem = {
        label: "Optimal",
        color: "bg-blue-100 text-blue-800",
    };

    if (revenueDiffPercent > 5) {
        // Jika Naik > 5%
        statusSistem = {
            label: "Penjualan Naik",
            color: "bg-green-100 text-green-800",
        };
    } else if (revenueDiffPercent < -5) {
        // Jika Turun < -5%
        statusSistem = {
            label: "Performa Menurun",
            color: "bg-red-100 text-red-800",
        };
    }

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-pulse h-full">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-10 bg-gray-100 rounded"></div>
                    <div className="h-10 bg-gray-100 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-full flex flex-col justify-between">
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity size={20} className="text-blue-600" />
                    Ringkasan Performa
                </h3>

                <div className="space-y-6">
                    {/* BAGIAN 1: Perbandingan Pendapatan */}
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Pendapatan vs Bulan Lalu</p>
                        <div className="flex items-center gap-3">
                            <span className={`text-2xl font-bold ${isRevenueUp ? 'text-gray-800' : 'text-gray-800'}`}>
                                {isRevenueUp ? 'Positif' : 'Negatif'}
                            </span>
                            
                            <div className={`px-2 py-1 rounded-lg text-sm font-medium flex items-center gap-1 
                                ${isRevenueUp 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                {isRevenueUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {formatPercent(revenueDiffPercent)}
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            {isRevenueUp 
                                ? "Performa bisnis sedang meningkat." 
                                : "Performa menurun dibanding bulan lalu."}
                        </p>
                    </div>

                    <hr className="border-gray-100" />

                    {/* BAGIAN 2: Insight Produk */}
                    <div>
                        <p className="text-sm text-gray-500 mb-2">Insight Produk</p>
                        
                        {productTrend ? (
                            <div className={`p-3 rounded-xl border ${productTrend.status === 'declining' ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'}`}>
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-full ${productTrend.status === 'declining' ? 'bg-white text-orange-600' : 'bg-white text-blue-600'}`}>
                                        {productTrend.status === 'declining' ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{productTrend.name}</p>
                                        <p className={`text-xs mt-0.5 font-medium ${productTrend.status === 'declining' ? 'text-orange-700' : 'text-blue-700'}`}>
                                            {productTrend.status === 'declining' 
                                                ? `Peminat turun ${Math.abs(productTrend.change)}% minggu ini` 
                                                : `Peminat naik ${productTrend.change}% minggu ini`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <AlertCircle size={16} />
                                <span className="text-sm">Data tren produk stabil</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Status Sistem (DINAMIS) */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-400">Status Sistem</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${statusSistem.color}`}>
                    {statusSistem.label}
                </span>
            </div>
        </div>
    );
};

export default DashboardPerformance;