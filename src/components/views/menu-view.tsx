"use client";

/* MENU — category filter + staggered animated cards (real photos) */

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Info, MessageCircle } from "lucide-react";
import { useLang } from "@/lib/i18n";
import MenuCard from "@/components/menu-card";
import SectionHeading from "@/components/section-heading";
import Reveal from "@/components/reveal";
import Steam from "@/components/steam";

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

type CategoryItem = {
  id: number;
  nameAr: string;
  nameEn: string;
  order: number;
  image: string;
  items: {
    id: number;
    nameAr: string;
    nameEn: string;
    descAr: string;
    descEn: string;
    price: number | null;
    sizes: { label: { ar: string; en: string }; price: number }[] | null;
    image: string;
    badge: string | null;
    available: boolean;
  }[];
};

export default function MenuView({
  brand,
  categories,
}: {
  brand: Brand;
  categories: CategoryItem[] | null;
}) {
  const { t, lang } = useLang();
  const [active, setActive] = useState<string>("all");

  if (!brand || !categories) return null;

  const allCategories = [
    { id: "all", nameAr: "الكل", nameEn: "All" },
    ...categories,
  ];

  const allItems = categories.flatMap((c) => c.items);

  const filtered =
    active === "all" ? allItems : allItems.filter((item) => {
      const cat = categories.find((c) => c.items.some((i) => i.id === item.id));
      return cat?.nameEn.toLowerCase() === active;
    });

  return (
    <>
      {/* page hero */}
      <section className="relative overflow-hidden pb-14 pt-40">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(55% 45% at 50% 0%, rgba(43,46,122,0.5), transparent 70%)",
          }}
          aria-hidden
        />
        <Steam />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading
            eyebrow={t.menuPage.eyebrow}
            title={t.menuPage.title}
            sub={t.menuPage.sub}
          />

          {/* category tabs */}
          <Reveal delay={0.15} className="mt-10">
            <div className="flex flex-wrap justify-center gap-3">
              {allCategories.map((c) => {
                const catId = c.id === "all" ? "all" : c.nameEn.toLowerCase();
                const isActive = active === catId;
                return (
                  <button
                    key={String(c.id)}
                    onClick={() => setActive(catId)}
                    className={`relative rounded-full px-6 py-2.5 text-sm font-black transition-colors ${
                      isActive
                        ? "text-night"
                        : "border border-cream/20 text-cream/70 hover:border-gold/50 hover:text-gold"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="menu-tab"
                        className="absolute inset-0 rounded-full bg-gold"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className="relative">{lang === "ar" ? c.nameAr : c.nameEn}</span>
                  </button>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* grid */}
      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <motion.div layout className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* placeholder-prices note + order CTA */}
          <Reveal className="mt-14">
            <div className="glass flex flex-col items-center gap-5 rounded-3xl border-gold/25 p-8 text-center">
              <span className="flex items-center gap-2 font-black text-gold">
                <Info size={20} aria-hidden />
                {t.menuPage.noteTitle}
              </span>
              <p className="max-w-2xl text-sm leading-relaxed text-cream/65">
                {t.menuPage.note}
              </p>
              <a
                href={brand.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-[#25d366] px-7 py-3 font-black text-night transition hover:shadow-[0_15px_40px_-10px_rgba(37,211,102,0.6)]"
              >
                <MessageCircle size={18} aria-hidden />
                {t.menuPage.order}
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
