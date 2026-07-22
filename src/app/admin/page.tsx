import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./DashboardClient";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [branchCount, menuItemCount, todayOrderCount, tableCount, recentOrders] =
    await Promise.all([
      prisma.branch.count(),
      prisma.menuItem.count(),
      prisma.order.count({ where: { submittedAt: { gte: startOfToday } } }),
      prisma.restaurantTable.count({ where: { isActive: true } }),
      prisma.order.findMany({
        where: { status: { in: ["submitted", "preparing", "ready"] } },
        orderBy: { submittedAt: "desc" },
        take: 5,
        include: {
          table: {
            include: {
              branch: { select: { nameEn: true, nameAr: true } },
            },
          },
          items: {
            include: { menuItem: { select: { nameAr: true, nameEn: true } } },
          },
        },
      }),
    ]);

  const data = {
    branchCount,
    menuItemCount,
    todayOrderCount,
    tableCount,
    recentOrders: JSON.parse(JSON.stringify(recentOrders)),
  };

  return <DashboardClient data={data} />;
}
