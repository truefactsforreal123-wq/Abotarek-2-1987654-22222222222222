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
  categoryCount: number;
  menuItemCount: number;
  reviewCount: number;
  todayOrderCount: number;
  tableCount: number;
  recentOrders: RecentOrder[];
}

const statCards = [
  {
    key: "menuItems",
    label: "Menu Items",
    icon: UtensilsCrossed,
    color: "cobalt",
    getData: (d: DashboardData) => d.menuItemCount,
  },
  {
    key: "activeTables",
    label: "Active Tables",
    icon: LayoutGrid,
    color: "tomato",
    getData: (d: DashboardData) => d.tableCount,
  },
  {
    key: "branches",
    label: "Branches",
    icon: Building2,
    color: "saffron",
    getData: (d: DashboardData) => d.branchCount,
  },
  {
    key: "todayOrders",
    label: "Today's Orders",
    icon: ShoppingBag,
    color: "cobalt",
    getData: (d: DashboardData) => d.todayOrderCount,
  },
];

const statusBadge: Record<string, { bg: string; text: string; label: string }> = {
  submitted: { bg: "bg-cobalt-50", text: "text-cobalt-600", label: "New" },
  preparing: { bg: "bg-saffron-50", text: "text-saffron-600", label: "Preparing" },
  ready: { bg: "bg-tomato-50", text: "text-tomato-600", label: "Ready" },
  served: { bg: "bg-green-50", text: "text-green-600", label: "Served" },
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

function colorVariants(color: string) {
  switch (color) {
    case "cobalt":
      return "bg-cobalt-50 text-cobalt-600";
    case "tomato":
      return "bg-tomato-50 text-tomato-600";
    case "saffron":
      return "bg-saffron-50 text-saffron-500";
    default:
      return "bg-cobalt-50 text-cobalt-600";
  }
}

export function DashboardClient({ data }: { data: DashboardData }) {
  const orderTotal = (items: OrderItem[]) =>
    items.reduce((sum, i) => sum + Number(i.priceAtOrder) * i.quantity, 0);

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-2xl font-extrabold text-ink-950">
            Abo Tarek Dashboard
          </h1>
          <p className="mt-1 text-sm text-ink-700">
            Welcome back — here&apos;s what&apos;s happening today.
          </p>
        </header>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((card, i) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              className="rounded-xl border border-ink-800/10 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-lg ${colorVariants(card.color)}`}
                >
                  <card.icon size={22} />
                </div>
                <span className="text-3xl font-extrabold text-ink-950">
                  {card.getData(data)}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-ink-700">
                {card.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/admin/menu"
            className="btn-ghost border border-ink-800/10 bg-white"
          >
            <UtensilsCrossed size={16} /> Menu Management
          </Link>
          <Link
            href="/admin/tables"
            className="btn-ghost border border-ink-800/10 bg-white"
          >
            <LayoutGrid size={16} /> Tables
          </Link>
          <Link
            href="/admin/settings"
            className="btn-ghost border border-ink-800/10 bg-white"
          >
            <ClipboardList size={16} /> Settings
          </Link>
          <Link
            href="/admin/reviews"
            className="btn-ghost border border-ink-800/10 bg-white"
          >
            <Star size={16} /> Reviews
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="mt-8 rounded-xl border border-ink-800/10 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-ink-800/10 px-6 py-4">
            <h2 className="text-base font-bold text-ink-950">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-sm font-semibold text-cobalt-600 hover:underline"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {data.recentOrders.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-ink-700">
              No active orders right now.
            </div>
          ) : (
            <div className="divide-y divide-ink-800/10">
              {data.recentOrders.map((order) => {
                const badge = statusBadge[order.status] ?? statusBadge.submitted;
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between gap-4 px-6 py-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink-950">
                          Table {order.table.tableNumber}
                        </span>
                        <span className="text-xs text-ink-700">
                          {order.table.branch.nameEn}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-ink-700">
                        {order.items
                          .map(
                            (i) =>
                              `${i.menuItem.nameAr} x${i.quantity}`,
                          )
                          .join(", ")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-extrabold text-ink-950">
                        EGP {orderTotal(order.items).toFixed(0)}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-700">
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
