// src/pages/PengeluaranPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
//eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Loader2,
  X,
  Calendar,
  Tag,
  FileText,
  ShoppingBag,
  Wallet,
  XCircle,
  Divide,
  Calculator,
} from "lucide-react";
import axios from "axios";
import PengeluaranTable from "../../components/pengeluaran/PengeluaranTable";
import { format } from "date-fns";

const API_URL = "http://localhost:8000/api";

const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const PengeluaranPage = () => {
  // ... (previous state and functions remain the same until the FormModal component)
  const [pengeluaranList, setPengeluaranList] = useState([]);
  const [jenisList, setJenisList] = useState([]);
  const [bahanBakuList, setBahanBakuList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [cabangList, setCabangList] = useState([]);
  const [isCicilanHarian, setIsCicilanHarian] = useState(false);

  const [modalState, setModalState] = useState({ type: null, data: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ details: [] });

  const token = localStorage.getItem("token");
  const cabang = JSON.parse(localStorage.getItem("cabang"));
  const cabangId = cabang?.id_cabang;

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const getDaysInMonth = (dateString) => {
    if (!dateString) return 1;
    const date = new Date(dateString);
    if (isNaN(date)) return 1;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const days = new Date(year, month, 0).getDate();
    return days || 1;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resPengeluaran, resJenis, resBahan, resCabang] = await Promise.all(
        [
          axios.get(`${API_URL}/pengeluaran`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/jenis-pengeluaran`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/bahan-baku`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/cabang`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]
      );

      setPengeluaranList(resPengeluaran.data.data || []);
      setJenisList(resJenis.data.data || []);
      setBahanBakuList(resBahan.data.data || []);
      setCabangList(resCabang.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data esensial.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openModal = (type, data = null) => {
    setModalState({ type, data });
    if (type === "add" || type === "edit") {
      const initialDetails =
        data?.details?.map((d) => ({
          id_bahan_baku: d.id_bahan_baku,
          jumlah_item: d.jumlah_item,
          harga_satuan: d.harga_satuan,
        })) || [];

      setFormData({
        id_jenis: data?.id_jenis || "",
        id_cabang: data?.id_cabang || "",
        tanggal: data
          ? format(new Date(data.tanggal), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        keterangan: data?.keterangan || "",
        details: initialDetails,
        jumlah: data?.jumlah || 0,
      });
    }
  };

  const closeModal = () => setModalState({ type: null, data: null });

  const handleAddJenis = async (jenisPengeluaran) => {
    try {
      const res = await axios.post(
        `${API_URL}/jenis-pengeluaran`,
        { jenis_pengeluaran: jenisPengeluaran },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJenisList((prev) => [...prev, res.data.data]);
      setFormData((prev) => ({ ...prev, id_jenis: res.data.data.id_jenis }));
      showMessage("success", "Jenis pengeluaran baru berhasil ditambahkan!");
      return true;
    } catch (err) {
      showMessage(
        "error",
        err.response?.data?.errors?.jenis_pengeluaran[0] ||
          "Gagal menambah jenis baru."
      );
      return false;
    }
  };

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      const res =
        modalState.type === "edit"
          ? await axios.put(
              `${API_URL}/pengeluaran/${modalState.data.id_pengeluaran}`,
              payload,
              { headers: { Authorization: `Bearer ${token}` } }
            )
          : await axios.post(`${API_URL}/pengeluaran`, payload, {
              headers: { Authorization: `Bearer ${token}` },
            });
      showMessage("success", res.data.message);
      fetchData();
      closeModal();
    } catch (err) {
      showMessage("error", err.response?.data?.message || "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await axios.delete(
        `${API_URL}/pengeluaran/${modalState.data.id_pengeluaran}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showMessage("success", "Pengeluaran berhasil dihapus.");
      fetchData();
      closeModal();
      //eslint-disable-next-line no-unused-vars
    } catch (err) {
      showMessage("error", "Gagal menghapus data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (loading)
      return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-500">
          <Loader2 className="animate-spin h-8 w-8 mb-4 text-red-500" />
          <p>Memuat data pengeluaran...</p>
        </div>
      );

    if (error)
      return (
        <div className="flex flex-col items-center justify-center h-96 text-red-700 bg-red-50 rounded-lg">
          <XCircle className="h-10 w-10 mb-4" />
          <p className="font-semibold">Terjadi Kesalahan</p>
          <p>{error}</p>
        </div>
      );

    return (
      <PengeluaranTable
        pengeluaranList={pengeluaranList}
        onEdit={(d) => openModal("edit", d)}
        onDelete={(d) => openModal("delete", d)}
        onView={(d) => openModal("view", d)}
      />
    );
  };

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .date-input-container input::-webkit-calendar-picker-indicator { opacity: 0; cursor: pointer; }
      `}</style>

      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Manajemen Pengeluaran
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              Catat dan kelola semua pengeluaran untuk cabang
            </p>
          </div>
          <button
            onClick={() => openModal("add")}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition shadow-md font-semibold self-start sm:self-center"
          >
            <Plus size={18} /> Tambah Pengeluaran
          </button>
        </div>

        {/* Message Display */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-3 rounded-lg flex items-center gap-3 text-sm font-semibold ${
                message.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message.type === "success" ? "✓" : "✗"} {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {renderContent()}
        </div>
      </motion.div>

      {/* Form Modal */}
      <FormModal
        isOpen={modalState.type === "add" || modalState.type === "edit"}
        onClose={closeModal}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        formData={formData}
        setFormData={setFormData}
        jenisList={jenisList}
        isCicilanHarian={isCicilanHarian}
        setIsCicilanHarian={setIsCicilanHarian}
        bahanBakuList={bahanBakuList}
        cabangList={cabangList}
        selectedData={modalState.data}
        onAddJenis={handleAddJenis}
        cabangId={cabangId}
        getDaysInMonth={getDaysInMonth}
      />

      {/* Detail Modal */}
      <DetailModal
        isOpen={modalState.type === "view"}
        onClose={closeModal}
        data={modalState.data}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={modalState.type === "delete"}
        onClose={closeModal}
        onConfirm={handleDelete}
        data={modalState.data}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

// Form Modal Component - UPDATED LAYOUT
const FormModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  formData,
  setFormData,
  jenisList,
  bahanBakuList,
  cabangList,
  selectedData,
  isCicilanHarian,
  setIsCicilanHarian,
  onAddJenis,
  getDaysInMonth,
  //eslint-disable-next-line no-unused-vars
  cabangId,
}) => {
  const [displayJumlah, setDisplayJumlah] = useState("Rp 0");
  const [showAddJenis, setShowAddJenis] = useState(false);
  const [newJenis, setNewJenis] = useState("");
  const [isAddingJenis, setIsAddingJenis] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const isBahanBaku =
        jenisList.find((j) => j.id_jenis == formData.id_jenis)
          ?.jenis_pengeluaran === "Pembelian bahan baku";
      if (!isBahanBaku) {
        setDisplayJumlah(
          formatRupiah(formData.jumlah || 0).replace(/,00$/, "")
        );
      }
    }
  }, [isOpen, formData.id_jenis, formData.jumlah, jenisList]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAddJumlah = (amount) => {
    const currentJumlah =
      Number(String(formData.jumlah || "0").replace(/[^0-9]/g, "")) || 0;
    const newJumlah = currentJumlah + amount;
    setFormData((prev) => ({ ...prev, jumlah: newJumlah.toString() }));
    setDisplayJumlah(formatRupiah(newJumlah).replace(/,00$/, ""));
  };

  const handleJumlahChange = (e) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, "");
    setFormData((prev) => ({ ...prev, jumlah: numericValue }));
    setDisplayJumlah(
      numericValue ? formatRupiah(numericValue).replace(/,00$/, "") : ""
    );
  };

  const handleDetailChange = (index, e) => {
    const { name, value } = e.target;
    const updatedDetails = [...formData.details];
    const item = { ...updatedDetails[index], [name]: value };

    const selectedBahan = bahanBakuList.find(
      (b) => b.id_bahan_baku == item.id_bahan_baku
    );

    if (selectedBahan) {
      const hargaSatuan = parseFloat(selectedBahan.harga_satuan) || 0;
      const jumlah = parseFloat(item.jumlah_item) || 0;

      item.harga_satuan = hargaSatuan;
      item.subtotal = hargaSatuan * jumlah;
    }

    updatedDetails[index] = item;
    setFormData((prev) => ({ ...prev, details: updatedDetails }));
  };

  const addDetailItem = () =>
    setFormData((prev) => ({
      ...prev,
      details: [
        ...(prev.details || []),
        { id_bahan_baku: "", jumlah_item: 1, harga_satuan: "" },
      ],
    }));
  const removeDetailItem = (index) =>
    setFormData((prev) => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index),
    }));

  const totalDetails = useMemo(() => {
    if (!formData.details || !Array.isArray(formData.details)) return 0;
    return formData.details.reduce(
      (sum, item) => sum + Number(item.jumlah_item) * Number(item.harga_satuan),
      0
    );
  }, [formData.details]);

  const selectedJenis = useMemo(
    () => jenisList.find((j) => j.id_jenis == formData.id_jenis),
    [formData.id_jenis, jenisList]
  );
  const isPembelianBahanBaku =
    selectedJenis?.jenis_pengeluaran === "Pembelian bahan baku";

  // Calculate daily installment amount
  const dailyAmount = useMemo(() => {
    if (!isCicilanHarian || !formData.jumlah || !formData.tanggal) return 0;
    const daysInMonth = getDaysInMonth(formData.tanggal);
    const totalAmount = Number(formData.jumlah);
    return Math.round(totalAmount / daysInMonth);
  }, [isCicilanHarian, formData.jumlah, formData.tanggal, getDaysInMonth]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    let finalJumlah = isPembelianBahanBaku
      ? totalDetails
      : Number(formData.jumlah);

    const payload = {
      id_cabang: formData.id_cabang,
      id_jenis: formData.id_jenis,
      tanggal: formData.tanggal,
      keterangan: formData.keterangan,
      jumlah: finalJumlah,
      is_cicilan_harian: isCicilanHarian,
      details: isPembelianBahanBaku ? formData.details || [] : [],
    };
    onSubmit(payload);
  };

  const handleJenisSubmit = async () => {
    if (!newJenis) return;
    setIsAddingJenis(true);
    const success = await onAddJenis(newJenis);
    setIsAddingJenis(false);
    if (success) {
      setNewJenis("");
      setShowAddJenis(false);
    }
  };

  const quickAddValues = [1000, 10000, 100000, 1000000];

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
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          >
            <div className="p-6 border-b flex justify-between items-center flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-800">
                {selectedData ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
              </h2>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleFormSubmit}
              className="flex-1 overflow-y-auto custom-scrollbar"
            >
              <div className="p-6 space-y-4">
                {/* Basic Information - More Compact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cabang
                    </label>
                    <select
                      name="id_cabang"
                      value={formData.id_cabang || ""}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">Pilih Cabang...</option>
                      {cabangList.map((c) => (
                        <option key={c.id_cabang} value={c.id_cabang}>
                          {c.nama_cabang}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal
                    </label>
                    <div className="relative date-input-container">
                      <input
                        type="date"
                        name="tanggal"
                        value={formData.tanggal || ""}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                        required
                        disabled={isSubmitting}
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jenis Pengeluaran
                    </label>
                    <div className="flex gap-2">
                      <select
                        name="id_jenis"
                        value={formData.id_jenis || ""}
                        onChange={handleChange}
                        className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                        required
                        disabled={isSubmitting}
                      >
                        <option value="">Pilih Jenis...</option>
                        {jenisList.map((j) => (
                          <option key={j.id_jenis} value={j.id_jenis}>
                            {j.jenis_pengeluaran}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowAddJenis(true)}
                        className="p-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition flex items-center gap-2"
                      >
                        <Plus size={16} />
                        <span className="text-sm">Tambah</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Keterangan - Smaller Textarea */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keterangan
                  </label>
                  <textarea
                    name="keterangan"
                    value={formData.keterangan || ""}
                    onChange={handleChange}
                    rows="2"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 resize-none"
                    required
                    disabled={isSubmitting}
                    placeholder="Masukkan keterangan pengeluaran..."
                  ></textarea>
                </div>

                {/* Dynamic Content based on Jenis */}
                {isPembelianBahanBaku ? (
                  <div className="pt-2">
                    <h3 className="text-md font-semibold text-gray-800 mb-2">
                      Detail Pembelian Bahan Baku
                    </h3>
                    <div className="space-y-3">
                      {formData.details &&
                        formData.details.map((item, index) => (
                          <div
                            key={index}
                            className="p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="grid grid-cols-12 gap-x-3 gap-y-2 items-end">
                              <div className="col-span-12 sm:col-span-5">
                                <label className="text-xs font-medium text-gray-600">
                                  Bahan Baku
                                </label>
                                <select
                                  name="id_bahan_baku"
                                  value={item.id_bahan_baku}
                                  onChange={(e) => handleDetailChange(index, e)}
                                  className="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                                >
                                  <option value="">Pilih Bahan...</option>
                                  {bahanBakuList.map((b) => (
                                    <option
                                      key={b.id_bahan_baku}
                                      value={b.id_bahan_baku}
                                    >
                                      {b.nama_bahan}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-span-6 sm:col-span-2">
                                <label className="text-xs font-medium text-gray-600">
                                  Jumlah
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  name="jumlah_item"
                                  value={item.jumlah_item}
                                  onChange={(e) => handleDetailChange(index, e)}
                                  className="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                                  placeholder="10"
                                />
                              </div>
                              <div className="col-span-6 sm:col-span-4">
                                <label className="text-xs font-medium text-gray-600">
                                  Harga Satuan
                                </label>
                                <p className="w-full p-2 border border-gray-300 rounded-lg cursor-default text-sm text-gray-900 bg-gray-50">
                                  {bahanBakuList.find(
                                    (b) => b.id_bahan_baku == item.id_bahan_baku
                                  )?.harga_satuan
                                    ? formatRupiah(
                                        bahanBakuList.find(
                                          (b) =>
                                            b.id_bahan_baku ==
                                            item.id_bahan_baku
                                        ).harga_satuan
                                      )
                                    : "-"}
                                </p>
                              </div>
                              <div className="col-span-12 sm:col-span-1 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => removeDetailItem(index)}
                                  className="p-2 text-red-500 hover:bg-red-100 rounded-full transition"
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
                        className="w-full text-sm py-2 px-4 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition flex items-center justify-center gap-2"
                      >
                        <Plus size={16} />
                        Tambah Item Bahan Baku
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jumlah Pengeluaran
                      </label>
                      <input
                        type="text"
                        value={displayJumlah}
                        onChange={handleJumlahChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 text-lg font-semibold"
                        placeholder="Masukkan jumlah, e.g., 150000"
                        required={!isPembelianBahanBaku}
                        disabled={isSubmitting}
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {quickAddValues.map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleAddJumlah(value)}
                            className="px-3 py-1.5 text-xs font-semibold text-red-800 bg-red-100 rounded-lg hover:bg-red-200 transition flex items-center gap-1"
                          >
                            <Plus size={12} />
                            {new Intl.NumberFormat("id-ID").format(value)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* IMPROVED Cicilan Harian Section */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="checkbox"
                            id="cicilanHarian"
                            checked={isCicilanHarian}
                            onChange={(e) =>
                              setIsCicilanHarian(e.target.checked)
                            }
                            className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                          />
                          <label
                            htmlFor="cicilanHarian"
                            className="text-sm font-semibold text-gray-800 flex items-center gap-2"
                          >
                            <Divide size={16} className="text-blue-600" />
                            Cicilan Harian
                          </label>
                        </div>
                        {isCicilanHarian && (
                          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <Calculator size={12} />
                            Aktif
                          </div>
                        )}
                      </div>

                      {isCicilanHarian && (
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-600">
                            Total akan dibagi rata per hari dalam bulan{" "}
                            <strong>
                              {formData.tanggal
                                ? new Date(formData.tanggal).toLocaleDateString(
                                    "id-ID",
                                    { month: "long", year: "numeric" }
                                  )
                                : "terpilih"}
                            </strong>
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-white rounded-lg p-3 border border-blue-200">
                              <p className="text-xs text-gray-500">
                                Total Bulanan
                              </p>
                              <p className="font-bold text-gray-800 text-lg">
                                {displayJumlah}
                              </p>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-green-200">
                              <p className="text-xs text-gray-500">Per Hari</p>
                              <p className="font-bold text-green-600 text-lg">
                                {formatRupiah(dailyAmount)}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 text-center">
                            Berdasarkan {getDaysInMonth(formData.tanggal)} hari
                            dalam bulan ini
                          </p>
                        </div>
                      )}

                      {!isCicilanHarian && (
                        <p className="text-xs text-gray-500">
                          Centang untuk membagi pengeluaran menjadi cicilan
                          harian selama sebulan
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Total Display */}
                <div className="text-right pt-2 border-t border-gray-200">
                  <p className="text-gray-600 text-sm">Total Pengeluaran:</p>
                  <p className="text-2xl font-bold text-red-600">
                    {isPembelianBahanBaku
                      ? formatRupiah(totalDetails)
                      : displayJumlah}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 bg-gray-50 rounded-b-xl flex justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-semibold"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center justify-center px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:bg-red-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Pengeluaran"
                  )}
                </button>
              </div>
            </form>

            {/* Add Jenis Modal */}
            {showAddJenis && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                <div className="p-6 bg-white rounded-xl shadow-2xl border w-80">
                  <h4 className="font-semibold mb-3 text-gray-800">
                    Tambah Jenis Baru
                  </h4>
                  <input
                    value={newJenis}
                    onChange={(e) => setNewJenis(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 mb-3"
                    placeholder="e.g., Biaya Listrik"
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setShowAddJenis(false);
                        setNewJenis("");
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-semibold"
                      disabled={isAddingJenis}
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleJenisSubmit}
                      className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:bg-red-400"
                      disabled={isAddingJenis}
                    >
                      {isAddingJenis ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        "Simpan"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ... (DetailModal and DeleteModal components remain the same as previous version)
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
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-xl"
        >
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              Detail Pengeluaran
            </h2>
          </div>

          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <Tag size={14} />
                Jenis:{" "}
                <strong className="text-gray-800">
                  {data?.jenis_pengeluaran?.jenis_pengeluaran}
                </strong>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Calendar size={14} />
                Tanggal:{" "}
                <strong className="text-gray-800">
                  {data?.tanggal
                    ? format(new Date(data.tanggal), "d MMMM yyyy")
                    : "N/A"}
                </strong>
              </div>
            </div>

            <div>
              <p className="flex items-center gap-2 text-sm text-gray-500">
                <FileText size={14} /> Keterangan:
              </p>
              <p className="p-3 bg-gray-50 rounded-lg mt-1 text-gray-800">
                {data?.keterangan}
              </p>
            </div>

            {data?.details && data.details.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-md font-semibold mb-3 text-gray-800">
                  Rincian Pembelian Bahan Baku
                </h3>
                <div className="border rounded-lg overflow-hidden bg-white">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-600">
                          Bahan
                        </th>
                        <th className="px-4 py-2 text-center font-semibold text-gray-600">
                          Jumlah
                        </th>
                        <th className="px-4 py-2 text-right font-semibold text-gray-600">
                          Harga Satuan
                        </th>
                        <th className="px-4 py-2 text-right font-semibold text-gray-600">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.details.map((d) => (
                        <tr
                          key={d.id_detail_pengeluaran}
                          className="border-t text-gray-700 border-gray-200"
                        >
                          <td className="px-4 py-2">
                            {d.bahan_baku?.nama_bahan || "N/A"}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {d.jumlah_item}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {formatRupiah(d.harga_satuan)}
                          </td>
                          <td className="px-4 py-2 text-right font-semibold text-gray-800">
                            {formatRupiah(d.total_harga)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="pt-4 text-right">
              <p className="text-gray-600">Total Pengeluaran</p>
              <p className="text-3xl font-bold text-red-600">
                {formatRupiah(data?.jumlah)}
              </p>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-b-xl flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-3 text-gray-700 bg-white border rounded-lg hover:bg-gray-100 transition font-semibold"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const DeleteModal = ({ isOpen, onClose, onConfirm, data, isSubmitting }) => (
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
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center"
        >
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="text-red-600" size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Konfirmasi Hapus
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Yakin ingin menghapus pengeluaran{" "}
            <strong>"{data?.keterangan}"</strong> senilai{" "}
            <strong>{formatRupiah(data?.jumlah)}</strong>? Tindakan ini tidak
            dapat dibatalkan.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-semibold"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:bg-red-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Hapus"
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default PengeluaranPage;
