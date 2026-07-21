"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";
import { useLang } from "@/lib/i18n";
import Reveal from "./reveal";
import SectionHeading from "./section-heading";

type Stat = {
  id: string;
  from: number;
  to: number;
  suffixAr: string;
  suffixEn: string;
  labelAr: string;
  labelEn: string;
};

function CountUp({ from, to, suffix }: { from: number; to: number; suffix: string }) {
  const { lang } = useLang();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [val, setVal] = useState(from);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(from, to, {
      duration: 2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, from, to]);

  return (
    <span ref={ref} dir="ltr">
      {val.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}
      {suffix}
    </span>
  );
}

/**
 * Animated stats band (76+ years · 1 branch · 1950 · 100% original).
 */
export default function StatsBand({ stats }: { stats: Stat[] }) {
  const { lang, t } = useLang();
  return (
    <section className="relative overflow-hidden border-y border-gold/15 bg-navy py-20">
      <div
        className="absolute -top-24 start-1/4 h-64 w-64 rounded-full bg-gold/10 blur-3xl"
        aria-hidden
      />
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading eyebrow={t.statsBand.eyebrow} title={t.statsBand.title} />
        <div className="mt-14 grid grid-cols-2 gap-3 sm:gap-8 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.1}>
              <div className="glass flex flex-col items-center gap-2 rounded-3xl px-3 py-6 text-center sm:px-6 sm:py-8">
                <span className="text-4xl font-black text-gold sm:text-5xl md:text-6xl">
                  <CountUp
                    from={s.from}
                    to={s.to}
                    suffix={lang === "ar" ? s.suffixAr : s.suffixEn}
                  />
                </span>
                <span className="text-sm font-bold text-cream/65">
                  {lang === "ar" ? s.labelAr : s.labelEn}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
