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
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {navLinks.map((link) => {
        const Icon = link.icon;
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
              active
                ? "bg-cobalt-500/15 text-cobalt-500"
                : "text-paper/50 hover:bg-ink-800 hover:text-paper"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
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
        className="fixed left-4 top-4 z-50 rounded-lg bg-ink-800 p-2 text-paper lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-800 bg-ink-950 lg:flex">
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
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-ink-800 bg-ink-950 lg:hidden"
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
      <div className="flex items-center gap-3 border-b border-ink-800 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tomato-600 text-sm font-black text-paper">
          AT
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-extrabold tracking-wide text-paper">
            أبو طارق
          </span>
          <span className="text-xs text-paper/40">Admin Panel</span>
        </div>
      </div>

      {navContent}

      {/* Footer actions */}
      <div className="mt-auto border-t border-ink-800 p-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-paper/50 transition-colors hover:bg-ink-800 hover:text-paper"
        >
          <ExternalLink className="h-5 w-5" />
          View Site
        </a>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-paper/50 transition-colors hover:bg-ink-800 hover:text-tomato-500"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </form>
      </div>
    </>
  );
}
