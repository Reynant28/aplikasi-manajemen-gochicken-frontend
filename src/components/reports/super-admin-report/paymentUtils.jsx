// utils/paymentUtils.js
import { Wallet, QrCode, CreditCard } from 'lucide-react';

// Map database payment methods to UI names
export const mapPaymentMethodToUI = (dbMethod) => {
    switch (dbMethod?.toLowerCase()) {
        case 'cash': return 'Tunai';
        case 'transfer': return 'Debit';
        case 'e-wallet': return 'QRIS';
        default: return dbMethod;
    }
};

// Get payment method icon
export const getPaymentIcon = (method) => {
    const uiMethod = mapPaymentMethodToUI(method);
    switch (uiMethod?.toLowerCase()) {
        case 'tunai': return <Wallet size={14} className="mr-2" />;
        case 'debit': return <CreditCard size={14} className="mr-2" />;
        case 'qris': return <QrCode size={14} className="mr-2" />;
        default: return <Wallet size={14} className="mr-2" />;
    }
};

// Map UI payment methods back to database names (if needed)
export const mapPaymentMethodToDB = (uiMethod) => {
    switch (uiMethod?.toLowerCase()) {
        case 'tunai': return 'Cash';
        case 'debit': return 'Transfer';
        case 'qris': return 'E-Wallet';
        default: return uiMethod;
    }
};