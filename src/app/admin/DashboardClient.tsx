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
    key: "todayOrders",
    label: "Today's Orders",
    icon: ShoppingBag,
    gradient: "from-ember/20 via-ember/10 to-transparent",
    iconBg: "bg-ember/15 text-ember",
    accent: "text-ember",
    getData: (d: DashboardData) => d.todayOrderCount,
    large: true,
  },
  {
    key: "menuItems",
    label: "Menu Items",
    icon: UtensilsCrossed,
    gradient: "from-cobalt-500/15 via-cobalt-500/5 to-transparent",
    iconBg: "bg-cobalt-500/15 text-cobalt-500",
    accent: "text-cobalt-500",
    getData: (d: DashboardData) => d.menuItemCount,
    large: false,
  },
  {
    key: "activeTables",
    label: "Active Tables",
    icon: LayoutGrid,
    gradient: "from-gold-soft/10 via-gold-soft/5 to-transparent",
    iconBg: "bg-saffron-400/15 text-saffron-400",
    accent: "text-saffron-400",
    getData: (d: DashboardData) => d.tableCount,
    large: false,
  },
  {
    key: "branches",
    label: "Branches",
    icon: Building2,
    gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    iconBg: "bg-emerald-500/15 text-emerald-400",
    accent: "text-emerald-400",
    getData: (d: DashboardData) => d.branchCount,
    large: false,
  },
];

const statusBadge: Record<string, { bg: string; text: string; label: string }> = {
  submitted: { bg: "bg-cobalt-500/12", text: "text-cobalt-500", label: "New" },
  preparing: { bg: "bg-saffron-400/12", text: "text-saffron-400", label: "Preparing" },
  ready: { bg: "bg-emerald-500/12", text: "text-emerald-400", label: "Ready" },
  served: { bg: "bg-paper/5", text: "text-paper/40", label: "Served" },
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
          <h1 className="text-2xl font-extrabold text-paper tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-paper/40">
            Welcome back — here&apos;s what&apos;s happening today.
          </p>
        </header>

        {/* Stat Cards — asymmetric grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Hero card — today's orders, spans 2 cols */}
          {statCards.filter(c => c.large).map((card, i) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:col-span-2 lg:col-span-2`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} pointer-events-none`} />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-paper/40">{card.label}</p>
                  <p className={`mt-2 text-5xl font-extrabold tracking-tight ${card.accent}`}>
                    {card.getData(data)}
                  </p>
                </div>
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${card.iconBg}`}>
                  <card.icon size={26} />
                </div>
              </div>
            </motion.div>
          ))}

          {/* Smaller cards */}
          {statCards.filter(c => !c.large).map((card, i) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i + 2) * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} pointer-events-none`} />
              <div className="relative flex items-center justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}
                >
                  <card.icon size={20} />
                </div>
                <span className="text-2xl font-extrabold text-paper">
                  {card.getData(data)}
                </span>
              </div>
              <p className="relative mt-3 text-sm font-semibold text-paper/40">
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
              className="btn-ghost"
            >
              <action.icon size={15} /> {action.label}
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <h2 className="text-sm font-bold text-paper/70 uppercase tracking-wider">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-sm font-semibold text-ember hover:text-ember/80 transition-colors"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {data.recentOrders.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] mb-3">
                <ShoppingBag size={20} className="text-paper/20" />
              </div>
              <p className="text-sm text-paper/30">No active orders right now.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {data.recentOrders.map((order) => {
                const badge = statusBadge[order.status] ?? statusBadge.submitted;
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between gap-4 px-6 py-3.5 transition-colors hover:bg-white/[0.02]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-paper text-sm">
                          Table {order.table.tableNumber}
                        </span>
                        <span className="text-xs text-paper/25">
                          {order.table.branch.nameEn}
                        </span>
                        <span
                          className={`rounded-lg px-2 py-0.5 text-[11px] font-bold ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-paper/35">
                        {order.items
                          .map(
                            (i) =>
                              `${i.menuItem.nameAr} x${i.quantity}`,
                          )
                          .join(", ")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-extrabold text-sm text-paper">
                        EGP {orderTotal(order.items).toFixed(0)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-paper/30">
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
