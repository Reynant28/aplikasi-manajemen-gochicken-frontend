// src/components/Button.jsx
const Button = ({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
}) => {
  const base =
    "px-4 py-2 rounded-lg flex items-center gap-2 transition font-medium";
  const variants = {
    primary: "bg-green-600 hover:bg-green-700 text-white shadow",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow",
    warning: "bg-yellow-500 hover:bg-yellow-600 text-white shadow",
    outline: "border text-gray-600 hover:bg-gray-100",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {children}
    </button>
  );
};

export default Button;
