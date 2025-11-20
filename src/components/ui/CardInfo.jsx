import React from "react";
import { motion } from "framer-motion";
import { Edit, Trash2, User, Phone, MapPin, DollarSign, Building2 } from "lucide-react";

const CardInfo = ({ 
  // Core props
  children,
  className = "",
  onClick,
  
  // Animation props
  index = 0,
  animateOnMount = false,
  hoverEffect = true,
  
  // Header props
  headerContent,
  avatarIcon = <User size={36} />,
  avatarBg = "bg-gray-700",
  title,
  subtitle,
  badge,
  badgeIcon = <Building2 size={12} />,
  
  // Content props
  items = [],
  
  // Action props
  actions = [],
  showActions = true,
  
  // Individual action handlers
  onEdit,
  onDelete,
  customActions,
}) => {
  // Default actions based on onEdit and onDelete
  const defaultActions = [];
  
  if (onEdit) {
    defaultActions.push({
      label: "Edit",
      icon: <Edit size={14} />,
      onClick: onEdit,
      className: "bg-gray-600 hover:bg-gray-700 text-white"
    });
  }
  
  if (onDelete) {
    defaultActions.push({
      label: "Hapus",
      icon: <Trash2 size={14} />,
      onClick: onDelete,
      className: "bg-red-500 hover:bg-red-600 text-white"
    });
  }

  // Combine default actions with custom actions
  const finalActions = customActions || defaultActions;

  return (
    <motion.div
      initial={animateOnMount ? { opacity: 0, y: 20 } : false}
      animate={animateOnMount ? { opacity: 1, y: 0 } : false}
      transition={animateOnMount ? { delay: index * 0.05 } : {}}
      whileHover={hoverEffect ? { y: -4 } : {}}
      onClick={onClick}
      className={`
        bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 
        overflow-hidden border border-gray-100 flex flex-col h-full
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Header Section */}
      {headerContent ? (
        <div className="flex-shrink-0">
          {headerContent}
        </div>
      ) : (
        (title || avatarIcon) && (
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 flex flex-col items-center flex-shrink-0">
            {avatarIcon && (
              <div className={`w-20 h-20 ${avatarBg} rounded-full flex items-center justify-center mb-3 shadow-lg`}>
                {avatarIcon}
              </div>
            )}
            {title && (
              <h3 className="text-xl font-bold text-gray-800 text-center">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-gray-600 text-sm mt-1 text-center">
                {subtitle}
              </p>
            )}
            {badge && (
              <div className="mt-2 px-3 py-1 bg-gray-700 bg-opacity-90 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                {badgeIcon}
                {badge}
              </div>
            )}
          </div>
        )
      )}

      {/* Content Section - This will grow to fill available space */}
      <div className="p-5 space-y-3 flex-1">
        {children}
        
        {items.map((item, idx) => (
          <div key={idx} className={`flex items-start gap-2 text-sm ${item.className || ''}`}>
            {item.icon && <div className="text-gray-400 mt-0.5 flex-shrink-0">{item.icon}</div>}
            <span className={`${item.textClassName || "text-gray-600"} break-words`}>{item.content}</span>
          </div>
        ))}
      </div>

      {/* Actions Section - Fixed at bottom */}
      {showActions && finalActions.length > 0 && (
        <div className="flex gap-2 p-4 bg-gray-50 border-t border-gray-100 flex-shrink-0">
          {finalActions.map((action, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
              className={`
                flex-1 text-xs px-3 py-2 rounded-lg transition font-medium 
                flex items-center justify-center gap-1
                ${action.className || 'bg-gray-600 hover:bg-gray-700 text-white'}
              `}
            >
              {action.icon} {action.label}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Helper component for common item types
CardInfo.Item = ({ icon, content, className = "" }) => (
  <div className={`flex items-start gap-2 text-sm ${className}`}>
    {icon && <div className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</div>}
    <span className="text-gray-600 break-words">{content}</span>
  </div>
);

export default CardInfo;