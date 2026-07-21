"use client";

import { Sparkles } from "lucide-react";

/**
 * Infinite marquee strip. Content is duplicated and translated -50%.
 */
export default function Marquee({
  items,
  variant = "red",
  className = "",
}: {
  items: string[];
  variant?: "red" | "gold" | "outline";
  className?: string;
}) {
  const styles = {
    red: "bg-ember text-cream",
    gold: "bg-gold text-night",
    outline: "bg-transparent border-y border-gold/40 text-gold",
  }[variant];

  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span
          key={`${key}-${i}`}
          className="flex items-center gap-8 px-8 text-lg font-extrabold tracking-wide whitespace-nowrap"
        >
          {item}
          <Sparkles size={15} className="opacity-60" aria-hidden />
        </span>
      ))}
    </div>
  );

  return (
    <div className={`overflow-hidden py-4 ${styles} ${className}`}>
      <div className="marquee-mask">
        <div className="animate-marquee flex w-max">
          {row("a")}
          {row("b")}
        </div>
      </div>
    </div>
  );
}
