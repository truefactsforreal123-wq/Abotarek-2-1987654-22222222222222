"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  const [summaryLoading, setSummaryLoading] = useState(false);

  const itemName = useCallback((item: OrderItem) => item.menuItem.nameEn, []);

  const STATUS_LABELS: Record<
    string,
    { label: string; color: string; icon: React.ReactNode }
  > = {
    submitted: {
      label: "New",
      color: "bg-cobalt-500/15 text-cobalt-500 border border-cobalt-500/20",
      icon: <Bell size={12} className="mr-1" />,
    },
    preparing: {
      label: "Preparing",
      color:
        "bg-saffron-400/15 text-saffron-400 border border-saffron-400/20",
      icon: <ChefHat size={12} className="mr-1" />,
    },
    ready: {
      label: "Ready",
      color: "bg-green-500/15 text-green-400 border border-green-500/20",
      icon: <PackageCheck size={12} className="mr-1" />,
    },
    served: {
      label: "Served",
      color: "bg-green-500/10 text-green-400/60",
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
    if (!dateStr) return "text-paper/40";
    const diff = Math.floor(
      (Date.now() - new Date(dateStr).getTime()) / 60000
    );
    if (diff < 5) return "text-green-400";
    if (diff < 15) return "text-saffron-400";
    return "text-tomato-500";
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
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSummaryLoading(true);
    fetch(`/api/orders/summary?date=${summaryDate}`, {
      credentials: "same-origin",
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setSummaryData(data);
          setSummaryLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setSummaryLoading(false);
      });
    return () => {
      cancelled = true;
    };
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
        <h1 className="text-2xl font-black text-paper">Orders</h1>
      </div>

      {/* Tabs + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setTab("active")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-base font-bold transition-colors ${
              tab === "active"
                ? "bg-cobalt-500/15 text-cobalt-500"
                : "text-paper/35 hover:text-paper"
            }`}
          >
            <Bell size={18} />
            Active Orders ({filteredActive.length})
          </button>
          <button
            onClick={() => setTab("history")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-base font-bold transition-colors ${
              tab === "history"
                ? "bg-cobalt-500/15 text-cobalt-500"
                : "text-paper/35 hover:text-paper"
            }`}
          >
            <History size={18} />
            History ({filteredServed.length})
          </button>
          <button
            onClick={() => setTab("summary")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-base font-bold transition-colors ${
              tab === "summary"
                ? "bg-cobalt-500/15 text-cobalt-500"
                : "text-paper/35 hover:text-paper"
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
            className="rounded-lg border border-ink-700 bg-ink-900 px-3 py-2.5 text-sm font-bold text-paper"
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
            <div className="rounded-xl border border-dashed border-ink-700 p-12 text-center">
              <p className="text-paper/30 text-base font-bold">
                No active orders
              </p>
              <p className="mt-1 text-sm text-paper/20">
                New orders will appear here in real time
              </p>
            </div>
          )}

          {Object.entries(groupedActive).map(([groupKey, orders]) => (
            <div key={groupKey} className="mb-6">
              <h3 className="text-sm font-black text-paper/40 uppercase tracking-wider mb-3">
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
                        className="rounded-xl border border-ink-700 bg-ink-900 p-4"
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
                          <span className="text-xl font-black text-saffron-400">
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
                                <span className="font-bold text-paper">
                                  {item.quantity}x {itemName(item)}
                                </span>
                                {item.selectedSize &&
                                  typeof item.selectedSize === "object" &&
                                  item.selectedSize !== null && (
                                    <span className="text-paper font-bold ml-1">
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
                                            className="rounded bg-cobalt-500/15 px-1.5 py-0.5 text-xs font-bold text-cobalt-500"
                                          >
                                            {p}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  )}
                                {item.notes && (
                                  <span className="text-paper/30 italic ml-1 text-sm">
                                    &mdash; &quot;{item.notes}&quot;
                                  </span>
                                )}
                              </div>
                              <span className="text-paper/40 shrink-0 ml-2 font-bold text-sm">
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
                              className="flex items-center gap-1.5 rounded-lg bg-saffron-400/10 px-3 py-2 text-sm font-bold text-saffron-400 hover:bg-saffron-400/20 transition-colors disabled:opacity-40 min-h-[44px]"
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
                              className="flex items-center gap-1.5 rounded-lg bg-green-500/10 px-3 py-2 text-sm font-bold text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-40 min-h-[44px]"
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
                              className="flex items-center gap-1.5 rounded-lg bg-cobalt-500/10 px-3 py-2 text-sm font-bold text-cobalt-500 hover:bg-cobalt-500/20 transition-colors disabled:opacity-40 min-h-[44px]"
                            >
                              <CheckCircle2 size={16} />
                              {acting === order.id ? "..." : "Served"}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(order.id)}
                            disabled={acting === order.id}
                            className="flex items-center gap-1.5 rounded-lg bg-tomato-500/10 px-3 py-2 text-sm font-bold text-tomato-500 hover:bg-tomato-500/20 transition-colors disabled:opacity-40 min-h-[44px]"
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
            <div className="rounded-xl border border-dashed border-ink-700 p-12 text-center">
              <p className="text-paper/30 text-base font-bold">
                No served orders yet
              </p>
              <p className="mt-1 text-sm text-paper/20">
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
                  className="rounded-xl border border-green-500/10 bg-green-500/5 p-4 opacity-70"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={16} className="text-green-400" />
                    <span className="text-sm font-bold text-green-400">
                      Table {order.table.tableNumber} —{" "}
                      {order.table.branch.nameEn}
                    </span>
                    <span className="text-sm text-paper/30">
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
                          <span className="text-paper/50">
                            {item.quantity}x {itemName(item)}
                            {item.selectedSize &&
                              typeof item.selectedSize === "object" &&
                              item.selectedSize !== null && (
                                <span className="text-paper/70 ml-1">
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
                        <span className="text-paper/30 shrink-0 ml-2 text-sm">
                          {Number(item.priceAtOrder)} LE
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-base font-bold text-saffron-400">
                      {total} LE
                    </span>
                    <button
                      onClick={() => handleDelete(order.id)}
                      disabled={acting === order.id}
                      className="text-xs font-bold text-tomato-500/50 hover:text-tomato-500 transition-colors disabled:opacity-40"
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
            <CalendarDays size={20} className="text-paper/40" />
            <input
              type="date"
              value={summaryDate}
              max={todayStr}
              onChange={(e) => setSummaryDate(e.target.value)}
              className="rounded-lg border border-ink-700 bg-ink-900 px-4 py-2.5 text-base font-bold text-paper"
            />
            {summaryDate === todayStr ? (
              <span className="rounded-lg bg-green-500/15 px-3 py-1.5 text-sm font-bold text-green-400">
                Today
              </span>
            ) : (
              <button
                onClick={() => setSummaryDate(todayStr)}
                className="rounded-lg bg-ink-800 px-3 py-1.5 text-sm font-bold text-paper/50 hover:text-paper transition-colors"
              >
                Back to Today
              </button>
            )}
          </div>

          {summaryLoading ? (
            <div className="rounded-xl border border-ink-700 bg-ink-900 p-12 text-center">
              <p className="text-base text-paper/40">Loading...</p>
            </div>
          ) : summaryData ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="rounded-xl border border-ink-700 bg-ink-900 p-5">
                  <p className="text-sm text-paper/40 uppercase">Orders</p>
                  <p className="text-4xl font-black text-paper mt-1">
                    {summaryData.totalOrders}
                  </p>
                </div>
                <div className="rounded-xl border border-ink-700 bg-ink-900 p-5">
                  <p className="text-sm text-paper/40 uppercase">Revenue</p>
                  <p className="text-4xl font-black text-saffron-400 mt-1">
                    {summaryData.totalRevenue}{" "}
                    <span className="text-lg">LE</span>
                  </p>
                </div>
                <div className="rounded-xl border border-ink-700 bg-ink-900 p-5">
                  <p className="text-sm text-paper/40 uppercase">
                    Items Sold
                  </p>
                  <p className="text-4xl font-black text-paper mt-1">
                    {summaryData.itemsSold}
                  </p>
                </div>
                <div className="rounded-xl border border-ink-700 bg-ink-900 p-5">
                  <p className="text-sm text-paper/40 uppercase">
                    Avg Order
                  </p>
                  <p className="text-4xl font-black text-paper mt-1">
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
                  <div className="rounded-xl border border-ink-700 bg-ink-900 p-5">
                    <h3 className="text-base font-black text-paper/50 uppercase mb-4">
                      Top Selling Items
                    </h3>
                    <div className="space-y-2">
                      {summaryData.topItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg bg-ink-800 px-4 py-2.5"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-paper/25 w-6">
                              #{idx + 1}
                            </span>
                            <span className="text-base font-bold text-paper">
                              {item.nameEn}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-paper/40">
                              x{item.quantity}
                            </span>
                            <span className="text-base font-bold text-saffron-400">
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
                  <div className="rounded-xl border border-ink-700 bg-ink-900 p-5">
                    <h3 className="text-base font-black text-paper/50 uppercase mb-4">
                      Orders by Branch
                    </h3>
                    <div className="space-y-2">
                      {summaryData.branchStats.map((branch, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg bg-ink-800 px-4 py-2.5"
                        >
                          <span className="text-base font-bold text-paper">
                            {branch.nameEn}
                          </span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-paper/40">
                              {branch.count} orders
                            </span>
                            <span className="text-base font-bold text-saffron-400">
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
                <div className="rounded-xl border border-dashed border-ink-700 p-12 text-center">
                  <p className="text-paper/30 text-base font-bold">
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
