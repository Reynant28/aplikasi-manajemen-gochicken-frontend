// src/components/Pengeluaran/PengeluaranControls.jsx
import React from "react";
import { Search, Calendar, FileDown, Loader2 } from "lucide-react";

export default function PengeluaranControls({ 
    searchTerm, setSearchTerm, 
    filterDate, setFilterDate, 
    handleExportPDF, exportLoading, 
    filteredDataLength, theme, 
    setCurrentPage 
}) {
    return (
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1 mb-6">
            {/* Search Input */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Cari keterangan, kategori, atau cabang..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    className={`border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 pl-10 w-full shadow-sm focus:ring-2 ${theme.focusRing} focus:outline-none text-gray-900 placeholder:text-gray-400 transition`}
                />
            </div>

            {/* Filter Tanggal */}
            <div className="relative w-full sm:w-auto date-input-container">
                <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${theme.primaryAccent} pointer-events-none`} />
                <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => {
                        setFilterDate(e.target.value);
                        setCurrentPage(1); 
                    }}
                    className={`border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 pl-10 w-full sm:w-48 shadow-sm focus:ring-2 ${theme.focusRing} focus:outline-none text-gray-900 transition`}
                />
            </div>

            {/* Export PDF Button */}
            <button 
                onClick={handleExportPDF} 
                disabled={exportLoading || filteredDataLength === 0}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${theme.buttonSoft} font-semibold transition-all duration-300 ${(exportLoading || filteredDataLength === 0) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
            >
                {exportLoading ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
                <span>Export PDF</span>
            </button>
        </div>
    );
}