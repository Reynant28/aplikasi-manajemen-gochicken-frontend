// src/components/DailyReport/DailyReportDashboard.jsx
import React from "react";
import { BarChart, Package, TrendingDown, ChevronsUp, FileText } from "lucide-react";
import ReportCard from "./ReportCard"; // Import ReportCard yang baru
import { formatRupiah } from "../../utils/formatters"; // Asumsi Anda memiliki file utilitas ini

export default function DailyReportDashboard({ data, theme }) {
  // Asumsi formatRupiah dipindahkan ke file utilitas (atau di-pass sebagai prop jika tidak)
  const formatRupiahLocal = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value || 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
      <ReportCard
        title="Total Penjualan"
        value={formatRupiahLocal(data.penjualan_harian)}
        icon={<BarChart />}
        theme={theme}
      />
      <ReportCard
        title="Modal Bahan Baku"
        value={formatRupiahLocal(data.modal_bahan_baku)}
        icon={<Package />}
        theme={theme}
      />
      <ReportCard
        title="Pengeluaran Harian"
        value={formatRupiahLocal(data.pengeluaran_harian)}
        icon={<TrendingDown />}
        theme={theme}
      />
      <ReportCard
        title="Laba Harian"
        value={formatRupiahLocal(data.laba_harian)}
        icon={<ChevronsUp />}
        theme={theme}
      />
      <ReportCard
        title="Nett Income"
        value={formatRupiahLocal(data.nett_income)}
        icon={<FileText />}
        theme={theme}
      />
    </div>
  );
}