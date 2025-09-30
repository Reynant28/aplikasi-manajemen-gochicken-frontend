import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, X, CheckCircle } from 'lucide-react';

// Data Awal Bahan (Pemasok dihapus)
const initialBahan = [
  { id: 1, nama: 'Tepung Terigu Segitiga Biru', stok: 150, satuan: 'Kg', hargaBeli: 12500 },
  { id: 2, nama: 'Gula Pasir Kristal Putih', stok: 75, satuan: 'Kg', hargaBeli: 14000 },
  { id: 3, nama: 'Mentega Wijsman', stok: 30, satuan: 'Pcs', hargaBeli: 45000 },
  { id: 4, nama: 'Cokelat Bubuk Delfi', stok: 45, satuan: 'Kg', hargaBeli: 78000 },
];

// --- Komponen Notifikasi Toast (Popup) ---
const ToastNotification = ({ message, onClose }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // 3 detik countdown

    const interval = setInterval(() => {
      setProgress(prev => (prev > 0 ? prev - (100 / 60) : 0)); // Update progress bar
    }, 50);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [onClose]);

  return (
    <div className="fixed top-5 right-5 z-50">
      <div className="bg-green-600 p-4 rounded-lg shadow-2xl text-white flex items-center space-x-3 transition-transform duration-300 ease-out transform translate-y-0">
        <CheckCircle size={24} />
        <div>
          <p className="font-semibold">{message}</p>
        </div>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-green-700">
          <X size={16} />
        </button>
        <div className="absolute bottom-0 left-0 h-1 w-full overflow-hidden rounded-b-lg">
          {/* Progress Bar */}
          <div className={`h-full bg-green-300 transition-all duration-50`} style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </div>
  );
};

const BahanPage = () => {
  const [bahanList, setBahanList] = useState(initialBahan);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nama: '', stok: '', satuan: '', hargaBeli: '' });
  const [alert, setAlert] = useState(null); // { message }

  // --- Logika Notifikasi ---
  const showAlert = (message) => {
    setAlert({ message });
    // ToastNotification memiliki internal timer 3 detik
  };
  const closeAlert = () => setAlert(null);

  // --- Logika Modal dan Form ---
  const openModalForAdd = () => {
    setEditingId(null);
    setFormData({ nama: '', stok: '', satuan: '', hargaBeli: '' });
    setIsModalOpen(true);
  };

  const openModalForEdit = (bahan) => {
    setEditingId(bahan.id);
    setFormData(bahan);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newBahan = {
      ...formData,
      stok: parseInt(formData.stok) || 0,
      hargaBeli: parseInt(formData.hargaBeli) || 0,
    };

    if (editingId) {
      // Logika Edit
      setBahanList(prev => prev.map(b => (b.id === editingId ? { ...newBahan, id: editingId } : b)));
      showAlert("Data Bahan berhasil diubah!");
    } else {
      // Logika Tambah
      const newId = Math.max(...bahanList.map(b => b.id), 0) + 1;
      setBahanList(prev => [...prev, { ...newBahan, id: newId }]);
      showAlert("Data Bahan baru berhasil ditambahkan!");
    }

    setIsModalOpen(false);
  };

  // --- Logika Hapus ---
  const handleDelete = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus bahan ini?")) {
      setBahanList(prev => prev.filter(b => b.id !== id));
      showAlert("Data Bahan berhasil dihapus.");
    }
  };

  // --- Komponen Modal (Add/Edit Form) ---
  const Modal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-opacity-70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Bahan Baku' : 'Tambah Bahan Baku Baru'}</h2>
          <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Bahan */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Bahan</label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 transition duration-150 p-2 border"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {/* Stok */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Stok</label>
              <input
                type="number"
                name="stok"
                value={formData.stok}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 p-2 border"
              />
            </div>

            {/* Satuan */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Satuan</label>
              <input
                type="text"
                name="satuan"
                value={formData.satuan}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 p-2 border"
              />
            </div>
            
            {/* Harga Beli */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Harga Beli (Rp)</label>
              <input
                type="number"
                name="hargaBeli"
                value={formData.hargaBeli}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 p-2 border"
              />
            </div>
          </div>

          {/* Tombol Submit */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
            >
              {editingId ? 'Simpan Perubahan' : 'Tambah Bahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Notifikasi Toast */}
      {alert && <ToastNotification message={alert.message} onClose={closeAlert} />}
      
      {/* Modal */}
      {isModalOpen && <Modal />}

      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Daftar Bahan Baku</h1>

      {/* Header dan Tombol Tambah */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">Manajemen stok dan harga bahan baku.</p>
        <button
          onClick={openModalForAdd}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 transform hover:scale-[1.02]"
        >
          <PlusCircle size={20} />
          <span>Tambah Bahan Baru</span>
        </button>
      </div>

      {/* Kontainer Tabel dengan Shadow dan Rounded Corner */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Bahan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Beli (Per Satuan)</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bahanList.map((bahan) => (
                <tr key={bahan.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bahan.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{bahan.nama}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      bahan.stok < 50 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {bahan.stok} {bahan.satuan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(bahan.hargaBeli)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex justify-center space-x-2">
                      {/* Tombol Edit */}
                      <button
                        onClick={() => openModalForEdit(bahan)}
                        className="text-green-600 hover:text-green-900 p-2 rounded-full hover:bg-green-100 transition"
                        title="Edit Bahan"
                      >
                        <Edit size={16} />
                      </button>
                      {/* Tombol Hapus */}
                      <button
                        onClick={() => handleDelete(bahan.id)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 transition"
                        title="Hapus Bahan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BahanPage;