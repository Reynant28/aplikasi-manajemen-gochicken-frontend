// utils/paymentUtils.js
import { Wallet, QrCode, CreditCard, Banknote } from "lucide-react";

// All available payment methods (matching Android dropdown)
export const PAYMENT_METHODS = [
  "Cash",
  "Transfer Bank",
  "QRIS",
  "Debit Card",
  "Credit Card",
];

// Map database payment methods to UI names
export const mapPaymentMethodToUI = (dbMethod) => {
  switch (dbMethod?.toLowerCase()) {
    case "cash":
      return "Cash";
    case "transfer":
      return "Transfer Bank";
    case "transfer bank":
      return "Transfer Bank";
    case "e-wallet":
      return "QRIS";
    case "qris":
      return "QRIS";
    case "debit":
      return "Debit Card";
    case "debit card":
      return "Debit Card";
    case "credit card":
      return "Credit Card";
    default:
      return dbMethod || "Cash";
  }
};

// Map UI payment methods to database format
export const mapPaymentMethodToDB = (uiMethod) => {
  switch (uiMethod?.toLowerCase()) {
    case "cash":
      return "Cash";
    case "transfer bank":
      return "Transfer Bank";
    case "debit card":
      return "Debit Card";
    case "credit card":
      return "Credit Card";
    case "qris":
      return "QRIS";
    default:
      return uiMethod || "Cash";
  }
};

// Get payment method icon
export const getPaymentIcon = (method) => {
  const uiMethod = mapPaymentMethodToUI(method);
  switch (uiMethod?.toLowerCase()) {
    case "cash":
      return <Wallet size={16} className="text-gray-500 mr-2" />;
    case "transfer bank":
      return <Banknote size={16} className="text-gray-500 mr-2" />;
    case "debit card":
      return <CreditCard size={16} className="text-gray-500 mr-2" />;
    case "credit card":
      return <CreditCard size={16} className="text-gray-500 mr-2" />;
    case "qris":
      return <QrCode size={16} className="text-gray-500 mr-2" />;
    default:
      return <Wallet size={16} className="text-gray-500 mr-2" />;
  }
};

// Process revenue breakdown to combine and map payment methods
export const processRevenueBreakdown = (rawData) => {
  const breakdownMap = new Map();

  // Initialize with all payment methods set to 0
  PAYMENT_METHODS.forEach((method) => {
    breakdownMap.set(method, 0);
  });

  // Accumulate amounts from raw data
  rawData.forEach((item) => {
    const uiMethod = mapPaymentMethodToUI(item.metode_pembayaran);
    const currentTotal = breakdownMap.get(uiMethod) || 0;
    breakdownMap.set(uiMethod, currentTotal + parseFloat(item.total));
  });

  // Convert map to array and filter out methods with 0 value if needed
  return Array.from(breakdownMap.entries())
    .map(([metode_pembayaran, total]) => ({
      metode_pembayaran,
      total,
    }))
    .filter((item) => item.total > 0); // Only show methods with actual revenue
};
