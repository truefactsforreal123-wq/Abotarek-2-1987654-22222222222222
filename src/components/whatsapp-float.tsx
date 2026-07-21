"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useLang } from "@/lib/i18n";

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

/**
 * Floating WhatsApp action with a pulsing ring.
 */
export default function WhatsAppFloat({ brand }: { brand: Brand }) {
  const { t } = useLang();
  if (!brand) return null;
  return (
    <motion.a
      href={brand.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.whatsapp.aria}
      className="fixed bottom-5 end-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25d366] text-white shadow-[0_12px_35px_-8px_rgba(37,211,102,0.7)]"
      initial={{ scale: 0, rotate: -30 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 14, delay: 1.2 }}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.94 }}
    >
      <span
        className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25d366] opacity-30"
        aria-hidden
      />
      <MessageCircle size={26} aria-hidden />
    </motion.a>
  );
}
