import type { Metadata } from "next";
import HomeView from "@/components/views/home-view";
import { getBranch, getSiteContent } from "@/lib/queries";

export const metadata: Metadata = {
  title: "الرئيسية — ملك الكشري منذ 1950",
  description:
    "أبو طارق — الأصل منذ 1950. أشهر عنوان كشري في مصر: شارع شامبليون، وسط البلد، القاهرة. Abo Tarek, King of Koshari — one branch only, Downtown Cairo.",
};

export default async function HomePage() {
  const [branch, brandContent, statsContent, galleryContent] = await Promise.all([
    getBranch(),
    getSiteContent("brand"),
    getSiteContent("stats"),
    getSiteContent("gallery"),
  ]);

  return (
    <HomeView
      brand={brandContent as unknown as {
        nameAr: string; nameEn: string; taglineAr: string; taglineEn: string;
        foundedYear: number; founderAr: string; founderEn: string;
        facebook: string; phone: string; whatsapp: string;
      } | null}
      branch={branch}
      stats={statsContent as unknown as {
        id: string; from: number; to: number; suffixAr: string; suffixEn: string;
        labelAr: string; labelEn: string;
      }[] | null}
      gallery={galleryContent as unknown as {
        src: string; altAr: string; altEn: string; credit: string;
      }[] | null}
    />
  );
}
