"use client";

import { usePathname } from "next/navigation";
import { LanguageProvider } from "@/lib/i18n";
import Preloader from "@/components/preloader";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import WhatsAppFloat from "@/components/whatsapp-float";
import type { Branch } from "@prisma/client";

const PUBLIC_PREFIXES = ["/", "/about", "/menu", "/branches"];

function isPublicRoute(pathname: string) {
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname === p + "/"
  );
}

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
};

export function LayoutShell({
  children,
  brand,
  branch,
}: {
  children: React.ReactNode;
  brand: Brand | null;
  branch: Branch | null;
}) {
  const pathname = usePathname();
  const showPublicLayout = isPublicRoute(pathname);

  return (
    <LanguageProvider>
      {showPublicLayout && <Preloader />}
      {showPublicLayout && <Navbar brand={brand} />}
      <main className="flex-1">{children}</main>
      {showPublicLayout && <Footer brand={brand} branch={branch} />}
      {showPublicLayout && <WhatsAppFloat brand={brand} />}
    </LanguageProvider>
  );
}
