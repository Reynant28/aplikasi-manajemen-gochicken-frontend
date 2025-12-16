// src/pages/PengeluaranPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Plus, 
    Loader2, 
    X, 
    Eye, 
    Calendar, 
    Search,
    FileDown,
    Layers,
    Building,
    ReceiptText
} from "lucide-react";
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useNotification } from "../../components/context/NotificationContext"; 
import { SuccessPopup, ConfirmDeletePopup } from "../../components/ui"; 

// 🆕 IMPOR KOMPONEN BARU
import PengeluaranHeader from "../../components/PengeluaranSuperAdmin/PengeluaranHeader";
import PengeluaranControls from "../../components/PengeluaranSuperAdmin/PengeluaranControls";
import PengeluaranTable from "../../components/PengeluaranSuperAdmin/PengeluaranTable";
import PengeluaranFormModal from "../../components/PengeluaranSuperAdmin/PengeluaranFormModal";
import PengeluaranDetailModal from "../../components/PengeluaranSuperAdmin/PengeluaranDetailModal";

const API_URL = "http://localhost:8000/api";

// --- Helper Formatter (DITINGGALKAN DI PAGE) ---
const formatRupiah = (value) => {
    if (!value && value !== 0) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(value);
};

const formatTanggal = (dateString) => {
    if (!dateString) return "-";
    try {
        return format(new Date(dateString), 'dd MMM yyyy', { locale: id });
    } catch (error) {
        return dateString;
    }
};
// --- AKHIR HELPER FORMATTER ---


