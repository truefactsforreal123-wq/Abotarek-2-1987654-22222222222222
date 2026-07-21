"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

/**
 * Logo preloader — shows once per session, then exits with a clip-path wipe.
 * The logo PNG has a white background, so it sits on a white "signage" card.
 */
export default function Preloader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem("abotarek-seen")) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(true);
    const timer = setTimeout(() => {
      window.sessionStorage.setItem("abotarek-seen", "1");
      setShow(false);
    }, 2100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] grid place-items-center bg-night"
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden={!show}
        >
          {/* ambient glow */}
          <div className="absolute inset-0 overflow-hidden" aria-hidden>
            <div className="absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-royal/40 blur-3xl animate-glow" />
          </div>

          <div className="relative flex flex-col items-center gap-6">
            <motion.div
              initial={{ scale: 0.55, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 16 }}
              className="rounded-3xl bg-white p-5 shadow-[0_30px_80px_-20px_rgba(246,178,27,0.45)]"
            >
              <Image
                src="/images/logo.png"
                alt="شعار أبو طارق — Abo Tarek logo"
                width={200}
                height={118}
                priority
                className="h-auto w-44 md:w-52"
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-sm font-bold tracking-[0.3em] text-gold"
            >
              الأصل منذ 1950
            </motion.p>

            {/* gold progress bar */}
            <div className="h-1 w-48 overflow-hidden rounded-full bg-cream/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-l from-gold to-ember"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.7, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
