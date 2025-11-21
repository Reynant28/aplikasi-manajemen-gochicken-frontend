// src/pages/PemesananPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
//eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  Loader2,
  X,
  AlertTriangle,
  RefreshCw,
  Eye,
  Tag,
  Calendar,
  FileText,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Smartphone,
  Laptop,
} from "lucide-react";
import axios from "axios";
import PemesananTable from "../../components/pemesanan/PemesananTable";
import Pagination from "../../components/reports/Pagination";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameDay,
  isToday,
} from "date-fns";
import { id } from "date-fns/locale";
import {
  mapPaymentMethodToDB,
  mapPaymentMethodToUI,
  PAYMENT_METHODS,
} from "../../components/utils/paymentUtils";

const API_URL = "http://localhost:8000/api";

const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const PemesananPage = () => {
  const [pemesananData, setPemesananData] = useState(null);
  const [produkList, setProdukList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [modalState, setModalState] = useState({ type: null, data: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [filter, setFilter] = useState({
    time: "bulan",
    status: "semua",
    source: "semua",
  });
  const [customDate, setCustomDate] = useState([null, null]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const token = localStorage.getItem("token");
  const cabang = JSON.parse(localStorage.getItem("cabang") || "null");
  const cabangId = cabang?.id_cabang;

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const fetchData = useCallback(
    async (page = 1) => {
      if (!cabangId) {
        setError("Data cabang tidak ditemukan.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      let params = {
        page,
        status: filter.status,
        source: filter.source,
      };
      const [startDate, endDate] = customDate;
      if (filter.time === "custom" && startDate && endDate) {
        params.start_date = format(new Date(startDate), "yyyy-MM-dd");
        params.end_date = format(new Date(endDate), "yyyy-MM-dd");
      } else if (filter.time !== "custom") {
        params.filter = filter.time;
      }

      try {
        const [resPemesanan, resProduk] = await Promise.all([
          axios.get(`${API_URL}/cabang/${cabangId}/pemesanan`, {
            headers: { Authorization: `Bearer ${token}` },
            params,
          }),
          axios.get(`${API_URL}/cabang/${cabangId}/produk`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setPemesananData(resPemesanan.data);
        setProdukList(resProduk.data.data || []);
        //eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Gagal mengambil data.");
      } finally {
        setLoading(false);
      }
    },
    [token, cabangId, filter, customDate]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDateSelect = (date, type) => {
    const [start, end] = customDate;
    let newDates;
    if (type === "start") {
      newDates = [date, end];
      setShowStartDatePicker(false);
    } else {
      newDates = [start, date];
      setShowEndDatePicker(false);
    }
    setCustomDate(newDates);
    if (newDates[0] && newDates[1]) {
      setFilter((prev) => ({ ...prev, time: "custom" }));
    }
  };

  const openModal = (type, data = null) => setModalState({ type, data });
  const closeModal = () => setModalState({ type: null, data: null });

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/pemesanan`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showMessage("success", res.data.message);
      fetchData(pemesananData?.current_page || 1);
      closeModal();
    } catch (err) {
      showMessage(
        "error",
        err.response?.data?.message || "Gagal membuat pesanan."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (payload) => {
    setIsSubmitting(true);
    try {
      const res = await axios.put(
        `${API_URL}/pemesanan/${modalState.data.id_transaksi}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showMessage("success", res.data.message);
      fetchData(pemesananData?.current_page || 1);
      closeModal();
    } catch (err) {
      showMessage(
        "error",
        err.response?.data?.message || "Gagal mengupdate pesanan."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await axios.delete(
        `${API_URL}/pemesanan/${modalState.data.id_transaksi}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showMessage("success", "Pemesanan berhasil dihapus.");
      fetchData(pemesananData?.current_page || 1);
      closeModal();
    } catch (err) {
      showMessage(
        "error",
        err.response?.data?.message || "Gagal menghapus pesanan."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if transaction is from Android using source field
  const isAndroidTransaction = (data) => {
    return data?.source === "android";
  };

  const renderContent = () => {
    if (loading)
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <RefreshCw className="animate-spin h-6 w-6 mr-3" /> Memuat...
        </div>
      );
    if (error)
      return (
        <div className="flex flex-col items-center justify-center h-64 text-red-600 bg-red-50 p-4 rounded-lg">
          <AlertTriangle className="h-8 w-8 mb-2" />
          {error}
        </div>
      );
    return (
      <PemesananTable
        data={pemesananData}
        onView={openModal.bind(this, "view")}
        onEdit={openModal.bind(this, "edit")}
        onDelete={openModal.bind(this, "delete")}
        isAndroidTransaction={isAndroidTransaction}
      />
    );
  };

  return (
    <>
      <style>{`.custom-scrollbar::-webkit-scrollbar{width:6px}.custom-scrollbar::-webkit-scrollbar-track{background:#f1f5f9;border-radius:10px}.custom-scrollbar::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:10px}.custom-scrollbar::-webkit-scrollbar-thumb:hover{background:#94a3b8}`}</style>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Manajemen Pemesanan
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              Kelola pesanan pelanggan khusus untuk cabang{" "}
              <strong>{cabang?.nama_cabang || "N/A"}</strong>
            </p>
          </div>
          <motion.button
            onClick={() => openModal("add")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-5 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-semibold self-start md:self-center"
          >
            <PlusCircle size={20} /> Buat Pesanan Baru
          </motion.button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-wrap items-center gap-x-6 gap-y-4">
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
            >
              <Filter size={16} /> <span>Filter Tampilan</span>
            </button>
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 w-80 bg-white rounded-lg shadow-xl border z-10 p-4 space-y-4"
                >
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Sumber Pesanan
                    </label>
                    <div className="flex bg-gray-100 p-1 rounded-lg mt-1">
                      <button
                        onClick={() =>
                          setFilter((prev) => ({ ...prev, source: "semua" }))
                        }
                        className={`flex-1 px-3 py-1 text-sm rounded-md flex items-center justify-center gap-1 ${
                          filter.source === "semua"
                            ? "bg-white text-red-600 shadow"
                            : "text-gray-600"
                        }`}
                      >
                        <Laptop size={12} /> Semua
                      </button>
                      <button
                        onClick={() =>
                          setFilter((prev) => ({ ...prev, source: "android" }))
                        }
                        className={`flex-1 px-3 py-1 text-sm rounded-md flex items-center justify-center gap-1 ${
                          filter.source === "android"
                            ? "bg-white text-red-600 shadow"
                            : "text-gray-600"
                        }`}
                      >
                        <Smartphone size={12} /> Android
                      </button>
                      <button
                        onClick={() =>
                          setFilter((prev) => ({ ...prev, source: "manual" }))
                        }
                        className={`flex-1 px-3 py-1 text-sm rounded-md flex items-center justify-center gap-1 ${
                          filter.source === "manual"
                            ? "bg-white text-red-600 shadow"
                            : "text-gray-600"
                        }`}
                      >
                        <Laptop size={12} /> Manual
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Waktu
                    </label>
                    <div className="flex bg-gray-100 p-1 rounded-lg mt-1">
                      <button
                        onClick={() => {
                          setFilter((prev) => ({ ...prev, time: "minggu" }));
                          setCustomDate([null, null]);
                        }}
                        className={`flex-1 px-3 py-1 text-sm rounded-md ${
                          filter.time === "minggu"
                            ? "bg-white text-red-600 shadow"
                            : "text-gray-600"
                        }`}
                      >
                        Minggu
                      </button>
                      <button
                        onClick={() => {
                          setFilter((prev) => ({ ...prev, time: "bulan" }));
                          setCustomDate([null, null]);
                        }}
                        className={`flex-1 px-3 py-1 text-sm rounded-md ${
                          filter.time === "bulan"
                            ? "bg-white text-red-600 shadow"
                            : "text-gray-600"
                        }`}
                      >
                        Bulan
                      </button>
                      <button
                        onClick={() => {
                          setFilter((prev) => ({ ...prev, time: "tahun" }));
                          setCustomDate([null, null]);
                        }}
                        className={`flex-1 px-3 py-1 text-sm rounded-md ${
                          filter.time === "tahun"
                            ? "bg-white text-red-600 shadow"
                            : "text-gray-600"
                        }`}
                      >
                        Tahun
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Status
                    </label>
                    <div className="flex bg-gray-100 p-1 rounded-lg mt-1">
                      <button
                        onClick={() =>
                          setFilter((prev) => ({ ...prev, status: "semua" }))
                        }
                        className={`flex-1 px-3 py-1 text-sm rounded-md ${
                          filter.status === "semua"
                            ? "bg-white text-red-600 shadow"
                            : "text-gray-600"
                        }`}
                      >
                        Semua
                      </button>
                      <button
                        onClick={() =>
                          setFilter((prev) => ({ ...prev, status: "OnLoan" }))
                        }
                        className={`flex-1 px-3 py-1 text-sm rounded-md ${
                          filter.status === "OnLoan"
                            ? "bg-white text-red-600 shadow"
                            : "text-gray-600"
                        }`}
                      >
                        OnLoan
                      </button>
                      <button
                        onClick={() =>
                          setFilter((prev) => ({ ...prev, status: "Selesai" }))
                        }
                        className={`flex-1 px-3 py-1 text-sm rounded-md ${
                          filter.status === "Selesai"
                            ? "bg-white text-red-600 shadow"
                            : "text-gray-600"
                        }`}
                      >
                        Selesai
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="text-sm font-semibold text-gray-600">
                      Tanggal Kustom
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => {
                          setShowStartDatePicker((p) => !p);
                          setShowEndDatePicker(false);
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-left text-gray-700"
                      >
                        {customDate[0]
                          ? format(new Date(customDate[0]), "d MMM yyyy")
                          : "Dari"}
                      </button>
                      <span>-</span>
                      <button
                        onClick={() => {
                          setShowEndDatePicker((p) => !p);
                          setShowStartDatePicker(false);
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-left text-gray-700"
                      >
                        {customDate[1]
                          ? format(new Date(customDate[1]), "d MMM yyyy")
                          : "Sampai"}
                      </button>
                    </div>
                    {showStartDatePicker && (
                      <CustomDatePicker
                        selectedDate={customDate[0]}
                        onDateSelect={(date) => handleDateSelect(date, "start")}
                      />
                    )}
                    {showEndDatePicker && (
                      <CustomDatePicker
                        selectedDate={customDate[1]}
                        onDateSelect={(date) => handleDateSelect(date, "end")}
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className={`fixed top-4 left-1/2 -translate-x-1/2 p-4 rounded-lg flex items-center gap-3 text-sm font-semibold shadow-lg z-[9999] ${
                message.type === "success"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
            >
              {message.type === "success" ? "✓" : "✗"} {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">
          {renderContent()}
        </div>

        {pemesananData && pemesananData.total > pemesananData.per_page && (
          <Pagination
            currentPage={pemesananData.current_page}
            totalPages={pemesananData.last_page}
            onPageChange={fetchData}
          />
        )}
      </motion.div>

      <AddEditModal
        isOpen={modalState.type === "add"}
        onClose={closeModal}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        produkList={produkList}
        cabangId={cabangId}
        mode="add"
      />

      <AddEditModal
        isOpen={modalState.type === "edit"}
        onClose={closeModal}
        onSubmit={handleUpdate}
        isSubmitting={isSubmitting}
        produkList={produkList}
        cabangId={cabangId}
        data={modalState.data}
        mode="edit"
        isAndroidTransaction={isAndroidTransaction(modalState.data)}
      />

      <DetailModal
        isOpen={modalState.type === "view"}
        onClose={closeModal}
        data={modalState.data}
      />

      <DeleteModal
        isOpen={modalState.type === "delete"}
        onClose={closeModal}
        onConfirm={handleDelete}
        data={modalState.data}
        isSubmitting={isSubmitting}
        isAndroidTransaction={isAndroidTransaction(modalState.data)}
      />
    </>
  );
};

const AddEditModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  produkList,
  cabangId,
  data,
  mode = "add",
  isAndroidTransaction = false,
}) => {
  const [formData, setFormData] = useState({
    nama_pelanggan: "",
    metode_pembayaran: "Cash",
    status_transaksi: "OnLoan",
    details: [{ id_produk: "", jumlah_produk: 1 }],
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && data) {
        setFormData({
          nama_pelanggan: data.nama_pelanggan || "",
          metode_pembayaran:
            mapPaymentMethodToUI(data.metode_pembayaran) || "Cash",
          status_transaksi: data.status_transaksi || "OnLoan",
          details: data.details?.map((detail) => ({
            id_produk: detail.id_produk || "",
            jumlah_produk: detail.jumlah_produk || 1,
          })) || [{ id_produk: "", jumlah_produk: 1 }],
        });
      } else {
        setFormData({
          nama_pelanggan: "",
          metode_pembayaran: "Cash",
          status_transaksi: "OnLoan",
          details: [{ id_produk: "", jumlah_produk: 1 }],
        });
      }
    }
  }, [isOpen, mode, data]);

  const totalHarga = useMemo(() => {
    return formData.details.reduce((sum, item) => {
      const produk = produkList.find((p) => p.id_produk == item.id_produk);
      return sum + (produk ? produk.harga * item.jumlah_produk : 0);
    }, 0);
  }, [formData.details, produkList]);

  const handleDetailChange = (index, e) => {
    const { name, value } = e.target;
    const newDetails = [...formData.details];
    if (name === "jumlah_produk" && Number(value) < 1) {
      newDetails[index][name] = "1";
    } else {
      newDetails[index][name] = value;
    }
    setFormData((prev) => ({ ...prev, details: newDetails }));
  };

  const addDetailItem = () =>
    setFormData((prev) => ({
      ...prev,
      details: [...prev.details, { id_produk: "", jumlah_produk: 1 }],
    }));

  const removeDetailItem = (index) =>
    setFormData((prev) => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index),
    }));

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      id_cabang: cabangId,
      total_harga: totalHarga,
      metode_pembayaran: mapPaymentMethodToDB(formData.metode_pembayaran),
    };

    if (mode === "edit" && isAndroidTransaction) {
      const androidPayload = {
        status_transaksi: formData.status_transaksi,
      };
      onSubmit(androidPayload);
    } else {
      onSubmit(payload);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          onMouseDown={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            onMouseDown={(e) => e.stopPropagation()}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative"
          >
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {mode === "edit" ? "Edit Pesanan" : "Buat Pesanan Baru"}
                </h2>
                {mode === "edit" && isAndroidTransaction && (
                  <p className="text-sm text-orange-600 flex items-center gap-1 mt-1">
                    <Smartphone size={14} />
                    Pesanan dari Android - hanya status yang dapat diubah
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={handleFormSubmit}
              className="max-h-[80vh] overflow-y-auto custom-scrollbar"
            >
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Pelanggan
                    </label>
                    <input
                      type="text"
                      value={formData.nama_pelanggan}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          nama_pelanggan: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 text-gray-900"
                      required={!isAndroidTransaction}
                      disabled={mode === "edit" && isAndroidTransaction}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Metode Pembayaran
                    </label>
                    <select
                      value={formData.metode_pembayaran}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          metode_pembayaran: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 text-gray-900"
                      required={!isAndroidTransaction}
                      disabled={mode === "edit" && isAndroidTransaction}
                    >
                      {PAYMENT_METHODS.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Transaksi
                  </label>
                  <select
                    value={formData.status_transaksi}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status_transaksi: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 text-gray-900"
                    required
                  >
                    <option value="OnLoan">On Loan</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>

                {!(mode === "edit" && isAndroidTransaction) && (
                  <div className="pt-2">
                    <h3 className="text-md font-semibold text-gray-800 mb-2">
                      Detail Pesanan
                    </h3>
                    <div className="space-y-3">
                      {formData.details.map((item, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-12 gap-x-3 gap-y-2 items-end">
                            <div className="col-span-12 sm:col-span-7">
                              <label className="text-xs font-medium text-gray-600">
                                Produk
                              </label>
                              <select
                                name="id_produk"
                                value={item.id_produk}
                                onChange={(e) => handleDetailChange(index, e)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 text-sm text-gray-900"
                                disabled={
                                  mode === "edit" && isAndroidTransaction
                                }
                              >
                                <option value="">Pilih Produk...</option>
                                {produkList.map((p) => (
                                  <option
                                    key={p.id_produk}
                                    value={p.id_produk}
                                    disabled={p.jumlah_stok <= 0}
                                  >
                                    {p.nama_produk} (Stok: {p.jumlah_stok})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-span-6 sm:col-span-4">
                              <label className="text-xs font-medium text-gray-600">
                                Jumlah
                              </label>
                              <input
                                type="number"
                                min="1"
                                name="jumlah_produk"
                                value={item.jumlah_produk}
                                onChange={(e) => handleDetailChange(index, e)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 text-sm text-gray-900"
                                placeholder="e.g., 2"
                                disabled={
                                  mode === "edit" && isAndroidTransaction
                                }
                              />
                            </div>
                            <div className="col-span-6 sm:col-span-1 flex justify-end">
                              <button
                                type="button"
                                onClick={() => removeDetailItem(index)}
                                className="p-2 text-red-500 hover:bg-red-100 rounded-full"
                                disabled={
                                  mode === "edit" && isAndroidTransaction
                                }
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addDetailItem}
                        className="w-full text-sm py-2 px-4 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200"
                        disabled={mode === "edit" && isAndroidTransaction}
                      >
                        + Tambah Produk
                      </button>
                    </div>
                  </div>
                )}

                <div className="text-right pt-2">
                  <p className="text-gray-600">Total Harga</p>
                  <p className="text-2xl font-bold text-gray-700">
                    {formatRupiah(totalHarga)}
                  </p>
                </div>
              </div>
              <div className="p-6 bg-gray-50 rounded-b-xl flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-lg hover:bg-gray-100"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center justify-center w-40 px-6 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:bg-red-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />{" "}
                      {mode === "edit" ? "Mengupdate..." : "Menyimpan..."}
                    </>
                  ) : mode === "edit" ? (
                    "Update Pesanan"
                  ) : (
                    "Simpan Pesanan"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const DetailModal = ({ isOpen, onClose, data }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        onMouseDown={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          onMouseDown={(e) => e.stopPropagation()}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg"
        >
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              Detail Pemesanan
            </h2>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <Tag size={14} /> Kode:{" "}
                <strong className="text-gray-800">
                  {data?.kode_transaksi}
                </strong>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Calendar size={14} /> Tanggal:{" "}
                <strong className="text-gray-800">
                  {data?.tanggal_waktu
                    ? format(
                        new Date(data.tanggal_waktu),
                        "d MMM yyyy, HH:mm",
                        { locale: id }
                      )
                    : "N/A"}
                </strong>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="text-md font-semibold mb-3 text-gray-800">
                Rincian Produk Dipesan
              </h3>
              <div className="border rounded-lg overflow-hidden bg-white">
                <table className="w-full text-sm text-gray-800">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-slate-600">
                        Produk
                      </th>
                      <th className="px-4 py-2 text-center font-semibold text-slate-600">
                        Jumlah
                      </th>
                      <th className="px-4 py-2 text-right font-semibold text-slate-600">
                        Harga Satuan
                      </th>
                      <th className="px-4 py-2 text-right font-semibold text-slate-600">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.details?.map((d) => (
                      <tr
                        key={d.id_detail_transaksi}
                        className="border-t border-slate-200"
                      >
                        <td className="px-4 py-2">
                          {d.produk?.nama_produk || "N/A"}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {d.jumlah_produk}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {formatRupiah(d.harga_item)}
                        </td>
                        <td className="px-4 py-2 text-right font-semibold text-gray-800">
                          {formatRupiah(d.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="pt-4 text-right">
              <p className="text-gray-600">Total Harga</p>
              <p className="text-3xl font-bold text-gray-700">
                {formatRupiah(data?.total_harga)}
              </p>
            </div>
          </div>
          <div className="p-6 bg-gray-50 rounded-b-xl flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-lg hover:bg-gray-100"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const DeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  data,
  isSubmitting,
  isAndroidTransaction = false,
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        onMouseDown={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          onMouseDown={(e) => e.stopPropagation()}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center"
        >
          <AlertTriangle className="mx-auto text-red-500 h-12 w-12 mb-4" />
          <h2 className="text-lg font-bold text-gray-800">Konfirmasi Hapus</h2>

          {isAndroidTransaction ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-orange-600 mb-4">
                <Smartphone size={20} />
                <p className="font-semibold">Pesanan dari Android</p>
              </div>
              <p className="text-sm text-gray-500 mt-2 mb-6">
                Transaksi dari aplikasi Android tidak dapat dihapus melalui
                website. Silakan gunakan aplikasi Android untuk mengelola
                transaksi ini.
              </p>
              <button
                onClick={onClose}
                className="w-full px-6 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Tutup
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mt-2 mb-6">
                Yakin ingin menghapus pesanan{" "}
                <strong>"{data?.kode_transaksi}"</strong>? Stok produk akan
                dikembalikan.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-lg hover:bg-gray-100"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  onClick={onConfirm}
                  className="flex items-center justify-center w-28 px-6 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:bg-red-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    "Hapus"
                  )}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const CustomDatePicker = ({ selectedDate, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(
    selectedDate ? new Date(selectedDate) : new Date()
  );
  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start, end });
  const startingDayIndex = getDay(start);
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute top-full mt-2 bg-white rounded-lg shadow-xl border z-20 p-4 w-full"
    >
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft size={20} />
        </button>
        <p className="font-semibold text-sm text-gray-800">
          {format(currentDate, "MMMM yyyy", { locale: id })}
        </p>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
        {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 mt-2">
        {Array.from({ length: startingDayIndex }).map((_, i) => (
          <div key={`empty-${i}`}></div>
        ))}
        {days.map((day) => {
          const isSelected =
            selectedDate && isSameDay(day, new Date(selectedDate));
          const isTodayDate = isToday(day);
          return (
            <button
              type="button"
              key={day.toString()}
              onClick={() => onDateSelect(format(day, "yyyy-MM-dd"))}
              className={`w-8 h-8 rounded-full text-sm transition-colors text-gray-700 ${
                isSelected ? "bg-red-600 text-white font-bold" : ""
              } ${
                !isSelected && isTodayDate ? "bg-red-100 text-red-700" : ""
              } ${!isSelected && !isTodayDate ? "hover:bg-gray-100" : ""}`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default PemesananPage;
