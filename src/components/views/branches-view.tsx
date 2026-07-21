"use client";

/* BRANCHES — one original branch + beware-of-imitations panel */

import Image from "next/image";
import {
  Clock,
  Landmark,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ShieldAlert,
} from "lucide-react";
import FacebookIcon from "@/components/facebook-icon";
import { useLang } from "@/lib/i18n";
import Reveal from "@/components/reveal";
import SectionHeading from "@/components/section-heading";
import Steam from "@/components/steam";
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

export default function BranchesView({
  brand,
  branch,
}: {
  brand: Brand;
  branch: Branch | null;
}) {
  const { lang, t } = useLang();
  if (!brand || !branch) return null;
  const landmarks = lang === "ar"
    ? (branch.landmarksAr as string[])
    : (branch.landmarksEn as string[]);

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
            eyebrow={t.branchesPage.eyebrow}
            title={t.branchesPage.title}
            sub={t.branchesPage.sub}
          />
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:px-6 lg:grid-cols-[1.2fr_1fr]">
          {/* flagship card */}
          <Reveal>
            <div className="card-lift glass flex h-full flex-col gap-7 rounded-[2rem] p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-black">
                  {lang === "ar" ? branch.nameAr : branch.nameEn}
                </h2>
                <span className="stamp shrink-0 rounded-full bg-ember px-4 py-1.5 text-sm font-black text-cream">
                  {t.hero.stamp}
                </span>
              </div>

              <ul className="space-y-5 text-cream/75">
                <li className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold/12 text-gold">
                    <MapPin size={20} aria-hidden />
                  </span>
                  <span>
                    <span className="block text-xs font-bold tracking-widest text-cream/45">
                      {t.branchesPage.address}
                    </span>
                    <span className="font-bold">
                      {lang === "ar" ? branch.addressAr : branch.addressEn}
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold/12 text-gold">
                    <Clock size={20} aria-hidden />
                  </span>
                  <span>
                    <span className="block text-xs font-bold tracking-widest text-cream/45">
                      {t.branchesPage.hours}
                    </span>
                    <span className="font-bold">
                      {lang === "ar" ? branch.hoursAr : branch.hoursEn}
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold/12 text-gold">
                    <Landmark size={20} aria-hidden />
                  </span>
                  <span>
                    <span className="block text-xs font-bold tracking-widest text-cream/45">
                      {t.branchesPage.landmarks}
                    </span>
                    <span className="mt-1.5 flex flex-wrap gap-2">
                      {landmarks.map((l) => (
                        <span
                          key={l}
                          className="rounded-full border border-cream/15 px-3 py-1 text-xs font-bold text-cream/70"
                        >
                          {l}
                        </span>
                      ))}
                    </span>
                  </span>
                </li>
              </ul>

              <div className="mt-auto grid grid-cols-2 gap-3 sm:grid-cols-4">
                <a
                  href={`tel:${brand.phone}`}
                  className="flex items-center justify-center gap-2 rounded-full border border-cream/20 px-4 py-3 text-sm font-black transition hover:border-gold/60 hover:text-gold"
                >
                  <Phone size={16} aria-hidden />
                  {t.branchesPage.call}
                </a>
                <a
                  href={brand.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full bg-[#25d366] px-4 py-3 text-sm font-black text-night transition hover:shadow-[0_12px_30px_-8px_rgba(37,211,102,0.6)]"
                >
                  <MessageCircle size={16} aria-hidden />
                  {t.branchesPage.whatsapp}
                </a>
                <a
                  href={branch.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full bg-gold px-4 py-3 text-sm font-black text-night transition hover:bg-gold-soft"
                >
                  <Navigation size={16} aria-hidden />
                  {t.branchesPage.directions}
                </a>
                <a
                  href={brand.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full border border-cream/20 px-4 py-3 text-sm font-black transition hover:border-gold/60 hover:text-gold"
                >
                  <FacebookIcon size={16} />
                  Facebook
                </a>
              </div>
            </div>
          </Reveal>

          {/* side: logo panel + warning */}
          <div className="flex flex-col gap-8">
            <Reveal delay={0.1}>
              <div className="relative overflow-hidden rounded-[2rem] border border-gold/25 bg-royal/25 p-10 text-center">
                <div
                  className="absolute -top-16 start-1/3 h-44 w-44 rounded-full bg-gold/15 blur-3xl"
                  aria-hidden
                />
                <span className="relative mx-auto block w-fit rounded-3xl bg-white p-5 shadow-2xl">
                  <Image
                    src="/images/logo.png"
                    alt="شعار أبو طارق"
                    width={200}
                    height={118}
                    className="h-auto w-44"
                  />
                </span>
                <p className="relative mt-6 text-lg font-black">
                  {lang === "ar" ? brand.taglineAr : brand.taglineEn}
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="rounded-[2rem] border-2 border-ember/60 bg-ember/10 p-8">
                <span className="mb-4 flex items-center gap-3 text-xl font-black text-ember">
                  <ShieldAlert size={26} aria-hidden />
                  {t.branchesPage.warningTitle}
                </span>
                <p className="leading-relaxed text-cream/75">
                  {t.branchesPage.warning}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
