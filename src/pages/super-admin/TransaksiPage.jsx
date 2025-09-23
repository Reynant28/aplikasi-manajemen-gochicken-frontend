import { useState, useMemo } from "react";

const transaksiData = [
  {
    id: 1,
    kode: "TRX001",
    tanggal: "2025-09-10 14:23",
    pelanggan: "Budi",
    metode: "DANA",
    items: [
      { nama: "Produk A", qty: 2, harga: 50000 },
      { nama: "Produk B", qty: 1, harga: 100000 },
    ],
  },
  {
    id: 2,
    kode: "TRX002",
    tanggal: "2025-09-11 09:15",
    pelanggan: "Siti",
    metode: "ShopeePay",
    items: [{ nama: "Produk C", qty: 3, harga: 75000 }],
  },
  {
    id: 3,
    kode: "TRX003",
    tanggal: "2025-09-12 18:40",
    pelanggan: "Andi",
    metode: "Transfer Bank",
    items: [
      { nama: "Produk D", qty: 1, harga: 200000 },
      { nama: "Produk E", qty: 2, harga: 120000 },
    ],
  },
];

const TransaksiPage = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [detailTransaksi, setDetailTransaksi] = useState(null);

  const filteredData = transaksiData.filter(
    (t) => !selectedDate || t.tanggal.startsWith(selectedDate)
  );

  const summary = useMemo(() => {
    const total = filteredData.reduce((sum, t) => {
      const totalItem = t.items.reduce(
        (subtotal, i) => subtotal + i.qty * i.harga,
        0
      );
      return sum + totalItem;
    }, 0);
    return {
      jumlahTransaksi: filteredData.length,
      totalPemasukan: total,
    };
  }, [filteredData]);

  return (
    <div className="p-6">
      {/* CSS untuk print */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            font-family: Arial, sans-serif;
          }
          .no-print {
            display: none !important;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            font-size: 12pt;
          }
          table th, table td {
            border: 1px solid #333;
            padding: 6px;
          }
        }
      `}</style>

      <div className="bg-white shadow-lg rounded-2xl p-6 no-print">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          📊 Laporan Transaksi
        </h1>

        {/* Filter tanggal */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Pilih Tanggal
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded-xl px-4 py-2 w-60 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700"
          />
        </div>

        {/* Tabel transaksi */}
        <div className="overflow-x-auto border rounded-xl shadow-sm">
          <table className="min-w-full border-collapse">
            <thead className="bg-blue-100">
              <tr>
                <th className="border px-4 py-3 text-left font-semibold text-blue-700">
                  Kode
                </th>
                <th className="border px-4 py-3 text-left font-semibold text-blue-700">
                  Tanggal & Waktu
                </th>
                <th className="border px-4 py-3 text-left font-semibold text-blue-700">
                  Nama Pelanggan
                </th>
                <th className="border px-4 py-3 text-left font-semibold text-blue-700">
                  Metode
                </th>
                <th className="border px-4 py-3 text-left font-semibold text-blue-700">
                  Total
                </th>
                <th className="border px-4 py-3 text-center font-semibold text-blue-700">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((t, i) => {
                  const total = t.items.reduce(
                    (sum, i) => sum + i.qty * i.harga,
                    0
                  );
                  return (
                    <tr
                      key={t.id}
                      className={`${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-blue-50 transition`}
                    >
                      <td className="border px-4 py-2 text-gray-600">
                        {t.kode}
                      </td>
                      <td className="border px-4 py-2 text-gray-600">
                        {t.tanggal}
                      </td>
                      <td className="border px-4 py-2 text-gray-700 font-medium">
                        {t.pelanggan}
                      </td>
                      <td className="border px-4 py-2 text-blue-600 font-semibold">
                        {t.metode}
                      </td>
                      <td className="border px-4 py-2 font-bold text-green-600">
                        Rp {total.toLocaleString()}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        <button
                          onClick={() => setDetailTransaksi(t)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-6 text-gray-500 border"
                  >
                    ❌ Tidak ada transaksi pada tanggal ini
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Ringkasan total */}
        {filteredData.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-gray-700">
              <span className="font-semibold text-blue-600">
                Jumlah Transaksi:
              </span>{" "}
              {summary.jumlahTransaksi}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold text-green-600">
                Total Pemasukan:
              </span>{" "}
              Rp {summary.totalPemasukan.toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Modal detail transaksi */}
      {detailTransaksi && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-[600px] overflow-hidden border border-gray-200 print-area">
            {/* Header */}
            <div className="p-6 border-b">
              <h2 className="text-lg font-bold text-gray-800">
                🐔 GoChicken Administrator
              </h2>
              <p className="text-sm text-gray-500">
                Detail Transaksi {detailTransaksi.kode}
              </p>
            </div>

            {/* Body */}
        <div className="p-6 space-y-4">
          {/* Info transaksi */}
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <p className="font-semibold text-gray-700">👤 Pelanggan:</p>
              <p className="text-gray-900">{detailTransaksi.pelanggan}</p>

              <p className="font-semibold text-gray-700">📅 Tanggal & Waktu:</p>
              <p className="text-gray-900">{detailTransaksi.tanggal}</p>

              <p className="font-semibold text-gray-700">💳 Metode Pembayaran:</p>
              <p className="text-gray-900">{detailTransaksi.metode}</p>
            </div>

          {/* Tabel Item */}
          <table className="w-full text-sm border mt-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-2 text-left text-gray-900">Produk</th>
                <th className="border px-3 py-2 text-center text-gray-900">Qty</th>
                <th className="border px-3 py-2 text-right text-gray-900">Harga</th>
                <th className="border px-3 py-2 text-right text-gray-900">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {detailTransaksi.items.map((i, idx) => (
                <tr key={idx}>
                  <td className="border px-3 py-2 text-gray-900">{i.nama}</td>
                  <td className="border px-3 py-2 text-center text-gray-900">{i.qty}</td>
                  <td className="border px-3 py-2 text-right text-gray-900">
                    Rp {i.harga.toLocaleString()}
                  </td>
                  <td className="border px-3 py-2 text-right text-gray-900">
                    Rp {(i.qty * i.harga).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Ringkasan */}
          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between text-gray-800">
              <span>Subtotal</span>
              <span>
                Rp{" "}
                {detailTransaksi.items
                  .reduce((a, b) => a + b.qty * b.harga, 0)
                  .toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between font-bold text-green-700 text-base">
              <span>Total</span>
              <span>
                Rp{" "}
                {detailTransaksi.items
                  .reduce((a, b) => a + b.qty * b.harga, 0)
                  .toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Sisa / Kembalian</span>
              <span>Rp 0</span>
            </div>
          </div>
        </div>
            {/* Footer */}
            <div className="flex justify-end gap-3 bg-gray-50 px-6 py-4 border-t no-print">
              <button
                onClick={() => window.print()}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow"
              >
                🖨️ Print Struk
              </button>
              <button
                onClick={() => setDetailTransaksi(null)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg shadow"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransaksiPage;
