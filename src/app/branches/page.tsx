import type { Metadata } from "next";
import BranchesView from "@/components/views/branches-view";
import { getBranch, getSiteContent } from "@/lib/queries";

export const metadata: Metadata = {
  title: "الفرع — عنوان واحد بس",
  description:
    "أبو طارق ملوش فروع: ٤٠ شارع شامبليون، وسط البلد، القاهرة — من 1950. أي مكان تاني بنفس الاسم تقليد.",
};

export default async function BranchesPage() {
  const [branch, brandContent] = await Promise.all([
    getBranch(),
    getSiteContent("brand"),
  ]);

  return (
    <BranchesView
      brand={brandContent as unknown as {
        nameAr: string; nameEn: string; taglineAr: string; taglineEn: string;
        foundedYear: number; founderAr: string; founderEn: string;
        facebook: string; phone: string; whatsapp: string;
      } | null}
      branch={branch}
    />
  );
}
