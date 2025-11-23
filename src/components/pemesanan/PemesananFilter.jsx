// src/components/pemesanan/PemesananFilter.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';


const PemesananFilter = ({ filter, setFilter }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const handleDateSelect = (date, type) => {
    const [start, end] = customDate;
    let newDates;
    
    if (type === 'start') {
      newDates = [date, end];
      setShowStartDatePicker(false);
    } else {
      newDates = [start, date];
      setShowEndDatePicker(false);
    }
    
    setCustomDate(newDates);
    if (newDates[0] && newDates[1]) {
      setFilter(prev => ({ ...prev, time: 'custom' }));
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap items-center gap-x-6 gap-y-4">
      <div className="relative">
        <button 
          onClick={() => setIsFilterOpen(prev => !prev)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-all duration-200 border border-gray-300"
        >
          <Filter size={16}/> 
          <span>Filter Tampilan</span>
        </button>
        
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 10 }} 
              className="absolute top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-10 p-4 space-y-4"
            >
              {/* Time Filter */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Waktu
                </label>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  {['minggu', 'bulan', 'tahun'].map((time) => (
                    <button
                      key={time}
                      onClick={() => {
                        setFilter(prev => ({...prev, time }));
                        setCustomDate([null, null]);
                      }}
                      className={`flex-1 px-3 py-1 text-sm rounded-md transition-all ${
                        filter.time === time 
                          ? 'bg-gray-700 text-white shadow' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      {time.charAt(0).toUpperCase() + time.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Status
                </label>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  {['semua', 'OnLoan', 'Selesai'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilter(prev => ({...prev, status }))}
                      className={`flex-1 px-3 py-1 text-sm rounded-md transition-all ${
                        filter.status === status 
                          ? 'bg-gray-700 text-white shadow' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      {status === 'OnLoan' ? 'On Loan' : 
                       status === 'semua' ? 'Semua' : status}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PemesananFilter;