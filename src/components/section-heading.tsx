"use client";

import Reveal from "./reveal";

/**
 * Centered section heading: gold eyebrow + big black-weight title + optional sub.
 */
export default function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  align?: "center" | "start";
}) {
  const alignCls =
    align === "center" ? "items-center text-center" : "items-start text-start";
  return (
    <Reveal className={`flex flex-col gap-4 ${alignCls}`}>
      <span className="flex max-w-full items-center gap-2 text-center text-xs font-extrabold tracking-[0.16em] text-gold sm:gap-3 sm:text-sm sm:tracking-[0.25em]">
        <span className="h-px w-5 shrink-0 bg-gold/60 sm:w-8" aria-hidden />
        {eyebrow}
        <span className="h-px w-5 shrink-0 bg-gold/60 sm:w-8" aria-hidden />
      </span>
      <h2 className="max-w-3xl text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {sub && (
        <p className="max-w-2xl text-base leading-relaxed text-cream/65 md:text-lg">
          {sub}
        </p>
      )}
    </Reveal>
  );
}
