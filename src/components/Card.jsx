// src/components/Card.jsx
/* eslint-disable react/prop-types */
const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white shadow-lg rounded-xl p-6 border-t-4 border-green-600 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
