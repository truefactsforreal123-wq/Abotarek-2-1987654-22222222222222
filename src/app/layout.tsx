import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { LayoutShell } from "./LayoutShell";
import { getBranch, getSiteContent } from "@/lib/queries";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "أبو طارق — ملك الكشري | Abo Tarek, King of Koshari",
    template: "%s | أبو طارق — Abo Tarek",
  },
  description:
    "كشري أبو طارق — الأصل منذ 1950. فرع واحد فقط في شارع شامبليون، وسط البلد، القاهرة. The original Abo Tarek Koshari since 1950.",
  icons: { icon: "/images/logo.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#090c22",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [branch, brandContent] = await Promise.all([
    getBranch(),
    getSiteContent("brand"),
  ]);

  const brand = brandContent as {
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

  return (
    <html
      lang="ar"
      dir="rtl"
      data-scroll-behavior="smooth"
      className={`${cairo.variable} h-full antialiased`}
    >
      <body className="flex min-h-svh flex-col bg-night font-sans text-cream">
        <LayoutShell brand={brand} branch={branch}>
          {children}
        </LayoutShell>
      </body>
    </html>
  );
}
