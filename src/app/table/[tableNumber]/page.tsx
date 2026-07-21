import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { OrderingPage } from "./OrderingPage";

async function getLang(): Promise<"ar" | "en"> {
  try {
    const h = await headers();
    const acceptLang = h.get("accept-language") ?? "";
    return acceptLang.toLowerCase().includes("ar") ? "ar" : "en";
  } catch {
    return "en";
  }
}

const errorStrings = {
  ar: {
    invalidLink: "رابط QR غير صالح",
    invalidLinkDesc: "كود الـ QR ده فيه مشكلة.",
    invalidQR: "QR غير صالح",
    invalidQRDesc: "كود الـ QR ده مش شغّال. اسأل الموظف عن كود جديد.",
    somethingWrong: "حاجة غلطت",
    somethingWrongDesc: "حاول تاني.",
  },
  en: {
    invalidLink: "Invalid QR link",
    invalidLinkDesc: "This QR code is missing a valid token.",
    invalidQR: "Invalid QR",
    invalidQRDesc: "This QR code is no longer valid. Please ask staff for a new one.",
    somethingWrong: "Something went wrong",
    somethingWrongDesc: "Please try scanning the QR code again.",
  },
} as const;

type Props = {
  params: Promise<{ tableNumber: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function TableOrderingPage({ params, searchParams }: Props) {
  const { tableNumber } = await params;
  const { token } = await searchParams;
  const lang = await getLang();
  const e = errorStrings[lang];

  const tableNum = parseInt(tableNumber);
  if (isNaN(tableNum)) notFound();

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950 p-6">
        <div className="text-center">
          <p className="text-xl font-black text-cream">{e.invalidLink}</p>
          <p className="mt-2 text-sm text-cream/45">{e.invalidLinkDesc}</p>
        </div>
      </div>
    );
  }

  const table = await prisma.restaurantTable.findFirst({
    where: { tableNumber: tableNum, qrToken: token, isActive: true },
    include: { branch: true },
  });

  if (!table) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950 p-6">
        <div className="text-center">
          <p className="text-xl font-black text-cream">{e.invalidQR}</p>
          <p className="mt-2 text-sm text-cream/45">{e.invalidQRDesc}</p>
        </div>
      </div>
    );
  }

  const [categories, orderCounts, systemSettings] = await Promise.all([
    prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        items: {
          where: { available: true },
          orderBy: { id: "asc" },
        },
      },
    }),
    prisma.orderItem.groupBy({
      by: ["menuItemId"],
      _count: { id: true },
    }),
    prisma.systemSetting.findMany(),
  ]);

  const countsMap = new Map(orderCounts.map((o) => [o.menuItemId, o._count.id]));
  const sortedCounts = [...countsMap.values()].sort((a, b) => b - a);
  const threshold = sortedCounts.length > 0 ? Math.max(3, Math.floor(sortedCounts[0] * 0.2)) : 0;
  const popularItemIds = [...countsMap.entries()]
    .filter(([, count]) => count >= threshold)
    .map(([id]) => id);

  const settings: Record<string, unknown> = {};
  for (const s of systemSettings) settings[s.key] = s.value;

  const tableInfo = {
    id: table.id,
    tableNumber: table.tableNumber,
    branchNameAr: table.branch.nameAr,
    branchNameEn: table.branch.nameEn,
    qrToken: table.qrToken,
  };

  return (
    <OrderingPage
      table={tableInfo}
      categories={JSON.parse(JSON.stringify(categories))}
      popularItemIds={popularItemIds}
      liveTrackingEnabled={settings.customer_live_tracking === true || settings.customer_live_tracking === "true"}
    />
  );
}
