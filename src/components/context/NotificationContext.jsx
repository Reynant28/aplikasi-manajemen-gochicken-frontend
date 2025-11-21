// src/components/context/NotificationContext.jsx (UPDATE INI)

import React, { createContext, useContext, useState, useEffect } from "react";

const NotificationContext = createContext();

// 💡 KEY untuk Local Storage
const NOTIFICATION_STORAGE_KEY = "user_notifications";

//eslint-disable-next-line react-refresh/only-export-components
export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  // 1. Inisialisasi state dengan data dari Local Storage
  const [notifications, setNotifications] = useState(() => {
    try {
      const storedNotifs = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      // Batasi jumlah notifikasi yang dimuat untuk performa (misalnya 15)
      return storedNotifs ? JSON.parse(storedNotifs).slice(0, 15) : [];
    } catch (error) {
      console.error("Error reading notifications from Local Storage:", error);
      return [];
    }
  });

  // 2. Simpan notifikasi ke Local Storage setiap kali berubah
  useEffect(() => {
    try {
      // Batasi notifikasi yang disimpan (misalnya 30 notifikasi terakhir)
      const notifsToStore = notifications.slice(0, 30);
      localStorage.setItem(
        NOTIFICATION_STORAGE_KEY,
        JSON.stringify(notifsToStore)
      );
    } catch (error) {
      console.error("Error writing notifications to Local Storage:", error);
    }
  }, [notifications]);

  // Fungsi untuk menambah notifikasi (tidak banyak berubah)
  const addNotification = (message, type = "info") => {
    const newNotification = {
      id: Date.now(),
      message,
      type, // 'success', 'error', 'info'
      timestamp: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Tambahkan notifikasi baru di awal array
    setNotifications((prevNotifs) => [newNotification, ...prevNotifs]);
  };

  // Fungsi untuk menghapus semua notifikasi
  const clearNotifications = () => {
    setNotifications([]);
    // Local Storage akan terhapus otomatis oleh useEffect di atas
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, clearNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
