import type { Metadata } from "next";
import AboutView from "@/components/views/about-view";
import { getSiteContent } from "@/lib/queries";

export const metadata: Metadata = {
  title: "حكايتنا — من عربة خشب لأسطورة",
  description:
    "حكاية أبو طارق منذ 1950: يوسف زكي وعربة الكشري الخشب اللي بقت أشهر عنوان كشري في مصر — شارع شامبليون، وسط البلد.",
};

export default async function AboutPage() {
  const timelineContent = await getSiteContent("timeline");

  return <AboutView timeline={timelineContent as unknown as { yearAr: string; yearEn: string; titleAr: string; titleEn: string; textAr: string; textEn: string; }[] | null} />;
}
