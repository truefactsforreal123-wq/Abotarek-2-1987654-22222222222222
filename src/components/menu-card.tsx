"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";

type Size = { label: { ar: string; en: string }; price: number };

type MenuItemData = {
  id: number;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  price: number | null;
  sizes: Size[] | null;
  image: string;
  badge: string | null;
};

function fmt(n: number, lang: string) {
  return n.toLocaleString(lang === "ar" ? "ar-EG" : "en-US");
}

/**
 * Menu card — image, badge, name, description, sizes/prices.
 * Parent grid controls staggering; this handles hover lift + image zoom.
 */
export default function MenuCard({ item }: { item: MenuItemData }) {
  const { lang, t } = useLang();
  const name = lang === "ar" ? item.nameAr : item.nameEn;
  const desc = lang === "ar" ? item.descAr : item.descEn;
  const badge = item.badge;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 26, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="card-lift group relative flex flex-col overflow-hidden rounded-3xl border border-cream/10 bg-navy-2"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={item.image}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-navy-2 via-transparent to-transparent"
          aria-hidden
        />
        {badge && (
          <span className="stamp absolute top-3 start-3 rounded-full bg-ember px-3.5 py-1 text-xs font-black text-cream">
            {badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-extrabold">{name}</h3>
          {item.price != null && (
            <span className="shrink-0 text-lg font-black text-gold">
              {fmt(item.price, lang)}{" "}
              <span className="text-xs font-bold">{t.menuPage.egp}</span>
            </span>
          )}
        </div>

        <p className="mt-2 flex-1 text-sm leading-relaxed text-cream/60">{desc}</p>

        {item.sizes && item.sizes.length > 0 && (
          <div className="mt-4">
            <span className="mb-2 block text-[11px] font-bold tracking-widest text-cream/45">
              {t.menuPage.sizes}
            </span>
            <div className="flex flex-wrap gap-2">
              {item.sizes.map((s) => (
                <span
                  key={s.label.en}
                  className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-bold text-gold"
                >
                  {lang === "ar" ? s.label.ar : s.label.en} · {fmt(s.price, lang)} {t.menuPage.egp}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.article>
  );
}
