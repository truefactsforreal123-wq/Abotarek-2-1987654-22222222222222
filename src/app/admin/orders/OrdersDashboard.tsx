"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  markOrderServed,
  markOrderPreparing,
  markOrderReady,
  deleteOrder,
} from "@/lib/actions";
import {
  Clock,
  CheckCircle2,
  History,
  Bell,
  ChefHat,
  PackageCheck,
  CalendarDays,
  BarChart3,
} from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  selectedSize: {
    label: { ar: string; en: string };
    price: number;
  } | null;
  notes: string | null;
  presets: string[] | null;
  priceAtOrder: string;
  menuItem: {
    nameAr: string;
    nameEn: string;
  };
}

interface OrderWithRelations {
  id: string;
  tableId: string;
  status: string;
  submittedAt: string | null;
  servedAt: string | null;
  items: OrderItem[];
  table: {
    tableNumber: number;
    branch: {
      nameAr: string;
      nameEn: string;
    };
  };
}

interface DaySummary {
  totalOrders: number;
  totalRevenue: number;
  itemsSold: number;
  topItems: {
    nameEn: string;
    nameAr: string;
    quantity: number;
    revenue: number;
  }[];
  branchStats: {
    nameEn: string;
    nameAr: string;
    count: number;
    revenue: number;
  }[];
}

