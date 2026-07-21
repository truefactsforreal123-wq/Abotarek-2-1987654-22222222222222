import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { MenuManagementClient } from "./MenuManagementClient";

export default async function MenuPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const categories = await prisma.category.findMany({
    include: { items: { orderBy: { id: "asc" } } },
    orderBy: { order: "asc" },
  });

  return (
    <MenuManagementClient
      categories={JSON.parse(JSON.stringify(categories))}
    />
  );
}
