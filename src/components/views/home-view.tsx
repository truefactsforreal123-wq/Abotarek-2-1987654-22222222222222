"use client";

/* ============================================================
   HOME — cinematic hero + marquee + features + showcase
   Techniques: staggered entrance, depth layers, steam particles,
   float loops, clip reveals, counters, marquee, hover glow.
   ============================================================ */

import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import { motion, type Variants } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Clock,
  Crown,
  Flame,
  Heart,
  Landmark,
  MapPin,
  MessageCircle,
  Navigation,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import FacebookIcon from "@/components/facebook-icon";
import Steam from "@/components/steam";
import Marquee from "@/components/marquee";
import Reveal from "@/components/reveal";
import SectionHeading from "@/components/section-heading";
import StatsBand from "@/components/counters";
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

type Stat = {
  id: string;
  from: number;
  to: number;
  suffixAr: string;
  suffixEn: string;
  labelAr: string;
  labelEn: string;
};

type GalleryItem = {
  src: string;
  altAr: string;
  altEn: string;
  credit: string;
};

const EASE = [0.22, 1, 0.36, 1] as const;

const heroContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } },
};
const heroItem: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

const FEATURE_ICONS = [Crown, Flame, Landmark, Heart];

export default function HomeView({
  brand,
  branch,
  stats,
  gallery,
}: {
  brand: Brand;
  branch: Branch | null;
  stats: Stat[] | null;
  gallery: GalleryItem[] | null;
}) {
  const { lang, t } = useLang();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  const minis = [t.hero.mini1, t.hero.mini2, t.hero.mini3];
  const miniIcons = [MapPin, Clock, Landmark];

  if (!brand || !branch || !gallery) return null;

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="relative flex min-h-svh items-center overflow-hidden pb-20 pt-32">
        {/* depth-0: background texture + gradients */}
        <div className="texture-grid absolute inset-0 opacity-60" aria-hidden />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 70% 10%, rgba(43,46,122,0.55), transparent 70%), radial-gradient(45% 40% at 15% 85%, rgba(229,50,34,0.22), transparent 70%), radial-gradient(40% 35% at 85% 80%, rgba(246,178,27,0.12), transparent 70%)",
          }}
          aria-hidden
        />
        {/* depth-1: steam ambience */}
        <Steam />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-16 px-4 md:px-6 lg:grid-cols-2">
          {/* depth-4: text */}
          <motion.div
            variants={heroContainer}
            initial="hidden"
            animate="show"
            className="flex flex-col items-start gap-7"
          >
            <motion.span
              variants={heroItem}
              className="flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-sm font-extrabold text-gold"
            >
              <Crown size={16} aria-hidden />
              {t.hero.badge}
            </motion.span>

            <motion.h1
              variants={heroItem}
              className="text-[clamp(2.75rem,15vw,4.5rem)] font-black leading-[1.05] lg:text-8xl"
            >
              <span className="text-gold-grad block">{t.hero.titleA}</span>
              <span className="block">{t.hero.titleB}</span>
            </motion.h1>

            <motion.p
              variants={heroItem}
              className="max-w-xl text-lg leading-relaxed text-cream/70"
            >
              {t.hero.sub}
            </motion.p>

            <motion.div variants={heroItem} className="flex flex-wrap gap-4">
              <Link
                href="/menu"
                className="group flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 font-black text-night transition-all hover:bg-gold-soft hover:shadow-[0_15px_40px_-10px_rgba(246,178,27,0.6)]"
              >
                {t.hero.ctaMenu}
                <Arrow size={18} className="transition-transform group-hover:-translate-x-1 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1" aria-hidden />
              </Link>
              <Link
                href="/about"
                className="rounded-full border border-cream/25 px-7 py-3.5 font-bold text-cream transition hover:border-gold/60 hover:text-gold"
              >
                {t.hero.ctaStory}
              </Link>
            </motion.div>

            <motion.div
              variants={heroItem}
              className="mt-2 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm font-bold text-cream/55"
            >
              {minis.map((m, i) => {
                const Icon = miniIcons[i];
                return (
                  <span key={i} className="flex items-center gap-2">
                    <Icon size={16} className="text-gold" aria-hidden />
                    {m}
                  </span>
                );
              })}
            </motion.div>
          </motion.div>

          {/* depth-3: founder portrait + floating logo + stamp */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: EASE }}
            className="relative mx-auto w-fit"
          >
            {/* offset frame behind */}
            <div
              className="absolute inset-0 translate-x-5 translate-y-5 rotate-3 rounded-b-[2.5rem] rounded-t-full border-2 border-royal-light/50 bg-royal/30"
              aria-hidden
            />
            {/* arch portrait (the authentic guy) */}
            <div className="relative aspect-[4/5] w-[min(280px,78vw)] overflow-hidden rounded-b-[2.5rem] rounded-t-full border-4 border-gold/70 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)] sm:w-[340px]">
              <Image
                src="/images/founder.jpg"
                alt={lang === "ar" ? "يوسف زكي — أبو طارق" : "Youssef Zaki — Abo Tarek"}
                fill
                priority
                sizes="(max-width: 640px) 280px, 340px"
                className="object-cover"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-transparent"
                aria-hidden
              />
              <div className="absolute inset-x-0 bottom-0 p-5 text-center">
                <p className="text-lg font-black">{t.founder.title}</p>
                <p className="text-xs font-bold tracking-[0.3em] text-gold">
                  {t.hero.since}
                </p>
              </div>
            </div>

            {/* floating logo card */}
            <motion.div
              className="absolute -bottom-7 -start-7 rounded-2xl bg-white p-3 shadow-2xl"
              style={{ "--float-rot": "-6deg" } as CSSProperties}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src="/images/logo.png"
                alt=""
                width={96}
                height={57}
                className="h-auto w-24"
              />
            </motion.div>

            {/* الأصل stamp */}
            <motion.div
              className="stamp absolute -end-5 top-8 grid h-24 w-24 place-items-center rounded-full bg-ember text-center text-cream"
              animate={{ y: [0, -10, 0], rotate: [12, 8, 12] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              <span>
                <Crown size={20} className="mx-auto mb-1" aria-hidden />
                <span className="text-lg font-black">{t.hero.stamp}</span>
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-cream/45"
        >
          <span className="text-[11px] font-bold tracking-[0.25em]">
            {t.hero.scroll}
          </span>
          <ChevronDown size={18} className="animate-bounce-soft" aria-hidden />
        </motion.div>
      </section>

      {/* ================= MARQUEE STRIPS ================= */}
      <div className="relative -my-4">
        <div className="-rotate-1 scale-x-105">
          <Marquee items={t.marquee} variant="red" />
        </div>
        <div className="-mt-2 rotate-[0.6deg] scale-x-105">
          <Marquee items={[...t.marquee].reverse()} variant="gold" />
        </div>
      </div>

      {/* ================= FEATURES ================= */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading
            eyebrow={t.features.eyebrow}
            title={t.features.title}
            sub={t.features.sub}
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {t.features.items.map((f, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="card-lift glass group h-full rounded-3xl p-7">
                    <span className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gold/12 text-gold transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110">
                      <Icon size={26} aria-hidden />
                    </span>
                    <h3 className="mb-2.5 text-lg font-black">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-cream/60">{f.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= SHOWCASE ================= */}
      <section className="relative overflow-hidden bg-navy py-24">
        <div
          className="absolute -start-32 top-1/3 h-96 w-96 rounded-full bg-ember/12 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            {/* text */}
            <div className="flex flex-col items-start gap-6">
              <SectionHeading
                eyebrow={t.showcase.eyebrow}
                title={t.showcase.title}
                align="start"
              />
              <Reveal delay={0.15}>
                <p className="max-w-xl text-lg leading-relaxed text-cream/70">
                  {t.showcase.text}
                </p>
              </Reveal>
              <Reveal delay={0.25}>
                <Link
                  href="/menu"
                  className="group flex items-center gap-2 rounded-full bg-ember px-7 py-3.5 font-black text-cream transition-all hover:bg-ember-dark hover:shadow-[0_15px_40px_-10px_rgba(229,50,34,0.6)]"
                >
                  {t.showcase.cta}
                  <Arrow size={18} className="transition-transform group-hover:-translate-x-1 ltr:group-hover:translate-x-1" aria-hidden />
                </Link>
              </Reveal>
              <Reveal delay={0.35}>
                <p className="text-xs text-cream/40">{t.showcase.note}</p>
              </Reveal>
            </div>

            {/* main plate */}
            <Reveal delay={0.1}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.5 }}
                className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-gold/25 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]"
              >
                <Image
                  src={gallery[0].src}
                  alt={lang === "ar" ? gallery[0].altAr : gallery[0].altEn}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-night/60 via-transparent to-transparent"
                  aria-hidden
                />
                <span className="stamp absolute bottom-4 start-4 rounded-full bg-ember px-4 py-1.5 text-sm font-black text-cream">
                  {t.hero.stamp} · 1950
                </span>
              </motion.div>
            </Reveal>
          </div>

          {/* gallery row */}
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {gallery.slice(1).map((g, i) => (
              <Reveal key={g.src} delay={0.12 * i}>
                <div className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-cream/10">
                  <Image
                    src={g.src}
                    alt={lang === "ar" ? g.altAr : g.altEn}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div
                    className="absolute inset-0 bg-royal/25 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    aria-hidden
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      {stats && <StatsBand stats={stats} />}

      {/* ================= FOUNDER BAND ================= */}
      <section className="relative overflow-hidden py-24">
        <span
          className="pointer-events-none absolute -end-10 top-1/2 -translate-y-1/2 select-none text-[16rem] font-black leading-none text-cream/[0.04]"
          aria-hidden
        >
          1950
        </span>
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 md:px-6 lg:grid-cols-[300px_1fr]">
          <Reveal>
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="relative mx-auto aspect-[4/5] w-60 overflow-hidden rounded-b-[2rem] rounded-t-full border-4 border-gold/60 shadow-[0_30px_70px_-25px_rgba(0,0,0,0.9)]"
            >
              <Image
                src="/images/founder.jpg"
                alt={lang === "ar" ? "يوسف زكي — أبو طارق" : "Youssef Zaki — Abo Tarek"}
                fill
                sizes="240px"
                className="object-cover"
              />
            </motion.div>
          </Reveal>

          <div className="flex flex-col items-start gap-6 text-center lg:text-start">
            <SectionHeading
              eyebrow={t.founder.eyebrow}
              title={t.founder.title}
              align="start"
            />
            <Reveal delay={0.15}>
              <blockquote className="border-s-4 border-gold ps-5 text-2xl font-bold italic leading-relaxed text-gold-soft">
                {t.founder.quote}
              </blockquote>
            </Reveal>
            <Reveal delay={0.25}>
              <p className="max-w-2xl leading-relaxed text-cream/65">
                {t.founder.text}
              </p>
            </Reveal>
            <Reveal delay={0.35}>
              <Link
                href="/about"
                className="group flex items-center gap-2 font-black text-gold transition hover:text-gold-soft"
              >
                {t.founder.cta}
                <Arrow size={18} className="transition-transform group-hover:-translate-x-1 ltr:group-hover:translate-x-1" aria-hidden />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= CTA / SOCIAL ================= */}
      <section className="pb-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <Reveal>
            <div className="glass relative overflow-hidden rounded-[2.5rem] px-8 py-14 text-center">
              <div
                className="absolute -top-20 start-1/4 h-56 w-56 rounded-full bg-ember/20 blur-3xl"
                aria-hidden
              />
              <div
                className="absolute -bottom-20 end-1/4 h-56 w-56 rounded-full bg-gold/15 blur-3xl"
                aria-hidden
              />
              <Steam />
              <div className="relative flex flex-col items-center gap-6">
                <h2 className="max-w-2xl text-3xl font-black leading-tight md:text-5xl">
                  {t.cta.title}
                </h2>
                <p className="max-w-xl text-cream/65">{t.cta.text}</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a
                    href={brand.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-full bg-[#25d366] px-7 py-3.5 font-black text-night transition hover:shadow-[0_15px_40px_-10px_rgba(37,211,102,0.6)]"
                  >
                    <MessageCircle size={18} aria-hidden />
                    {t.cta.whatsapp}
                  </a>
                  <a
                    href={branch.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 font-black text-night transition hover:bg-gold-soft"
                  >
                    <Navigation size={18} aria-hidden />
                    {t.cta.directions}
                  </a>
                  <a
                    href={brand.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-full border border-cream/25 px-7 py-3.5 font-bold transition hover:border-gold/60 hover:text-gold"
                  >
                    <FacebookIcon size={18} />
                    {t.cta.facebook}
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
