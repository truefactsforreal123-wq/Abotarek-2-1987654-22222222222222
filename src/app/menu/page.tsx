import type { Metadata } from "next";
import MenuView from "@/components/views/menu-view";
import { getMenuCategories, getSiteContent } from "@/lib/queries";

export const metadata: Metadata = {
  title: "المنيو — الكشري والحلويات والمشروبات",
  description:
    "منيو أبو طارق: كشري بكل الأحجام، إضافات، أرز بلبن ومهلبية، وعصير قصب — كل حاجة بتتعمل قدامك منذ 1950.",
};

export default async function MenuPage() {
  const [brandContent, categories] = await Promise.all([
    getSiteContent("brand"),
    getMenuCategories(),
  ]);

  return (
    <MenuView
      brand={brandContent as unknown as {
        nameAr: string; nameEn: string; taglineAr: string; taglineEn: string;
        foundedYear: number; founderAr: string; founderEn: string;
        facebook: string; phone: string; whatsapp: string;
      } | null}
      categories={categories as unknown as {
        id: number; nameAr: string; nameEn: string; order: number; image: string;
        items: {
          id: number; nameAr: string; nameEn: string; descAr: string; descEn: string;
          price: number | null;
          sizes: { label: { ar: string; en: string }; price: number }[] | null;
          image: string; badge: string | null; available: boolean;
        }[];
      }[] | null}
    />
  );
}
