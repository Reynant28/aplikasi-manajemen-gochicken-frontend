// src/components/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();
const NOTIFICATION_STORAGE_KEY = 'user_notifications'; 

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState(() => {
        try {
            const storedNotifs = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
            return storedNotifs ? JSON.parse(storedNotifs) : [];
        } catch (error) {
            console.error("Error reading notifications from Local Storage:", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
        } catch (error) {
            console.error("Error writing notifications to Local Storage:", error);
        }
    }, [notifications]);

    const formatTimestamp = () => {
        const now = new Date();
        const date = now.getDate().toString().padStart(2, '0');
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const year = now.getFullYear();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        
        return {
            fullDate: `${date}/${month}/${year}`,
            time: `${hours}.${minutes}`,
            fullDateTime: `${date}/${month}/${year} ${hours}.${minutes}`
        };
    };

    // 🔥 PERBAIKAN: Gunate useCallback untuk stabilisasi fungsi
    const addNotification = React.useCallback((message, type = 'info', page = '', action = '') => {
        const timestamp = formatTimestamp();
        const newNotification = {
            id: Date.now() + Math.random(), // 🔥 Pastikan ID unik
            message,
            type,
            page,
            action,
            date: timestamp.fullDate,
            time: timestamp.time,
            fullDateTime: timestamp.fullDateTime,
            timestamp: new Date().toISOString()
        };

        setNotifications(prevNotifs => {
            const updated = [newNotification, ...prevNotifs];
            // Batasi maksimal 50 notifikasi untuk performa
            return updated.slice(0, 50);
        });
    }, []);

    // 🔥 PERBAIKAN KUNCI: Pastikan removeNotification tidak menyebabkan re-render tidak perlu
    const removeNotification = React.useCallback((id) => {
        setNotifications(prev => {
            const filtered = prev.filter(notification => {
                // 🔥 Debug: Log untuk memastikan filtering bekerja
                if (notification.id === id) {
                    console.log('Removing notification:', id);
                    return false;
                }
                return true;
            });
            
            // 🔥 Cek jika benar-benar ada perubahan
            if (filtered.length === prev.length) {
                console.log('No notification found with id:', id);
                return prev; // Kembalikan array lama jika tidak ada perubahan
            }
            
            return filtered;
        });
    }, []);

    const clearNotifications = React.useCallback(() => {
        setNotifications([]);
    }, []);

    // 🔥 Nilai context yang stabil
    const contextValue = React.useMemo(() => ({
        notifications, 
        addNotification, 
        clearNotifications,
        removeNotification 
    }), [notifications, addNotification, clearNotifications, removeNotification]);

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
};