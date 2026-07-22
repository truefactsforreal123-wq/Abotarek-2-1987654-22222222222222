"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import {
  Plus,
  Power,
  PowerOff,
  X,
  RefreshCw,
  Printer,
  Eye,
  Hash,
  Download,
} from "lucide-react";
import {
  createTable,
  toggleTableActive,
  regenerateTableToken,
  generateTables,
} from "@/lib/actions";
import { useAdminI18n } from "@/lib/admin-i18n";

type TableWithBranch = {
  id: string;
  tableNumber: number;
  qrToken: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  branchId: number;
  branch: {
    id: number;
    number: string;
    nameAr: string;
    nameEn: string;
    addressAr: string;
    addressEn: string;
    phone: string;
    whatsapp: string;
    mapsUrl: string;
    createdAt: Date;
    updatedAt: Date;
  };
  orders: { id: string }[];
};

type Branch = {
  id: number;
  number: string;
  nameAr: string;
  nameEn: string;
  addressAr: string;
  addressEn: string;
  phone: string;
  whatsapp: string;
  mapsUrl: string;
  createdAt: Date;
  updatedAt: Date;
};

function qrUrl(origin: string, tableNumber: number, token: string) {
  return `${origin}/table/${tableNumber}?token=${token}`;
}

export function TablesManagerClient({
  tables,
  branches,
}: {
  tables: TableWithBranch[];
  branches: Branch[];
}) {
  const router = useRouter();
  const [selectedBranch, setSelectedBranch] = useState(branches[0]?.id ?? 0);
  const [showAdd, setShowAdd] = useState(false);
  const [addMode, setAddMode] = useState<"single" | "batch">("single");
  const [newTableNum, setNewTableNum] = useState("");
  const [batchStart, setBatchStart] = useState("");
  const [batchCount, setBatchCount] = useState("5");
  const [acting, setActing] = useState<string | null>(null);
  const [qrModal, setQrModal] = useState<TableWithBranch | null>(null);
  const { lang, t } = useAdminI18n();

  const filtered = tables.filter((t) => t.branchId === selectedBranch);
  const activeBranch = branches.find((b) => b.id === selectedBranch);
  const nextTableNum =
    filtered.length > 0
      ? Math.max(...filtered.map((t) => t.tableNumber)) + 1
      : 1;

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";

  async function handleCreate() {
    const num = parseInt(newTableNum);
    if (!num || num < 1) return;
    try {
      await createTable(selectedBranch, num);
      setNewTableNum("");
      setShowAdd(false);
      router.refresh();
    } catch (err) {
      console.error("Failed to create table:", err);
      alert("Failed to create table.");
    }
  }

  async function handleBatchGenerate() {
    const start = parseInt(batchStart) || nextTableNum;
    const count = parseInt(batchCount) || 1;
    if (count < 1 || count > 500) return;
    try {
      await generateTables(selectedBranch, start, count);
      setBatchStart("");
      setBatchCount("5");
      setShowAdd(false);
      router.refresh();
    } catch (err) {
      console.error("Failed to generate tables:", err);
      alert("Failed to generate tables.");
    }
  }

  async function handleToggle(id: string) {
    setActing(id);
    try {
      await toggleTableActive(id);
      router.refresh();
    } catch (err) {
      console.error("Failed to toggle table:", err);
      alert("Failed. Please try again.");
    } finally {
      setActing(null);
    }
  }

  async function handleRegenerateToken(id: string) {
    if (!confirm("Regenerate this table's QR token? The old QR code will stop working.")) return;
    setActing(id);
    try {
      await regenerateTableToken(id);
      router.refresh();
    } catch (err) {
      console.error("Failed to regenerate token:", err);
      alert("Failed. Please try again.");
    } finally {
      setActing(null);
    }
  }

  function handlePrintQR(table: TableWithBranch) {
    const url = qrUrl(origin, table.tableNumber, table.qrToken);
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>QR - Table ${table.tableNumber}</title>
      <style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;}
      h2{margin-bottom:8px;} p{color:#666;margin:0;}</style></head>
      <body>
        <h2>Table ${table.tableNumber}</h2>
        <p>${activeBranch?.nameEn ?? ""}</p>
        <div id="qr"></div>
        <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"><\/script>
        <script>QRCode.toCanvas(document.createElement('canvas'),"${url}",{width:256},function(e,c){document.getElementById('qr').appendChild(c);})<\/script>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  function handlePrintAll() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const cards = filtered
      .map(
        (t) => `
        <div style="text-align:center;border:1px dashed #ccc;padding:20px;page-break-inside:avoid;width:250px;display:inline-block;margin:8px;">
          <h3 style="margin:0 0 4px;">Table ${t.tableNumber}</h3>
          <p style="color:#666;margin:0 0 12px;">${activeBranch?.nameEn ?? ""}</p>
          <canvas class="qr" data-url="${qrUrl(origin, t.tableNumber, t.qrToken)}"></canvas>
        </div>`
      )
      .join("");
    printWindow.document.write(`
      <html><head><title>QR Codes - ${activeBranch?.nameEn ?? ""}</title>
      <style>body{font-family:sans-serif;padding:20px;}
      canvas{display:block;margin:0 auto;}</style></head>
      <body>
        <h2 style="text-align:center;">${activeBranch?.nameEn ?? ""} — QR Codes</h2>
        <div style="text-align:center;">${cards}</div>
        <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"><\/script>
        <script>
          document.querySelectorAll('.qr').forEach(function(c){
            QRCode.toCanvas(c, c.dataset.url, {width:200});
          });
          window.onload=function(){setTimeout(function(){window.print();},500);};
        <\/script>
      </body></html>
    `);
    printWindow.document.close();
  }

  async function handleDownloadPDF(table: TableWithBranch) {
    const url = qrUrl(origin, table.tableNumber, table.qrToken);
    const qrDataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 });
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text(`Table ${table.tableNumber}`, pageW / 2, 50, { align: "center" });
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(activeBranch?.nameEn ?? "", pageW / 2, 62, { align: "center" });
    doc.addImage(qrDataUrl, "PNG", (pageW - 70) / 2, 75, 70, 70);
    doc.save(`Table-${table.tableNumber}-QR.pdf`);
  }

  async function handleDownloadAllPDF() {
    if (filtered.length === 0) return;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    for (let i = 0; i < filtered.length; i++) {
      if (i > 0) doc.addPage();
      const table = filtered[i];
      const url = qrUrl(origin, table.tableNumber, table.qrToken);
      const qrDataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.text(`Table ${table.tableNumber}`, pageW / 2, 50, { align: "center" });
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text(activeBranch?.nameEn ?? "", pageW / 2, 62, { align: "center" });
      doc.addImage(qrDataUrl, "PNG", (pageW - 70) / 2, 75, 70, 70);
    }
    doc.save(`${activeBranch?.nameEn ?? "Tables"}-QR-Codes.pdf`);
  }

  if (branches.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center">
        <p className="text-base font-bold text-gray-400">
          {t("noBranches")}
        </p>
        <a
          href="/admin/branches"
          className="btn-primary mt-4 inline-flex text-sm"
        >
          {t("goToBranches")}
        </a>
      </div>
    );
  }

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="min-h-full">
      <div className="mx-auto max-w-[1400px] space-y-5">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(Number(e.target.value))}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-900 shadow-sm"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {lang === "ar" ? b.nameAr : b.nameEn}
              </option>
            ))}
          </select>

          <span className="text-sm font-bold text-gray-400">
            {filtered.length} {t("tables")}
          </span>

          <div className="flex-1" />

          <button
            onClick={handlePrintAll}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-600 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-30"
          >
            <Printer size={14} />
            {t("printAll")}
          </button>

          <button
            onClick={handleDownloadAllPDF}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-600 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-30"
          >
            <Download size={14} />
            {t("downloadPDF")}
          </button>

          <button
            onClick={() => {
              setShowAdd(!showAdd);
              setAddMode("single");
            }}
            className="btn-primary text-sm"
          >
            <Plus size={16} />
            {t("addTable")}
          </button>
        </div>

        {/* Add Table Panel */}
        {showAdd && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-900">
                {t("addTableName")} {lang === "ar" ? activeBranch?.nameAr : activeBranch?.nameEn}
              </h3>
              <button
                onClick={() => setShowAdd(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={16} />
              </button>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setAddMode("single")}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                  addMode === "single"
                    ? "bg-red-50 text-red-600"
                    : "bg-gray-50 text-gray-400 hover:text-gray-600"
                }`}
              >
                {t("singleTable")}
              </button>
              <button
                onClick={() => setAddMode("batch")}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                  addMode === "batch"
                    ? "bg-red-50 text-red-600"
                    : "bg-gray-50 text-gray-400 hover:text-gray-600"
                }`}
              >
                {t("multipleTables")}
              </button>
            </div>

            {addMode === "single" ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400">#</span>
                <input
                  type="number"
                  min={1}
                  value={newTableNum}
                  onChange={(e) => setNewTableNum(e.target.value)}
                  placeholder={String(nextTableNum)}
                  className="w-28 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-base font-bold text-gray-900 placeholder:text-gray-300 focus:border-red-300 focus:ring-2 focus:ring-red-100 outline-none"
                />
                <button onClick={handleCreate} className="btn-primary text-sm">
                  {t("create")}
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">
                    {t("startFrom")} #
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={batchStart}
                    onChange={(e) => setBatchStart(e.target.value)}
                    placeholder={String(nextTableNum)}
                    className="w-24 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-base font-bold text-gray-900 placeholder:text-gray-300 focus:border-red-300 focus:ring-2 focus:ring-red-100 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">
                    {t("count")}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={batchCount}
                    onChange={(e) => setBatchCount(e.target.value)}
                    className="w-24 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-base font-bold text-gray-900 placeholder:text-gray-300 focus:border-red-300 focus:ring-2 focus:ring-red-100 outline-none"
                  />
                </div>
                <button
                  onClick={handleBatchGenerate}
                  className="btn-primary text-sm"
                >
                  {t("create")} {batchCount} {t("tables")}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Table Cards Grid — wider */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((table) => {
            return (
              <div
                key={table.id}
                className={`group rounded-2xl border p-5 transition-all hover:shadow-md ${
                  table.isActive
                    ? "border-gray-200 bg-white hover:border-gray-300"
                    : "border-red-200 bg-red-50/50 opacity-60"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Hash size={16} className="text-gray-300" />
                    <span className="text-xl font-black text-gray-900">
                      {table.tableNumber}
                    </span>
                    {!table.isActive && (
                      <span className="rounded-lg bg-red-100 px-2 py-0.5 text-[10px] font-black text-red-600">
                        {t("inactive")}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-50 rounded-lg px-2 py-1">
                    {table.orders.length} {t("ordersCount")}
                  </span>
                </div>

                {/* Branch name */}
                <p className="mt-1.5 text-xs text-gray-400">
                  {lang === "ar" ? table.branch.nameAr : table.branch.nameEn}
                </p>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setQrModal(table)}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    <Eye size={14} />
                    QR
                  </button>

                  <button
                    onClick={() => handleDownloadPDF(table)}
                    className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                  >
                    <Download size={14} />
                    PDF
                  </button>

                  <button
                    onClick={() => handlePrintQR(table)}
                    className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                  >
                    <Printer size={14} />
                  </button>

                  <button
                    onClick={() => handleRegenerateToken(table.id)}
                    disabled={acting === table.id}
                    className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-600 hover:bg-amber-100 transition-colors disabled:opacity-40"
                  >
                    <RefreshCw size={14} />
                  </button>

                  <button
                    onClick={() => handleToggle(table.id)}
                    disabled={acting === table.id}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors disabled:opacity-40 ${
                      table.isActive
                        ? "bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    }`}
                  >
                    {table.isActive ? (
                      <>
                        <PowerOff size={14} />
                        Off
                      </>
                    ) : (
                      <>
                        <Power size={14} />
                        On
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <p className="col-span-full py-12 text-center text-base text-gray-400">
              {t("noTablesInBranch")}
            </p>
          )}
        </div>

        {/* QR View Modal */}
        {qrModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setQrModal(null)}
          >
            <div
              className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-gray-900">
                  {t("table")} {qrModal.tableNumber}
                </h3>
                <button
                  onClick={() => setQrModal(null)}
                  className="text-gray-400 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                {lang === "ar" ? qrModal.branch.nameAr : qrModal.branch.nameEn}
              </p>

              {origin && (
                <div className="mx-auto mb-4 inline-block rounded-xl bg-gray-50 p-4 border border-gray-100">
                  <QRCodeSVG
                    value={qrUrl(origin, qrModal.tableNumber, qrModal.qrToken)}
                    size={200}
                    level="H"
                    bgColor="#f9fafb"
                    fgColor="#111827"
                  />
                </div>
              )}

              <p className="mt-2 break-all font-mono text-xs text-gray-400">
                {origin
                  ? qrUrl(origin, qrModal.tableNumber, qrModal.qrToken)
                  : t("loading")}
              </p>

              <div className="mt-6 flex gap-3 justify-center">
                <button
                  onClick={() => handlePrintQR(qrModal)}
                  className="btn-primary text-sm"
                >
                  <Printer size={14} />
                  {t("print")}
                </button>
                <button
                  onClick={() => handleDownloadPDF(qrModal)}
                  className="btn-primary text-sm"
                >
                  <Download size={14} />
                  {t("download")}
                </button>
                <button
                  onClick={() => setQrModal(null)}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition-all hover:bg-gray-50"
                >
                  {t("close")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
