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
import { useAdminI18n } from "@/lib/admin-i18n";
import type { AdminTranslationKey } from "@/lib/locales/en";

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

const statusBadge: Record<string, { bg: string; text: string; labelAr: string; labelEn: string }> = {
  submitted: { bg: "bg-blue-50", text: "text-blue-600", labelAr: "جديد", labelEn: "New" },
  preparing: { bg: "bg-amber-50", text: "text-amber-600", labelAr: "يُحضّر", labelEn: "Preparing" },
  ready: { bg: "bg-emerald-50", text: "text-emerald-600", labelAr: "جاهز", labelEn: "Ready" },
  served: { bg: "bg-gray-50", text: "text-gray-400", labelAr: "تم التقديم", labelEn: "Served" },
};

function timeAgo(dateStr: string | null, t: (k: AdminTranslationKey) => string) {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t("now");
  if (mins < 60) return `${mins}د`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}س`;
  return `${Math.floor(hrs / 24)}ي`;
}

export function DashboardClient({ data }: { data: DashboardData }) {
  const { lang, t } = useAdminI18n();
  const orderTotal = (items: OrderItem[]) =>
    items.reduce((sum, i) => sum + Number(i.priceAtOrder) * i.quantity, 0);

  const statCards = [
    {
      key: "todayOrders",
      label: t("todayOrders"),
      icon: ShoppingBag,
      gradient: "from-red-50 via-transparent to-transparent",
      iconBg: "bg-red-50 text-red-500",
      getData: (d: DashboardData) => d.todayOrderCount,
    },
    {
      key: "menuItems",
      label: t("menuItems"),
      icon: UtensilsCrossed,
      gradient: "from-blue-50 via-transparent to-transparent",
      iconBg: "bg-blue-50 text-blue-600",
      getData: (d: DashboardData) => d.menuItemCount,
    },
    {
      key: "activeTables",
      label: t("activeTables"),
      icon: LayoutGrid,
      gradient: "from-amber-50 via-transparent to-transparent",
      iconBg: "bg-amber-50 text-amber-600",
      getData: (d: DashboardData) => d.tableCount,
    },
    {
      key: "branches",
      label: t("branchesLabel"),
      icon: Building2,
      gradient: "from-emerald-50 via-transparent to-transparent",
      iconBg: "bg-emerald-50 text-emerald-600",
      getData: (d: DashboardData) => d.branchCount,
    },
  ];

  return (
    <div className="min-h-full" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {t("dashboard")}
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            {t("welcomeBack")}
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
            { href: "/admin/menu", icon: UtensilsCrossed, label: t("menu") },
            { href: "/admin/tables", icon: LayoutGrid, label: t("tables") },
            { href: "/admin/settings", icon: ClipboardList, label: t("settings") },
            { href: "/admin/reviews", icon: Star, label: t("reviews") },
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
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{t("recentOrders")}</h2>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
            >
              {t("viewAll")} <ArrowRight size={14} />
            </Link>
          </div>

          {data.recentOrders.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 mb-3">
                <ShoppingBag size={20} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">{t("noActiveOrders")}</p>
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
                          {t("tables")} {order.table.tableNumber}
                        </span>
                        <span className="text-xs text-gray-400">
                          {lang === "ar" ? order.table.branch.nameAr : order.table.branch.nameEn}
                        </span>
                        <span
                          className={`rounded-lg px-2 py-0.5 text-[11px] font-bold ${badge.bg} ${badge.text}`}
                        >
                          {lang === "ar" ? badge.labelAr : badge.labelEn}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-gray-500">
                        {order.items
                          .map(
                            (i) =>
                              `${lang === "ar" ? i.menuItem.nameAr : i.menuItem.nameEn} x${i.quantity}`,
                          )
                          .join(", ")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-extrabold text-sm text-gray-900">
                        {orderTotal(order.items).toFixed(0)} {t("le")}
                      </p>
                      <p className="mt-0.5 text-[11px] text-gray-400">
                        {timeAgo(order.submittedAt, t)}
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
