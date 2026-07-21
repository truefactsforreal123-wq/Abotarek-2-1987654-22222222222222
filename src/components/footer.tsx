"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import FacebookIcon from "./facebook-icon";
import { useLang } from "@/lib/i18n";
import type { Branch } from "@prisma/client";

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

export default function Footer({ brand, branch }: { brand: Brand; branch: Branch | null }) {
  const { lang, t } = useLang();
  const year = new Date().getFullYear();

  if (!brand || !branch) return null;

  return (
    <footer className="relative border-t border-gold/15 bg-night">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-3 md:px-6">
        {/* brand */}
        <div className="flex flex-col items-start gap-5">
          <span className="rounded-2xl bg-white p-2.5 shadow-xl">
            <Image
              src="/images/logo.png"
              alt="شعار أبو طارق"
              width={96}
              height={57}
              className="h-auto w-24"
            />
          </span>
          <p className="max-w-sm text-sm leading-relaxed text-cream/65">
            {t.footer.about}
          </p>
          <div className="flex gap-3">
            <a
              href={brand.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="grid h-11 w-11 place-items-center rounded-full border border-cream/15 text-cream/80 transition hover:border-gold hover:text-gold"
            >
              <FacebookIcon size={19} />
            </a>
            <a
              href={brand.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="grid h-11 w-11 place-items-center rounded-full border border-cream/15 text-cream/80 transition hover:border-gold hover:text-gold"
            >
              <MessageCircle size={19} aria-hidden />
            </a>
          </div>
        </div>

        {/* quick links */}
        <div>
          <h3 className="mb-5 text-lg font-black text-gold">{t.footer.links}</h3>
          <ul className="space-y-3 text-sm font-bold text-cream/70">
            <li><Link className="transition hover:text-gold" href="/">{t.nav.home}</Link></li>
            <li><Link className="transition hover:text-gold" href="/about">{t.nav.about}</Link></li>
            <li><Link className="transition hover:text-gold" href="/menu">{t.nav.menu}</Link></li>
            <li><Link className="transition hover:text-gold" href="/branches">{t.nav.branches}</Link></li>
          </ul>
        </div>

        {/* contact */}
        <div>
          <h3 className="mb-5 text-lg font-black text-gold">{t.footer.contact}</h3>
          <ul className="space-y-4 text-sm text-cream/70">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-gold" aria-hidden />
              {lang === "ar" ? branch.addressAr : branch.addressEn}
            </li>
            <li className="flex items-center gap-3">
              <Clock size={18} className="shrink-0 text-gold" aria-hidden />
              {lang === "ar" ? branch.hoursAr : branch.hoursEn}
            </li>
            <li>
              <a href={`tel:${brand.phone}`} className="flex items-center gap-3 transition hover:text-gold" dir="ltr">
                <Phone size={18} className="shrink-0 text-gold" aria-hidden />
                {brand.phone}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-cream/45 md:flex-row md:px-6">
          <p>
            © {year} {lang === "ar" ? brand.nameAr : brand.nameEn} — {t.footer.rights}
          </p>
          <p className="max-w-xl text-center md:text-end">{t.footer.credits}</p>
        </div>
      </div>
    </footer>
  );
}
