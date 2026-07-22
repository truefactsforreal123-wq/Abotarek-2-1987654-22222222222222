"use client";

import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  LayoutGrid,
  Building2,
  ShoppingBag,
  ClipboardList,
  ArrowRight,
  Star,
} from "lucide-react";
import Link from "next/link";

type OrderItem = {
  quantity: number;
  selectedSize?: unknown;
  priceAtOrder: number;
  menuItem: { nameAr: string; nameEn: string };
};

type RecentOrder = {
  id: string;
  status: string;
  submittedAt: string | null;
  table: {
    tableNumber: number;
    branch: { nameEn: string; nameAr: string };
  };
  items: OrderItem[];
};

interface DashboardData {
  branchCount: number;
  menuItemCount: number;
  todayOrderCount: number;
  tableCount: number;
  recentOrders: RecentOrder[];
}

const statCards = [
  {
    key: "todayOrders",
    label: "Today's Orders",
    icon: ShoppingBag,
    gradient: "from-red-50 via-transparent to-transparent",
    iconBg: "bg-red-50 text-red-500",
    accent: "text-red-600",
    getData: (d: DashboardData) => d.todayOrderCount,
    large: true,
  },
  {
    key: "menuItems",
    label: "Menu Items",
    icon: UtensilsCrossed,
    gradient: "from-blue-50 via-transparent to-transparent",
    iconBg: "bg-blue-50 text-blue-600",
    accent: "text-blue-600",
    getData: (d: DashboardData) => d.menuItemCount,
    large: false,
  },
  {
    key: "activeTables",
    label: "Active Tables",
    icon: LayoutGrid,
    gradient: "from-amber-50 via-transparent to-transparent",
    iconBg: "bg-amber-50 text-amber-600",
    accent: "text-amber-600",
    getData: (d: DashboardData) => d.tableCount,
    large: false,
  },
  {
    key: "branches",
    label: "Branches",
    icon: Building2,
    gradient: "from-emerald-50 via-transparent to-transparent",
    iconBg: "bg-emerald-50 text-emerald-600",
    accent: "text-emerald-600",
    getData: (d: DashboardData) => d.branchCount,
    large: false,
  },
];

const statusBadge: Record<string, { bg: string; text: string; label: string }> = {
  submitted: { bg: "bg-blue-50", text: "text-blue-600", label: "New" },
  preparing: { bg: "bg-amber-50", text: "text-amber-600", label: "Preparing" },
  ready: { bg: "bg-emerald-50", text: "text-emerald-600", label: "Ready" },
  served: { bg: "bg-gray-50", text: "text-gray-400", label: "Served" },
};

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function DashboardClient({ data }: { data: DashboardData }) {
  const orderTotal = (items: OrderItem[]) =>
    items.reduce((sum, i) => sum + Number(i.priceAtOrder) * i.quantity, 0);

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Welcome back — here&apos;s what&apos;s happening today.
          </p>
        </header>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} pointer-events-none`} />
              <div className="relative flex items-center justify-between">
                <span className="text-4xl font-extrabold tracking-tight text-gray-900">
                  {card.getData(data)}
                </span>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.iconBg}`}>
                  <card.icon size={24} />
                </div>
              </div>
              <p className="relative mt-3 text-sm font-semibold text-gray-500">
                {card.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-5 flex flex-wrap gap-2.5">
          {[
            { href: "/admin/menu", icon: UtensilsCrossed, label: "Menu" },
            { href: "/admin/tables", icon: LayoutGrid, label: "Tables" },
            { href: "/admin/settings", icon: ClipboardList, label: "Settings" },
            { href: "/admin/reviews", icon: Star, label: "Reviews" },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:-translate-y-0.5"
            >
              <action.icon size={15} /> {action.label}
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {data.recentOrders.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 mb-3">
                <ShoppingBag size={20} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">No active orders right now.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.recentOrders.map((order) => {
                const badge = statusBadge[order.status] ?? statusBadge.submitted;
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between gap-4 px-6 py-3.5 transition-colors hover:bg-gray-50/50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-gray-900 text-sm">
                          Table {order.table.tableNumber}
                        </span>
                        <span className="text-xs text-gray-400">
                          {order.table.branch.nameEn}
                        </span>
                        <span
                          className={`rounded-lg px-2 py-0.5 text-[11px] font-bold ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-gray-500">
                        {order.items
                          .map(
                            (i) =>
                              `${i.menuItem.nameAr} x${i.quantity}`,
                          )
                          .join(", ")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-extrabold text-sm text-gray-900">
                        EGP {orderTotal(order.items).toFixed(0)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-gray-400">
                        {timeAgo(order.submittedAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
