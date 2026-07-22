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
  const [qrModal, setQrModal] = useState<TableWithBranch | null>(null);
  const [acting, setActing] = useState<string | null>(null);

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
    const qrImg = await fetch(qrDataUrl).then((r) => r.arrayBuffer());
    const qrBase64 = btoa(
      new Uint8Array(qrImg).reduce((d, b) => d + String.fromCharCode(b), ""),
    );
    doc.addImage(`image/png;base64,${qrBase64}`, "PNG", (pageW - 70) / 2, 75, 70, 70);
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
      const qrImg = await fetch(qrDataUrl).then((r) => r.arrayBuffer());
      const qrBase64 = btoa(
        new Uint8Array(qrImg).reduce((d, b) => d + String.fromCharCode(b), ""),
      );
      doc.addImage(`image/png;base64,${qrBase64}`, "PNG", (pageW - 70) / 2, 75, 70, 70);
    }
    doc.save(`${activeBranch?.nameEn ?? "Tables"}-QR-Codes.pdf`);
  }

  if (branches.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-ink-700 bg-ink-900 p-12 text-center">
        <p className="text-base font-bold text-paper/30">
          No branches exist yet. Create a branch first before managing tables.
        </p>
        <a
          href="/admin/branches"
          className="btn-primary mt-4 inline-flex text-sm"
        >
          Go to Branches
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(Number(e.target.value))}
          className="rounded-lg border border-ink-700 bg-ink-900 px-4 py-2.5 text-sm font-bold text-paper"
        >
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nameEn}
            </option>
          ))}
        </select>

        <span className="text-sm font-bold text-paper/35">
          {filtered.length} tables
        </span>

        <div className="flex-1" />

        <button
          onClick={handlePrintAll}
          disabled={filtered.length === 0}
          className="btn-ghost text-xs disabled:opacity-30"
        >
          <Printer size={14} />
          Print All
        </button>

        <button
          onClick={handleDownloadAllPDF}
          disabled={filtered.length === 0}
          className="btn-ghost text-xs disabled:opacity-30"
        >
          <Download size={14} />
          Download PDF
        </button>

        <button
          onClick={() => {
            setShowAdd(!showAdd);
            setAddMode("single");
          }}
          className="btn-primary text-sm"
        >
          <Plus size={16} />
          Add Table
        </button>
      </div>

      {/* Add Table Panel */}
      {showAdd && (
        <div className="rounded-xl border border-ink-700 bg-ink-900 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-paper">
              Add to {activeBranch?.nameEn}
            </h3>
            <button
              onClick={() => setShowAdd(false)}
              className="text-paper/30 hover:text-paper"
            >
              <X size={16} />
            </button>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setAddMode("single")}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                addMode === "single"
                  ? "bg-cobalt-500/15 text-cobalt-500"
                  : "bg-ink-800 text-paper/40 hover:text-paper/60"
              }`}
            >
              Single Table
            </button>
            <button
              onClick={() => setAddMode("batch")}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                addMode === "batch"
                  ? "bg-cobalt-500/15 text-cobalt-500"
                  : "bg-ink-800 text-paper/40 hover:text-paper/60"
              }`}
            >
              Multiple Tables
            </button>
          </div>

          {addMode === "single" ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-paper/50">#</span>
              <input
                type="number"
                min={1}
                value={newTableNum}
                onChange={(e) => setNewTableNum(e.target.value)}
                placeholder={String(nextTableNum)}
                className="w-28 rounded-lg border border-ink-700 bg-ink-800 px-4 py-2.5 text-base font-bold text-paper placeholder:text-paper/25"
              />
              <button onClick={handleCreate} className="btn-primary text-sm">
                Create
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="text-xs font-bold text-paper/40 mb-1 block">
                  Start from #
                </label>
                <input
                  type="number"
                  min={1}
                  value={batchStart}
                  onChange={(e) => setBatchStart(e.target.value)}
                  placeholder={String(nextTableNum)}
                  className="w-24 rounded-lg border border-ink-700 bg-ink-800 px-4 py-2.5 text-base font-bold text-paper placeholder:text-paper/25"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-paper/40 mb-1 block">
                  Count
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={batchCount}
                  onChange={(e) => setBatchCount(e.target.value)}
                  className="w-24 rounded-lg border border-ink-700 bg-ink-800 px-4 py-2.5 text-base font-bold text-paper placeholder:text-paper/25"
                />
              </div>
              <button
                onClick={handleBatchGenerate}
                className="btn-primary text-sm"
              >
                Create {batchCount} Tables
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((table) => {
          const url = qrUrl(origin, table.tableNumber, table.qrToken);
          return (
            <div
              key={table.id}
              className={`group rounded-xl border p-5 transition-all hover:scale-[1.01] ${
                table.isActive
                  ? "border-ink-700 bg-ink-900 hover:border-ink-600"
                  : "border-tomato-500/20 bg-tomato-500/5 opacity-60"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Hash size={16} className="text-paper/30" />
                  <span className="text-xl font-black text-paper">
                    {table.tableNumber}
                  </span>
                  {!table.isActive && (
                    <span className="rounded-md bg-tomato-500/15 px-2 py-0.5 text-[10px] font-black text-tomato-500">
                      Inactive
                    </span>
                  )}
                </div>
                <span className="text-xs text-paper/30">
                  {table.orders.length} orders
                </span>
              </div>

              {/* Branch name */}
              <p className="mt-1 text-xs text-paper/35">
                {table.branch.nameEn}
              </p>

              {/* Mini QR + Token */}
              <div className="mt-4 flex items-center gap-3">
                {origin && (
                  <div className="rounded-lg bg-paper p-2">
                    <QRCodeSVG
                      value={url}
                      size={48}
                      level="M"
                      bgColor="#FBF5EC"
                      fgColor="#0A1124"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-paper/25 uppercase tracking-wider">
                    Token
                  </p>
                  <p className="truncate font-mono text-xs text-paper/50">
                    {table.qrToken}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setQrModal(table)}
                  className="flex items-center gap-1.5 rounded-lg bg-cobalt-500/10 px-3 py-2 text-xs font-bold text-cobalt-500 hover:bg-cobalt-500/20 transition-colors"
                >
                  <Eye size={14} />
                  QR
                </button>

                <button
                  onClick={() => handlePrintQR(table)}
                  className="flex items-center gap-1.5 rounded-lg bg-ink-800 px-3 py-2 text-xs font-bold text-paper/50 hover:bg-ink-700 hover:text-paper transition-colors"
                >
                  <Printer size={14} />
                </button>

                <button
                  onClick={() => handleDownloadPDF(table)}
                  className="flex items-center gap-1.5 rounded-lg bg-ink-800 px-3 py-2 text-xs font-bold text-paper/50 hover:bg-ink-700 hover:text-paper transition-colors"
                >
                  <Download size={14} />
                </button>

                <button
                  onClick={() => handleRegenerateToken(table.id)}
                  disabled={acting === table.id}
                  className="flex items-center gap-1.5 rounded-lg bg-saffron-500/10 px-3 py-2 text-xs font-bold text-saffron-400 hover:bg-saffron-500/20 transition-colors disabled:opacity-40"
                >
                  <RefreshCw size={14} />
                </button>

                <button
                  onClick={() => handleToggle(table.id)}
                  disabled={acting === table.id}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors disabled:opacity-40 ${
                    table.isActive
                      ? "bg-ink-800 text-paper/40 hover:bg-tomato-500/15 hover:text-tomato-500"
                      : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
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
          <p className="col-span-full py-12 text-center text-base text-paper/30">
            No tables in this branch yet. Use the buttons above to add some.
          </p>
        )}
      </div>

      {/* QR View Modal */}
      {qrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setQrModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-ink-700 bg-ink-900 p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-paper">
                Table {qrModal.tableNumber}
              </h3>
              <button
                onClick={() => setQrModal(null)}
                className="text-paper/30 hover:text-paper"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-paper/40 mb-4">
              {qrModal.branch.nameEn}
            </p>

            {origin && (
              <div className="mx-auto mb-4 inline-block rounded-xl bg-paper p-4">
                <QRCodeSVG
                  value={qrUrl(origin, qrModal.tableNumber, qrModal.qrToken)}
                  size={200}
                  level="H"
                  bgColor="#FBF5EC"
                  fgColor="#0A1124"
                />
              </div>
            )}

            <p className="mt-2 break-all font-mono text-xs text-paper/35">
              {origin
                ? qrUrl(origin, qrModal.tableNumber, qrModal.qrToken)
                : "Loading..."}
            </p>

            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={() => {
                  handlePrintQR(qrModal);
                }}
                className="btn-primary text-sm"
              >
                <Printer size={14} />
                Print
              </button>
              <button
                onClick={() => handleDownloadPDF(qrModal)}
                className="btn-primary text-sm"
              >
                <Download size={14} />
                Download
              </button>
              <button
                onClick={() => setQrModal(null)}
                className="btn-ghost text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
