import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import { UnseenOrdersProvider } from "./UnseenOrdersProvider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [soundSetting, tables] = await Promise.all([
    prisma.systemSetting.findUnique({
      where: { key: "staff_sound_alerts" },
      select: { value: true },
    }),
    prisma.restaurantTable.findMany({
      select: { id: true, branch: { select: { nameEn: true } } },
    }),
  ]);

  const soundEnabled =
    soundSetting?.value === true || soundSetting?.value === "true";

  return (
    <UnseenOrdersProvider
      initialSoundEnabled={soundEnabled}
      tableBranches={tables.map((t) => ({
        tableId: t.id,
        branchName: t.branch.nameEn,
      }))}
    >
      <div className="flex h-screen bg-ink-950 text-paper">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-ink-900 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </UnseenOrdersProvider>
  );
}
