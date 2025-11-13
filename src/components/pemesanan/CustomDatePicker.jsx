// src/components/pemesanan/CustomDatePicker.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  getDay, 
  addMonths, 
  subMonths, 
  isSameDay, 
  isToday 
} from 'date-fns';
import { id } from 'date-fns/locale';

const CustomDatePicker = ({ selectedDate, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(selectedDate ? new Date(selectedDate) : new Date());
  
  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start, end });
  const startingDayIndex = getDay(start);
  
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }} 
      className="absolute top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-20 p-4 w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button 
          type="button" 
          onClick={prevMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft size={20} />
        </button>
        
        <p className="font-semibold text-sm text-gray-800">
          {format(currentDate, 'MMMM yyyy', { locale: id })}
        </p>
        
        <button 
          type="button" 
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-800"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 font-medium mb-2">
        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty days from previous month */}
        {Array.from({ length: startingDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="w-8 h-8"></div>
        ))}
        
        {/* Days of current month */}
        {days.map(day => {
          const isSelected = selectedDate && isSameDay(day, new Date(selectedDate));
          const isTodayDate = isToday(day);
          
          return (
            <button 
              type="button" 
              key={day.toString()} 
              onClick={() => onDateSelect(format(day, 'yyyy-MM-dd'))}
              className={`
                w-8 h-8 rounded-full text-sm transition-all duration-200 font-medium
                ${isSelected 
                  ? 'bg-gray-800 text-white shadow-md' 
                  : isTodayDate 
                    ? 'bg-gray-100 text-gray-800 border border-gray-300' 
                    : 'text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default CustomDatePicker;