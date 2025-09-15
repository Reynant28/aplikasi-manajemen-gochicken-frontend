// src/components/DashboardLayout.jsx

import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import { Outlet } from 'react-router-dom'; // <-- Import Outlet

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {/* Konten halaman akan dirender di sini */}
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;