const PengeluaranPage = () => {
    // --- Context & Auth ---
    const { addNotification } = useNotification();
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const role = user?.role || "super admin";

    // --- State Data ---
    const [pengeluaranList, setPengeluaranList] = useState([]);
    const [jenisList, setJenisList] = useState([]);
    const [bahanBakuList, setBahanBakuList] = useState([]);
    const [cabangList, setCabangList] = useState([]);

    // --- State UI ---
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [isPdfReady, setIsPdfReady] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDate, setSelectedDate] = useState(""); // unused, but kept for context

    // --- State Modals ---
    const [modalState, setModalState] = useState({ type: null, data: null });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // --- State Form ---
    const [formData, setFormData] = useState({ 
        id_cabang: "", 
        id_jenis: "", 
        tanggal: format(new Date(), 'yyyy-MM-dd'), 
        jumlah: "", 
        keterangan: "", 
        details: [] 
    });
    const [isCicilanHarian, setIsCicilanHarian] = useState(false);

    // 🔴 LOGIKA THEME
    const getThemeColors = (role) => {
        if (role === 'super admin') {
            return {
                name: 'super admin',
                bgGradient: 'from-orange-50 via-white to-orange-100',
                primaryText: 'text-orange-700',
                primaryAccent: 'text-orange-600',
                primaryBg: 'bg-orange-600',
                primaryHoverBg: 'hover:bg-orange-700',
                focusRing: 'focus:ring-orange-400',
                lightBg: 'bg-orange-50',
                buttonSoft: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
                pdfHeader: [234, 88, 12]
            };
        }
        return {
            name: 'admin cabang',
            bgGradient: 'from-red-50 via-white to-red-100',
            primaryText: 'text-red-700',
            primaryAccent: 'text-red-600',
            primaryBg: 'bg-red-600',
            primaryHoverBg: 'hover:bg-red-700',
            focusRing: 'focus:ring-red-400',
            lightBg: 'bg-red-50',
            buttonSoft: 'bg-red-100 text-red-700 hover:bg-red-200',
            pdfHeader: [220, 38, 38]
        };
    };
    const theme = getThemeColors(role);

    // 🔴 LOAD JS PDF CDN
    useEffect(() => {
        const loadScripts = async () => {
            if (window.jspdf && window.jspdf.jsPDF) { 
                setIsPdfReady(true); 
                return; 
            }
            try {
                const script1 = document.createElement("script");
                script1.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
                script1.async = true;
                document.body.appendChild(script1);
                await new Promise((resolve) => { script1.onload = resolve; });

                const script2 = document.createElement("script");
                script2.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js";
                script2.async = true;
                document.body.appendChild(script2);
                script2.onload = () => setIsPdfReady(true);
            } catch (e) { 
                console.error("PDF Lib Load Error", e); 
            }
        };
        loadScripts();
    }, []);

    // 🔴 FETCH DATA
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [resPengeluaran, resJenis, resBahan, resCabang] = await Promise.all([
                axios.get(`${API_URL}/pengeluaran`, { headers }),
                axios.get(`${API_URL}/jenis-pengeluaran`, { headers }),
                axios.get(`${API_URL}/bahan-baku`, { headers }),
                axios.get(`${API_URL}/cabang`, { headers }),
            ]);

            setPengeluaranList(resPengeluaran.data.data || []);
            setJenisList(resJenis.data.data || []);
            setBahanBakuList(resBahan.data.data || []);
            setCabangList(resCabang.data.data || []);
        } catch (err) {
            console.error(err);
            addNotification("Gagal memuat data dari server.", "error");
        } finally {
            setLoading(false);
        }
    }, [token, addNotification]);

    useEffect(() => { 
        fetchData(); 
    }, [fetchData]);

    // 🔴 FILTERING LOGIC
    const filteredData = useMemo(() => {
        return pengeluaranList.filter(item => {
            const matchesSearch = 
                item.keterangan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.jenis_pengeluaran?.jenis_pengeluaran?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.cabang?.nama_cabang?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDate = filterDate ? item.tanggal.startsWith(filterDate) : true;
            return matchesSearch && matchesDate;
        });
    }, [pengeluaranList, searchTerm, filterDate]);

    // 🔴 PDF EXPORT LOGIC
    const handleExportPDF = () => {
        if (!window.jspdf || !isPdfReady) { 
            alert("Library PDF sedang dimuat, silakan coba sesaat lagi."); 
            return; 
        }
        setExportLoading(true);
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'mm', 'a4');

        doc.setFillColor(...theme.pdfHeader);
        doc.rect(0, 0, 297, 35, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("LAPORAN PENGELUARAN", 148.5, 18, null, null, "center");
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const periodText = filterDate ? `Periode: ${formatTanggal(filterDate)}` : `Dicetak pada: ${format(new Date(), 'dd MMM yyyy HH:mm', { locale: id })}`;
        doc.text(periodText, 148.5, 26, null, null, "center");

        doc.setTextColor(0, 0, 0);

        const tableRows = filteredData.map((item, index) => [
            index + 1,
            formatTanggal(item.tanggal),
            item.jenis_pengeluaran?.jenis_pengeluaran || "-",
            item.keterangan || "-",
            item.cabang?.nama_cabang || "-",
            formatRupiah(item.jumlah)
        ]);

        doc.autoTable({
            head: [["No", "Tanggal", "Kategori", "Keterangan", "Cabang", "Jumlah"]],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 3, valign: 'middle', overflow: 'linebreak' },
            headStyles: { fillColor: theme.pdfHeader, textColor: 255, fontStyle: 'bold', halign: 'center' },
            columnStyles: {
                0: { cellWidth: 12, halign: 'center' },
                1: { cellWidth: 30 },
                2: { cellWidth: 40 },
                3: { cellWidth: 'auto' },
                4: { cellWidth: 35 },
                5: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
            },
            alternateRowStyles: { fillColor: [250, 250, 250] },
        });

        const finalY = doc.lastAutoTable.finalY + 10;
        const totalAmount = filteredData.reduce((sum, item) => sum + parseFloat(item.jumlah), 0);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`Total Keseluruhan: ${formatRupiah(totalAmount)}`, 282, finalY, null, null, "right");

        doc.save(`Laporan_Pengeluaran_${filterDate || 'All'}.pdf`);
        setExportLoading(false);
    };

    // --- Modal Actions ---
    const openModal = (type, data = null) => {
        setModalState({ type, data });
        if (type === 'add' || type === 'edit') {
            const initialDetails = data?.details?.map(d => ({
                id_bahan_baku: d.id_bahan_baku,
                jumlah_item: d.jumlah_item,
                harga_satuan: d.harga_satuan,
            })) || [];

            setFormData({
                id_jenis: data?.id_jenis || "",
                id_cabang: data?.id_cabang || "",
                tanggal: data ? format(new Date(data.tanggal), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
                keterangan: data?.keterangan || "",
                jumlah: data?.jumlah || "",
                details: initialDetails,
            });
            setIsCicilanHarian(data?.is_cicilan_harian === 1);
        }
    };

    const closeModal = () => {
        setModalState({ type: null, data: null });
        setFormData({ details: [] });
    };

    // --- CRUD Operations ---
    const handleSubmit = async (payload) => {
        setIsSubmitting(true);
        try {
            let res;
            const headers = { Authorization: `Bearer ${token}` };
            if (modalState.type === 'edit') {
                res = await axios.put(`${API_URL}/pengeluaran/${modalState.data.id_pengeluaran}`, payload, { headers });
            } else {
                res = await axios.post(`${API_URL}/pengeluaran`, payload, { headers });
            }
            setSuccessMessage(res.data.message || "Berhasil menyimpan data!");
            setShowSuccess(true);
            fetchData();
            closeModal();
        } catch (err) {
            addNotification(err.response?.data?.message || "Terjadi kesalahan saat menyimpan.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setIsSubmitting(true);
        setShowConfirm(false);
        try {
            await axios.delete(`${API_URL}/pengeluaran/${deleteId}`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setSuccessMessage("Pengeluaran berhasil dihapus.");
            setShowSuccess(true);
            fetchData();
        } catch (err) {
            addNotification("Gagal menghapus data.", "error");
        } finally {
            setIsSubmitting(false);
            setDeleteId(null);
        }
    };

    // --- Render Component ---
    return (
        <div className={`min-h-screen p-6 bg-gradient-to-br ${theme.bgGradient}`}>
            {/* Style for custom scrollbar & form inputs */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar{width:8px}.custom-scrollbar::-webkit-scrollbar-track{background:#f1f5f9;border-radius:4px}.custom-scrollbar::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px}.custom-scrollbar::-webkit-scrollbar-thumb:hover{background:#94a3b8} 
                .date-input-container input::-webkit-calendar-picker-indicator { opacity: 0; position: absolute; left:0; top:0; width:100%; height:100%; cursor: pointer; }
            `}</style>

            {/* 🆕 Header */}
            <PengeluaranHeader 
                openModal={openModal} 
                loading={loading} 
                theme={theme} 
            />

            {/* 🆕 Kontrol Kiri: Search, Date, Export */}
            <PengeluaranControls
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterDate={filterDate}
                setFilterDate={setFilterDate}
                handleExportPDF={handleExportPDF}
                exportLoading={exportLoading}
                filteredDataLength={filteredData.length}
                theme={theme}
                setCurrentPage={setCurrentPage}
            />

            {/* 🆕 Table Data */}
            <PengeluaranTable
                loading={loading}
                filteredData={filteredData}
                theme={theme}
                formatTanggal={formatTanggal}
                formatRupiah={formatRupiah}
                openModal={openModal}
                setDeleteId={setDeleteId}
                setShowConfirm={setShowConfirm}
            />

            {/* --- MODALS --- */}
            <PengeluaranFormModal 
                isOpen={modalState.type === 'add' || modalState.type === 'edit'} 
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
                theme={theme}
                formatRupiah={formatRupiah}
            />

            <PengeluaranDetailModal 
                isOpen={modalState.type === 'view'} 
                onClose={closeModal} 
                data={modalState.data} 
                theme={theme} 
                formatRupiah={formatRupiah}
                formatTanggal={formatTanggal}
            />
            
            <ConfirmDeletePopup 
                isOpen={showConfirm} 
                onClose={() => setShowConfirm(false)} 
                onConfirm={handleDelete} 
            />
            
            <SuccessPopup 
                isOpen={showSuccess} 
                onClose={() => setShowSuccess(false)} 
                title="Berhasil!" 
                message={successMessage} 
                type={user?.role} 
            />
        </div>
    );
};

export default PengeluaranPage;