export function OrdersDashboard({
  initialActive: activeOrders,
  initialServed: servedOrders,
  historyTTL,
  allBranches,
}: {
  initialActive: OrderWithRelations[];
  initialServed: OrderWithRelations[];
  historyTTL: number;
  allBranches: { id: number; nameEn: string; nameAr: string }[];
}) {
  const router = useRouter();

  const [branchFilter, setBranchFilter] = useState("all");
  const [tab, setTab] = useState<"active" | "history" | "summary">("active");
  const [acting, setActing] = useState<string | null>(null);
  const todayStr = new Date().toISOString().slice(0, 10);
  const [summaryDate, setSummaryDate] = useState(todayStr);
  const [summaryData, setSummaryData] = useState<DaySummary | null>(null);
  const [lastFetchedDate, setLastFetchedDate] = useState<string | null>(null);
  const summaryFetchId = useRef(0);
  const summaryLoading = tab === "summary" && lastFetchedDate !== summaryDate;

  const itemName = useCallback((item: OrderItem) => item.menuItem.nameEn, []);

  const STATUS_LABELS: Record<
    string,
    { label: string; color: string; icon: React.ReactNode }
  > = {
    submitted: {
      label: "New",
      color: "bg-blue-50 text-blue-600 border border-blue-200",
      icon: <Bell size={12} className="mr-1" />,
    },
    preparing: {
      label: "Preparing",
      color: "bg-amber-50 text-amber-600 border border-amber-200",
      icon: <ChefHat size={12} className="mr-1" />,
    },
    ready: {
      label: "Ready",
      color: "bg-emerald-50 text-emerald-600 border border-emerald-200",
      icon: <PackageCheck size={12} className="mr-1" />,
    },
    served: {
      label: "Served",
      color: "bg-gray-100 text-gray-500",
      icon: null,
    },
  };

  const filteredActive = useMemo(
    () =>
      branchFilter === "all"
        ? activeOrders
        : activeOrders.filter((o) => o.table.branch.nameEn === branchFilter),
    [activeOrders, branchFilter]
  );

  const filteredServed = useMemo(
    () =>
      branchFilter === "all"
        ? servedOrders
        : servedOrders.filter((o) => o.table.branch.nameEn === branchFilter),
    [servedOrders, branchFilter]
  );

  const getTimeAgo = useCallback((dateStr: string | null) => {
    if (!dateStr) return "";
    const diff = Math.floor(
      (Date.now() - new Date(dateStr).getTime()) / 60000
    );
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ${diff % 60}m`;
    return `${Math.floor(hours / 24)}d`;
  }, []);

  const getTimeColor = useCallback((dateStr: string | null) => {
    if (!dateStr) return "text-gray-400";
    const diff = Math.floor(
      (Date.now() - new Date(dateStr).getTime()) / 60000
    );
    if (diff < 5) return "text-emerald-600";
    if (diff < 15) return "text-amber-600";
    return "text-red-600";
  }, []);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 10000);
    return () => clearInterval(interval);
  }, [router]);

  // Supabase Realtime
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("live-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Order" },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "Order" },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [router]);

  // Fetch summary data
  useEffect(() => {
    if (tab !== "summary") return;
    const fetchId = ++summaryFetchId.current;
    fetch(`/api/orders/summary?date=${summaryDate}`, {
      credentials: "same-origin",
    })
      .then((r) => r.json())
      .then((data) => {
        if (fetchId === summaryFetchId.current) {
          setSummaryData(data);
          setLastFetchedDate(summaryDate);
        }
      })
      .catch(() => {});
  }, [tab, summaryDate]);

  async function handleAction(orderId: string, action: () => Promise<void>) {
    setActing(orderId);
    try {
      await action();
      router.refresh();
    } catch (err) {
      console.error("Order action failed:", err);
      alert("Failed. Please try again.");
    } finally {
      setActing(null);
    }
  }

  async function handleDelete(orderId: string) {
    if (!confirm("Are you sure you want to delete this order?")) return;
    setActing(orderId);
    try {
      await deleteOrder(orderId);
      router.refresh();
    } catch (err) {
      console.error("Order delete failed:", err);
      alert("Failed. Please try again.");
    } finally {
      setActing(null);
    }
  }

  const groupedActive = useMemo(
    () =>
      filteredActive.reduce(
        (acc, order) => {
          const key = `Table ${order.table.tableNumber} — ${order.table.branch.nameEn}`;
          if (!acc[key]) acc[key] = [];
          acc[key].push(order);
          return acc;
        },
        {} as Record<string, OrderWithRelations[]>
      ),
    [filteredActive]
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Orders</h1>
      </div>

      {/* Tabs + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setTab("active")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              tab === "active"
                ? "bg-red-50 text-red-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Bell size={18} />
            Active Orders ({filteredActive.length})
          </button>
          <button
            onClick={() => setTab("history")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              tab === "history"
                ? "bg-red-50 text-red-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <History size={18} />
            History ({filteredServed.length})
          </button>
          <button
            onClick={() => setTab("summary")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              tab === "summary"
                ? "bg-red-50 text-red-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <BarChart3 size={18} />
            Summary
          </button>
        </div>

        {tab !== "summary" && allBranches.length > 0 && (
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-900 shadow-sm"
          >
            <option value="all">All Branches</option>
            {allBranches.map((b) => (
              <option key={b.id} value={b.nameEn}>
                {b.nameEn}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Active Orders Tab */}
      {tab === "active" && (
        <div className="mt-6">
          {Object.keys(groupedActive).length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <p className="text-gray-400 text-base font-bold">
                No active orders
              </p>
              <p className="mt-1 text-sm text-gray-300">
                New orders will appear here in real time
              </p>
            </div>
          )}

          {Object.entries(groupedActive).map(([groupKey, orders]) => (
            <div key={groupKey} className="mb-6">
              <h3 className="text-sm font-black text-gray-500 uppercase tracking-wider mb-3">
                {groupKey}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {orders
                  .sort(
                    (a, b) =>
                      new Date(a.submittedAt ?? 0).getTime() -
                      new Date(b.submittedAt ?? 0).getTime()
                  )
                  .map((order) => {
                    const statusInfo =
                      STATUS_LABELS[order.status] ?? STATUS_LABELS.submitted;
                    const total = order.items.reduce(
                      (s, i) => s + Number(i.priceAtOrder),
                      0
                    );
                    return (
                      <div
                        key={order.id}
                        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Clock
                              size={16}
                              className={getTimeColor(order.submittedAt)}
                            />
                            <span
                              className={`text-base font-black ${getTimeColor(order.submittedAt)}`}
                            >
                              {getTimeAgo(order.submittedAt)}
                            </span>
                          </div>
                          <span className="text-xl font-black text-amber-600">
                            {total} LE
                          </span>
                        </div>

                        <div className="mt-2">
                          <span
                            className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-black ${statusInfo.color}`}
                          >
                            {statusInfo.icon}
                            {statusInfo.label}
                          </span>
                        </div>

                        <div className="mt-3 space-y-1.5">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex-1 min-w-0">
                                <span className="font-bold text-gray-900">
                                  {item.quantity}x {itemName(item)}
                                </span>
                                {item.selectedSize &&
                                  typeof item.selectedSize === "object" &&
                                  item.selectedSize !== null && (
                                    <span className="text-gray-900 font-bold ml-1">
                                      (
                                      {(
                                        item.selectedSize as {
                                          label?: { ar?: string; en?: string };
                                        }
                                      ).label?.en ?? ""}
                                      )
                                    </span>
                                  )}
                                {item.presets &&
                                  Array.isArray(item.presets) &&
                                  item.presets.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                      {item.presets.map(
                                        (p: string, idx: number) => (
                                          <span
                                            key={idx}
                                            className="rounded bg-blue-50 px-1.5 py-0.5 text-xs font-bold text-blue-600"
                                          >
                                            {p}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  )}
                                {item.notes && (
                                  <span className="text-gray-400 italic ml-1 text-sm">
                                    &mdash; &quot;{item.notes}&quot;
                                  </span>
                                )}
                              </div>
                              <span className="text-gray-500 shrink-0 ml-2 font-bold text-sm">
                                {Number(item.priceAtOrder)} LE
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {order.status === "submitted" && (
                            <button
                              onClick={() =>
                                handleAction(order.id, () =>
                                  markOrderPreparing(order.id)
                                )
                              }
                              disabled={acting === order.id}
                              className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-sm font-bold text-amber-600 hover:bg-amber-100 transition-colors disabled:opacity-40 min-h-[44px]"
                            >
                              <ChefHat size={16} />
                              {acting === order.id ? "..." : "Preparing"}
                            </button>
                          )}
                          {order.status === "preparing" && (
                            <button
                              onClick={() =>
                                handleAction(order.id, () =>
                                  markOrderReady(order.id)
                                )
                              }
                              disabled={acting === order.id}
                              className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-40 min-h-[44px]"
                            >
                              <PackageCheck size={16} />
                              {acting === order.id ? "..." : "Ready"}
                            </button>
                          )}
                          {(order.status === "submitted" ||
                            order.status === "preparing" ||
                            order.status === "ready") && (
                            <button
                              onClick={() =>
                                handleAction(order.id, () =>
                                  markOrderServed(order.id)
                                )
                              }
                              disabled={acting === order.id}
                              className="flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-2 text-sm font-bold text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-40 min-h-[44px]"
                            >
                              <CheckCircle2 size={16} />
                              {acting === order.id ? "..." : "Served"}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(order.id)}
                            disabled={acting === order.id}
                            className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-40 min-h-[44px]"
                          >
                            {acting === order.id ? "..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History Tab */}
      {tab === "history" && (
        <div className="mt-6">
          {filteredServed.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <p className="text-gray-400 text-base font-bold">
                No served orders yet
              </p>
              <p className="mt-1 text-sm text-gray-300">
                Served orders auto-delete after {historyTTL} hours
              </p>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredServed.map((order) => {
              const total = order.items.reduce(
                (s, i) => s + Number(i.priceAtOrder),
                0
              );
              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 opacity-70"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-600">
                      Table {order.table.tableNumber} —{" "}
                      {order.table.branch.nameEn}
                    </span>
                    <span className="text-sm text-gray-400">
                      {getTimeAgo(order.servedAt)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="text-gray-600">
                            {item.quantity}x {itemName(item)}
                            {item.selectedSize &&
                              typeof item.selectedSize === "object" &&
                              item.selectedSize !== null && (
                                <span className="text-gray-700 ml-1">
                                  (
                                  {(
                                    item.selectedSize as {
                                      label?: { ar?: string; en?: string };
                                    }
                                  ).label?.en ?? ""}
                                  )
                                </span>
                              )}
                          </span>
                        </div>
                        <span className="text-gray-400 shrink-0 ml-2 text-sm">
                          {Number(item.priceAtOrder)} LE
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-base font-bold text-amber-600">
                      {total} LE
                    </span>
                    <button
                      onClick={() => handleDelete(order.id)}
                      disabled={acting === order.id}
                      className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                    >
                      {acting === order.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary Tab */}
      {tab === "summary" && (
        <div className="mt-6">
          {/* Date Picker */}
          <div className="flex items-center gap-3 mb-6">
            <CalendarDays size={20} className="text-gray-400" />
            <input
              type="date"
              value={summaryDate}
              max={todayStr}
              onChange={(e) => setSummaryDate(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-base font-bold text-gray-900 shadow-sm"
            />
            {summaryDate === todayStr ? (
              <span className="rounded-xl bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-600">
                Today
              </span>
            ) : (
              <button
                onClick={() => setSummaryDate(todayStr)}
                className="rounded-xl bg-gray-100 px-3 py-1.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
              >
                Back to Today
              </button>
            )}
          </div>

          {summaryLoading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <p className="text-base text-gray-400">Loading...</p>
            </div>
          ) : summaryData ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500 uppercase">Orders</p>
                  <p className="text-4xl font-black text-gray-900 mt-1">
                    {summaryData.totalOrders}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500 uppercase">Revenue</p>
                  <p className="text-4xl font-black text-amber-600 mt-1">
                    {summaryData.totalRevenue}{" "}
                    <span className="text-lg">LE</span>
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500 uppercase">
                    Items Sold
                  </p>
                  <p className="text-4xl font-black text-gray-900 mt-1">
                    {summaryData.itemsSold}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500 uppercase">
                    Avg Order
                  </p>
                  <p className="text-4xl font-black text-gray-900 mt-1">
                    {summaryData.totalOrders > 0
                      ? Math.round(
                          summaryData.totalRevenue / summaryData.totalOrders
                        )
                      : 0}{" "}
                    <span className="text-lg">LE</span>
                  </p>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {/* Top Items */}
                {summaryData.topItems.length > 0 && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="text-base font-black text-gray-500 uppercase mb-4">
                      Top Selling Items
                    </h3>
                    <div className="space-y-2">
                      {summaryData.topItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-2.5"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-gray-300 w-6">
                              #{idx + 1}
                            </span>
                            <span className="text-base font-bold text-gray-900">
                              {item.nameEn}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">
                              x{item.quantity}
                            </span>
                            <span className="text-base font-bold text-amber-600">
                              {item.revenue} LE
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Branch Stats */}
                {summaryData.branchStats.length > 0 && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="text-base font-black text-gray-500 uppercase mb-4">
                      Orders by Branch
                    </h3>
                    <div className="space-y-2">
                      {summaryData.branchStats.map((branch, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-2.5"
                        >
                          <span className="text-base font-bold text-gray-900">
                            {branch.nameEn}
                          </span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">
                              {branch.count} orders
                            </span>
                            <span className="text-base font-bold text-amber-600">
                              {branch.revenue} LE
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {summaryData.totalOrders === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                  <p className="text-gray-400 text-base font-bold">
                    No orders on this day
                  </p>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
