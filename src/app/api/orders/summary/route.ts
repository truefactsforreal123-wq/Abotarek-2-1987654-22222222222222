import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dateStr = new URL(request.url).searchParams.get("date");
    if (!dateStr) {
      return NextResponse.json({ error: "date param required (YYYY-MM-DD)" }, { status: 400 });
    }

    const dayStart = new Date(dateStr + "T00:00:00.000Z");
    const dayEnd = new Date(dateStr + "T23:59:59.999Z");

    if (isNaN(dayStart.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const orders = await prisma.order.findMany({
      where: { submittedAt: { gte: dayStart, lte: dayEnd } },
      include: {
        items: { include: { menuItem: true } },
        table: { include: { branch: true } },
      },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + Number(i.priceAtOrder), 0),
      0
    );
    const itemsSold = orders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
      0
    );

    const itemCountMap = new Map<string, { nameEn: string; nameAr: string; quantity: number; revenue: number }>();
    for (const order of orders) {
      for (const item of order.items) {
        const key = item.menuItem.nameEn;
        const existing = itemCountMap.get(key);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += Number(item.priceAtOrder);
        } else {
          itemCountMap.set(key, {
            nameEn: item.menuItem.nameEn,
            nameAr: item.menuItem.nameAr,
            quantity: item.quantity,
            revenue: Number(item.priceAtOrder),
          });
        }
      }
    }
    const topItems = [...itemCountMap.values()]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const branchOrderMap = new Map<string, { nameEn: string; nameAr: string; count: number; revenue: number }>();
    for (const order of orders) {
      const bName = order.table.branch.nameEn;
      const existing = branchOrderMap.get(bName);
      if (existing) {
        existing.count += 1;
        existing.revenue += order.items.reduce((s, i) => s + Number(i.priceAtOrder), 0);
      } else {
        branchOrderMap.set(bName, {
          nameEn: order.table.branch.nameEn,
          nameAr: order.table.branch.nameAr,
          count: 1,
          revenue: order.items.reduce((s, i) => s + Number(i.priceAtOrder), 0),
        });
      }
    }
    const branchStats = [...branchOrderMap.values()].sort((a, b) => b.count - a.count);

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      itemsSold,
      topItems,
      branchStats,
    });
  } catch (err) {
    console.error("Summary error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
