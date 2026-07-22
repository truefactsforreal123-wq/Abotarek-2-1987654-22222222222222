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
} from "lucide-react";
import { signOut } from "@/lib/auth";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/admin/tables", label: "Tables", icon: QrCode },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/branches", label: "Branches", icon: Store },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const navContent = (
    <nav className="flex flex-1 flex-col gap-0.5 px-3 mt-2">
      {navLinks.map((link) => {
        const Icon = link.icon;
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
              active
                ? "bg-gradient-to-r from-ember/20 to-ember/5 text-ember shadow-[inset_0_0_20px_rgba(229,50,34,0.06)]"
                : "text-paper/45 hover:bg-white/[0.04] hover:text-paper/80"
            }`}
          >
            {active && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-ember" />
            )}
            <Icon className={`h-[18px] w-[18px] shrink-0 transition-colors ${active ? "text-ember" : "text-paper/30 group-hover:text-paper/60"}`} />
            {link.label}
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
        className="fixed left-4 top-4 z-50 rounded-xl bg-white/[0.06] backdrop-blur-md p-2.5 text-paper/70 lg:hidden border border-white/[0.08] shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden w-[260px] shrink-0 flex-col border-r border-white/[0.06] bg-gradient-to-b from-[#0c1021] to-[#0a0e1a] lg:flex">
        <SidebarInner navContent={navContent} />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-white/[0.06] bg-gradient-to-b from-[#0c1021] to-[#0a0e1a] lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-3 rounded-lg p-1.5 text-paper/50 hover:bg-ink-800 hover:text-paper"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarInner navContent={navContent} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarInner({ navContent }: { navContent: React.ReactNode }) {
  return (
    <>
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-ember to-ember-dark text-sm font-black text-paper shadow-lg shadow-ember/20">
          AT
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-extrabold tracking-wide text-paper">
            أبو طارق
          </span>
          <span className="text-[11px] text-paper/35 font-medium">Admin Panel</span>
        </div>
      </div>

      {navContent}

      {/* Footer actions */}
      <div className="mt-auto border-t border-white/[0.06] p-3 space-y-0.5">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-paper/40 transition-all hover:bg-white/[0.04] hover:text-paper/70"
        >
          <ExternalLink className="h-[18px] w-[18px]" />
          View Site
        </a>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-paper/40 transition-all hover:bg-ember/10 hover:text-ember"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Logout
          </button>
        </form>
      </div>
    </>
  );
}
