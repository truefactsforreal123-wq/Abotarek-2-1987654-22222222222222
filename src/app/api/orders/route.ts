import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface CartItem {
  menuItemId: number;
  quantity: number;
  selectedSize?: { label: { ar: string; en: string }; price: number };
  notes?: string;
  presets?: string[];
}

export async function POST(request: Request) {
  let body: { tableId?: unknown; token?: unknown; items?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const { tableId, token, items } = body;

    if (typeof tableId !== "string" || typeof token !== "string" || !Array.isArray(items) || items.length === 0 || items.length > 50) {
      return NextResponse.json({ error: "Valid table, token and 1-50 items are required" }, { status: 400 });
    }

    const cartItems = items as CartItem[];
    const ids = cartItems.map((item) => item?.menuItemId);
    if (!ids.every(Number.isInteger)) {
      return NextResponse.json({ error: "Each item must have a valid ID" }, { status: 400 });
    }

    const table = await prisma.restaurantTable.findFirst({
      where: { id: tableId, qrToken: token, isActive: true },
    });
    if (!table) {
      return NextResponse.json({ error: "Table not found or inactive" }, { status: 404 });
    }

    const recentOrder = await prisma.order.findFirst({
      where: {
        tableId,
        submittedAt: { gte: new Date(Date.now() - 5000) },
      },
      select: { id: true },
    });
    if (recentOrder) {
      return NextResponse.json({ error: "Please wait a few seconds before submitting another order" }, { status: 429 });
    }

    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: ids }, available: true },
    });

    const menuMap = new Map(menuItems.map((m) => [m.id, m]));

    const resolvedPrices = new Map<string, number>();
    const resolvedSizes = new Map<string, { label: { ar: string; en: string }; price: number }>();

    for (const item of cartItems) {
      if (!item || typeof item !== "object") {
        return NextResponse.json({ error: "Invalid order item" }, { status: 400 });
      }
      if (!Number.isInteger(item.menuItemId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 50) {
        return NextResponse.json({ error: "Each item must have a valid ID and quantity between 1 and 50" }, { status: 400 });
      }
      if (item.notes !== undefined && (typeof item.notes !== "string" || item.notes.length > 300)) {
        return NextResponse.json({ error: "Item notes must be 300 characters or fewer" }, { status: 400 });
      }
      if (item.presets !== undefined && (!Array.isArray(item.presets) || item.presets.length > 10 || item.presets.some((preset) => typeof preset !== "string" || preset.length > 50))) {
        return NextResponse.json({ error: "Invalid item presets" }, { status: 400 });
      }

      const menuItem = menuMap.get(item.menuItemId);
      if (!menuItem) {
        return NextResponse.json(
          { error: `Menu item ${item.menuItemId} not found or unavailable` },
          { status: 400 }
        );
      }

      let unitPrice = 0;
      if (item.selectedSize) {
        if (
          typeof item.selectedSize !== "object" ||
          !item.selectedSize.label ||
          typeof item.selectedSize.label !== "object" ||
          typeof item.selectedSize.label.en !== "string"
        ) {
          return NextResponse.json({ error: `Invalid size for "${menuItem.nameEn}"` }, { status: 400 });
        }
        const dbSizes = menuItem.sizes as Array<{ label: { ar: string; en: string }; price: number }> | null;
        const matchedSize = dbSizes?.find((s) => s.label.en === item.selectedSize!.label.en);
        if (!matchedSize) {
          return NextResponse.json(
            { error: `Invalid size or price for "${menuItem.nameEn}"` },
            { status: 400 }
          );
        }
        unitPrice = matchedSize.price;
        resolvedSizes.set(`${item.menuItemId}-${item.selectedSize.label.en}`, matchedSize);
      } else if (menuItem.price) {
        unitPrice = menuItem.price;
      } else {
        return NextResponse.json(
          { error: `Size selection required for "${menuItem.nameEn}"` },
          { status: 400 }
        );
      }

      if (unitPrice <= 0) {
        return NextResponse.json(
          { error: `Invalid price for "${menuItem.nameEn}"` },
          { status: 400 }
        );
      }

      resolvedPrices.set(`${item.menuItemId}-${item.selectedSize?.label?.en ?? "single"}`, unitPrice);
    }

    const order = await prisma.order.create({
      data: {
        tableId,
        status: "submitted",
        submittedAt: new Date(),
        items: {
          create: cartItems.map((item) => {
            const key = `${item.menuItemId}-${item.selectedSize?.label?.en ?? "single"}`;
            const unitPrice = resolvedPrices.get(key)!;

            return {
              menuItem: { connect: { id: item.menuItemId } },
              quantity: item.quantity,
              selectedSize: resolvedSizes.get(key),
              notes: item.notes ?? null,
              presets: item.presets ?? undefined,
              priceAtOrder: unitPrice * item.quantity,
            };
          }),
        },
      },
      include: {
        items: {
          include: { menuItem: true },
        },
        table: {
          include: { branch: true },
        },
      },
    });

    return NextResponse.json({
      orderId: order.id,
      tableNumber: order.table.tableNumber,
      branchName: order.table.branch.nameEn,
      items: order.items.map((i) => ({
        name: i.menuItem.nameEn,
        nameAr: i.menuItem.nameAr,
        quantity: i.quantity,
        selectedSize: i.selectedSize,
        notes: i.notes,
        presets: i.presets,
        price: Number(i.priceAtOrder),
      })),
      total: order.items.reduce((s, i) => s + Number(i.priceAtOrder), 0),
      submittedAt: order.submittedAt,
    });
  } catch (err) {
    console.error("Order submission error:", err);
    return NextResponse.json({ error: "Failed to submit order" }, { status: 500 });
  }
}
