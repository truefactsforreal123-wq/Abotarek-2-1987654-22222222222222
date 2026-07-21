"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Languages, Menu, MessageCircle, X } from "lucide-react";
import { useLang } from "@/lib/i18n";

type Brand = {
  nameAr: string;
  nameEn: string;
  taglineAr: string;
  taglineEn: string;
  foundedYear: number;
  founderAr: string;
  founderEn: string;
  facebook: string;
  phone: string;
  whatsapp: string;
} | null;

const LINKS = [
  { href: "/", key: "home" as const },
  { href: "/about", key: "about" as const },
  { href: "/menu", key: "menu" as const },
  { href: "/branches", key: "branches" as const },
];

export default function Navbar({ brand }: { brand: Brand }) {
  const { lang, t, toggle } = useLang();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close the mobile panel on navigation
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  if (!brand) return null;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
          scrolled
            ? "border-b border-cream/10 bg-night/85 py-2 backdrop-blur-xl"
            : "bg-transparent py-4"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-6">
          {/* brand */}
          <Link href="/" className="group flex items-center gap-3">
            <span className="rounded-xl bg-white p-1.5 shadow-lg transition-transform duration-300 group-hover:-rotate-6">
              <Image
                src="/images/logo.png"
                alt="شعار أبو طارق"
                width={52}
                height={31}
                priority
                className="h-auto w-11"
              />
            </span>
            <span className="leading-tight">
              <span className="block text-lg font-black">
                {lang === "ar" ? brand.nameAr : brand.nameEn}
              </span>
              <span className="hidden text-[11px] font-bold tracking-widest text-gold sm:block">
                {lang === "ar" ? "منذ 1950" : "SINCE 1950"}
              </span>
            </span>
          </Link>

          {/* desktop links */}
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
            {LINKS.map(({ href, key }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative py-1 text-sm font-bold transition-colors ${
                    active ? "text-gold" : "text-cream/75 hover:text-cream"
                  }`}
                >
                  {t.nav[key]}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1 inset-x-0 h-0.5 rounded-full bg-gold"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {/* language toggle */}
            <button
              onClick={toggle}
              className="flex items-center gap-1.5 rounded-full border border-cream/20 px-3.5 py-1.5 text-sm font-bold text-cream/85 transition hover:border-gold/60 hover:text-gold"
              aria-label="Switch language / تغيير اللغة"
            >
              <Languages size={16} aria-hidden />
              {lang === "ar" ? "EN" : "عربي"}
            </button>

            {/* order CTA */}
            <Link
              href="/menu"
              className="hidden rounded-full bg-gold px-5 py-2 text-sm font-black text-night transition hover:bg-gold-soft lg:inline-flex"
            >
              {t.nav.orderNow}
            </Link>

            {/* burger */}
            <button
              onClick={() => setOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full border border-cream/20 text-cream md:hidden"
              aria-label={t.nav.openMenu}
            >
              <Menu size={20} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {/* mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-nav"
            className="fixed inset-0 z-50 flex flex-col bg-night/97 backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between px-4 py-4">
              <span className="rounded-xl bg-white p-1.5">
                <Image
                  src="/images/logo.png"
                  alt=""
                  width={44}
                  height={26}
                  className="h-auto w-9"
                />
              </span>
              <button
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full border border-cream/20"
                aria-label={t.nav.closeMenu}
              >
                <X size={20} aria-hidden />
              </button>
            </div>

            <nav className="flex flex-1 flex-col items-center justify-center gap-7" aria-label="Mobile">
              {LINKS.map(({ href, key }, i) => (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i + 0.1, duration: 0.5 }}
                >
                  <Link
                    href={href}
                    className={`text-3xl font-black ${
                      pathname === href ? "text-gold" : "text-cream"
                    }`}
                  >
                    {t.nav[key]}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex items-center justify-center gap-4 pb-12"
            >
              <button
                onClick={toggle}
                className="flex items-center gap-2 rounded-full border border-cream/25 px-5 py-2.5 font-bold"
              >
                <Languages size={18} aria-hidden />
                {lang === "ar" ? "English" : "عربي"}
              </button>
              <a
                href={brand.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-[#25d366] px-5 py-2.5 font-black text-night"
              >
                <MessageCircle size={18} aria-hidden />
                WhatsApp
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
