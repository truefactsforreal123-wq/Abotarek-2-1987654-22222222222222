"use client";

/**
 * Rising koshari-pot steam particles (depth-1 ambience).
 * Deterministic preset config → no hydration mismatch, GPU-only transforms.
 */
const PARTICLES = [
  { x: 8, size: 90, delay: "0s", dur: "6.5s" },
  { x: 16, size: 60, delay: "1.2s", dur: "7.2s" },
  { x: 26, size: 110, delay: "2.4s", dur: "6s" },
  { x: 38, size: 70, delay: "0.6s", dur: "7.8s" },
  { x: 50, size: 95, delay: "1.8s", dur: "6.8s" },
  { x: 62, size: 65, delay: "3s", dur: "7.4s" },
  { x: 74, size: 105, delay: "0.9s", dur: "6.2s" },
  { x: 86, size: 75, delay: "2.1s", dur: "7s" },
  { x: 94, size: 55, delay: "3.6s", dur: "6.6s" },
];

export default function Steam({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="steam-dot animate-steam absolute bottom-0"
          style={{
            insetInlineStart: `${p.x}%`,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.dur,
          }}
        />
      ))}
    </div>
  );
}
