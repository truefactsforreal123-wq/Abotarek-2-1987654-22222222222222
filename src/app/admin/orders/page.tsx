import { prisma } from "@/lib/prisma";
import { OrdersDashboard } from "./OrdersDashboard";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const [activeOrders, servedOrders, settings, allBranches] = await Promise.all([
    prisma.order.findMany({
      where: { status: { in: ["submitted", "preparing", "ready"] } },
      include: {
        items: { include: { menuItem: true } },
        table: { include: { branch: true } },
      },
      orderBy: { submittedAt: "asc" },
    }),
    prisma.order.findMany({
      where: { status: "served" },
      include: {
        items: { include: { menuItem: true } },
        table: { include: { branch: true } },
      },
      orderBy: { servedAt: "desc" },
      take: 50,
    }),
    prisma.systemSetting.findMany(),
    prisma.branch.findMany({
      orderBy: { id: "asc" },
      select: { id: true, nameEn: true, nameAr: true },
    }),
  ]);

  const settingsMap: Record<string, unknown> = {};
  for (const s of settings) settingsMap[s.key] = s.value;

  return (
    <div>
      <OrdersDashboard
        initialActive={JSON.parse(JSON.stringify(activeOrders))}
        initialServed={JSON.parse(JSON.stringify(servedOrders))}
        historyTTL={Number(settingsMap.order_history_ttl_hours) || 4}
        allBranches={allBranches}
      />
    </div>
  );
}
