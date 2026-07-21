"use client";

/* ABOUT — the 1950 cart story, the founder, the timeline */

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Gem, Heart, Medal } from "lucide-react";
import { useLang } from "@/lib/i18n";
import Reveal from "@/components/reveal";
import SectionHeading from "@/components/section-heading";
import Steam from "@/components/steam";

const VALUE_ICONS = [Gem, Medal, Heart];

type TimelineStop = {
  yearAr: string;
  yearEn: string;
  titleAr: string;
  titleEn: string;
  textAr: string;
  textEn: string;
};

export default function AboutView({
  timeline,
}: {
  timeline: TimelineStop[] | null;
}) {
  const { lang, t } = useLang();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  const paragraphs = [t.about.p1, t.about.p2, t.about.p3];

  if (!timeline) return null;

  return (
    <>
      {/* page hero */}
      <section className="relative overflow-hidden pb-16 pt-40">
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
            eyebrow={t.about.eyebrow}
            title={t.about.title}
          />
        </div>
      </section>

      {/* story: portrait + paragraphs */}
      <section className="py-14">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 md:px-6 lg:grid-cols-[340px_1fr]">
          <Reveal>
            <div className="relative mx-auto w-fit">
              <div
                className="absolute inset-0 -translate-x-4 translate-y-4 -rotate-3 rounded-b-[2rem] rounded-t-full border-2 border-royal-light/50 bg-royal/25"
                aria-hidden
              />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="relative aspect-[4/5] w-[min(280px,78vw)] overflow-hidden rounded-b-[2rem] rounded-t-full border-4 border-gold/70 shadow-[0_35px_80px_-25px_rgba(0,0,0,0.9)]"
              >
                <Image
                  src="/images/founder.jpg"
                  alt={lang === "ar" ? "يوسف زكي — أبو طارق" : "Youssef Zaki — Abo Tarek"}
                  fill
                  sizes="280px"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-night/75 via-transparent to-transparent"
                  aria-hidden
                />
                <p className="absolute inset-x-0 bottom-0 p-5 text-center text-lg font-black">
                  {t.founder.title}
                </p>
              </motion.div>
            </div>
          </Reveal>

          <div className="flex flex-col gap-6">
            {paragraphs.map((p, i) => (
              <Reveal key={i} delay={0.1 * i}>
                <p className="text-lg leading-loose text-cream/75">{p}</p>
              </Reveal>
            ))}
            <Reveal delay={0.35}>
              <blockquote className="border-s-4 border-gold ps-5 text-2xl font-bold italic leading-relaxed text-gold-soft">
                {t.founder.quote}
              </blockquote>
            </Reveal>
          </div>
        </div>
      </section>

      {/* timeline */}
      <section className="relative bg-navy py-24">
        <div className="texture-grid absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-4 md:px-6">
          <SectionHeading
            eyebrow={t.about.timelineEyebrow}
            title={t.about.timelineTitle}
          />
          <div className="relative mt-16">
            {/* spine */}
            <div
              className="absolute inset-y-0 start-5 w-px bg-gradient-to-b from-gold via-ember to-transparent md:start-1/2"
              aria-hidden
            />
            <div className="space-y-12">
              {timeline.map((stop, i) => {
                const side = i % 2 === 0;
                return (
                  <Reveal key={i} delay={0.08 * i}>
                    <div
                      className={`relative flex flex-col gap-4 ps-16 md:w-1/2 md:ps-0 ${
                        side
                          ? "md:pe-14 md:text-end md:me-auto"
                          : "md:ps-14 md:text-start md:ms-auto"
                      }`}
                    >
                      {/* node */}
                      <span
                        className={`absolute top-1 start-0 grid h-10 w-10 place-items-center rounded-full border-2 border-gold bg-night text-gold shadow-[0_0_25px_-5px_rgba(246,178,27,0.7)] md:start-auto ${
                          side ? "md:-end-5" : "md:-start-5"
                        }`}
                        aria-hidden
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-gold" />
                      </span>
                      <span className="text-3xl font-black text-gold-grad w-fit">
                        {lang === "ar" ? stop.yearAr : stop.yearEn}
                      </span>
                      <div className="glass rounded-3xl p-6">
                        <h3 className="mb-2 text-xl font-black">
                          {lang === "ar" ? stop.titleAr : stop.titleEn}
                        </h3>
                        <p className="text-sm leading-relaxed text-cream/65">
                          {lang === "ar" ? stop.textAr : stop.textEn}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* values */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading
            eyebrow={t.about.valuesEyebrow}
            title={t.about.valuesTitle}
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {t.about.values.map((v, i) => {
              const Icon = VALUE_ICONS[i];
              return (
                <Reveal key={i} delay={0.1 * i}>
                  <div className="card-lift glass group h-full rounded-3xl p-8 text-center">
                    <span className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-gold/12 text-gold transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12">
                      <Icon size={28} aria-hidden />
                    </span>
                    <h3 className="mb-2 text-xl font-black">{v.title}</h3>
                    <p className="text-sm leading-relaxed text-cream/60">{v.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal className="mt-16 text-center">
            <Link
              href="/menu"
              className="group inline-flex items-center gap-2 rounded-full bg-gold px-8 py-4 font-black text-night transition hover:bg-gold-soft hover:shadow-[0_15px_40px_-10px_rgba(246,178,27,0.6)]"
            >
              {t.hero.ctaMenu}
              <Arrow size={18} className="transition-transform group-hover:-translate-x-1 ltr:group-hover:translate-x-1" aria-hidden />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
