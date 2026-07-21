import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    let body: { tableNumber?: unknown; token?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ valid: false, error: "Invalid JSON body" }, { status: 400 });
    }
    const { tableNumber, token } = body;

    const parsedTableNumber = typeof tableNumber === "number" ? tableNumber : Number(tableNumber);
    if (!Number.isInteger(parsedTableNumber) || parsedTableNumber <= 0 || typeof token !== "string" || token.length < 16 || token.length > 128) {
      return NextResponse.json({ valid: false, error: "Missing tableNumber or token" }, { status: 400 });
    }

    const table = await prisma.restaurantTable.findFirst({
      where: {
        tableNumber: parsedTableNumber,
        qrToken: token,
        isActive: true,
      },
      include: { branch: true },
    });

    if (!table) {
      return NextResponse.json({ valid: false, error: "Invalid table or token" }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      table: {
        id: table.id,
        tableNumber: table.tableNumber,
        branchNameAr: table.branch.nameAr,
        branchNameEn: table.branch.nameEn,
      },
    });
  } catch {
    return NextResponse.json({ valid: false, error: "Server error" }, { status: 500 });
  }
}
