import React, { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";

const DashboardCard = ({ title, value, children }) => {
  const textRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Check if the text is overflowing its container
    if (textRef.current) {
      const isOverflowing =
        textRef.current.scrollWidth > textRef.current.clientWidth;
      setIsTruncated(isOverflowing);
    }
  }, [value]); // Rerun check when the value changes

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      </div>
      <div className="mt-2">
        {value && (
          <div className="relative flex items-center gap-2">
            {/* ✨ PERBAIKAN: Ukuran font diperkecil */}
            <p
              ref={textRef}
              className="text-xl sm:text-2xl font-bold text-gray-800 break-words truncate"
            >
              {value}
            </p>

            {/* ✨ PERBAIKAN: Ikon Info hanya muncul jika teks terpotong */}
            {isTruncated && (
              <div
                className="relative"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Info size={16} className="text-gray-400 cursor-pointer" />
                {showTooltip && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-gray-800 text-white text-xs rounded py-1 px-2 z-10 shadow-lg">
                    {value}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default DashboardCard;
