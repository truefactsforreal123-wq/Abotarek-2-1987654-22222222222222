"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  UtensilsCrossed,
  QrCode,
  Settings,
  LogOut,
  ExternalLink,
  ShoppingBag,
  Star,
  Store,
  Menu,
  X,
  Globe,
} from "lucide-react";
import { signOut } from "@/lib/auth";
import { useUnseenOrders } from "./UnseenOrdersProvider";
import { useAdminI18n } from "@/lib/admin-i18n";
import type { AdminTranslationKey } from "@/lib/locales/en";

export default function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { count: unseenCount } = useUnseenOrders();
  const { lang, setLang, t } = useAdminI18n();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const navLinks = [
    { href: "/admin", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/admin/menu", label: t("menu"), icon: UtensilsCrossed },
    { href: "/admin/tables", label: t("tables"), icon: QrCode },
    { href: "/admin/orders", label: t("orders"), icon: ShoppingBag },
    { href: "/admin/branches", label: t("branches"), icon: Store },
    { href: "/admin/reviews", label: t("reviews"), icon: Star },
    { href: "/admin/settings", label: t("settings"), icon: Settings },
  ];

  const navContent = (
    <nav className="flex flex-1 flex-col gap-0.5 px-3 mt-2">
      {navLinks.map((link) => {
        const Icon = link.icon;
        const active = isActive(link.href);
        const showBadge = link.href === "/admin/orders" && unseenCount > 0;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
              active
                ? "bg-red-50 text-red-600"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {active && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-red-500" />
            )}
            <Icon className={`h-[18px] w-[18px] shrink-0 transition-colors ${active ? "text-red-500" : "text-gray-400 group-hover:text-gray-600"}`} />
            {link.label}
            {showBadge && (
              <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                {unseenCount > 99 ? "99+" : unseenCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-xl bg-white p-2.5 text-gray-600 lg:hidden border border-gray-200 shadow-md"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden w-[260px] shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">
        <SidebarInner navContent={navContent} lang={lang} setLang={setLang} t={t} />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-gray-200 bg-white lg:hidden"
              dir="ltr"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarInner navContent={navContent} lang={lang} setLang={setLang} t={t} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarInner({
  navContent,
  lang,
  setLang,
  t,
}: {
  navContent: React.ReactNode;
  lang: "en" | "ar";
  setLang: (l: "en" | "ar") => void;
  t: (key: AdminTranslationKey) => string;
}) {
  return (
    <>
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-ember to-ember-dark text-sm font-black text-white shadow-lg shadow-ember/20">
          AT
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-extrabold tracking-wide text-gray-900">
            أبو طارق
          </span>
          <span className="text-[11px] text-gray-400 font-medium">{t("adminPanel")}</span>
        </div>
      </div>

      {navContent}

      {/* Footer actions */}
      <div className="mt-auto border-t border-gray-100 p-3 space-y-0.5">
        {/* Language switcher */}
        <button
          onClick={() => setLang(lang === "ar" ? "en" : "ar")}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-400 transition-all hover:bg-gray-50 hover:text-gray-700 w-full"
        >
          <Globe className="h-[18px] w-[18px]" />
          {lang === "ar" ? "English" : "العربية"}
        </button>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-400 transition-all hover:bg-gray-50 hover:text-gray-700"
        >
          <ExternalLink className="h-[18px] w-[18px]" />
          {t("viewSite")}
        </a>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-400 transition-all hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-[18px] w-[18px]" />
            {t("logout")}
          </button>
        </form>
      </div>
    </>
  );
}
