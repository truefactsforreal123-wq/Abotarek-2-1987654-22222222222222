import { prisma } from "@/lib/prisma";

export async function getBranches() {
  try {
    return await prisma.branch.findMany({ orderBy: { id: "asc" } });
  } catch {
    return null;
  }
}

export async function getBranch() {
  try {
    return await prisma.branch.findFirst({ orderBy: { id: "asc" } });
  } catch {
    return null;
  }
}

export async function getMenuCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        items: {
          where: { available: true },
          orderBy: { id: "asc" },
        },
      },
    });
  } catch {
    return null;
  }
}

export async function getApprovedReviews() {
  try {
    return await prisma.review.findMany({
      where: { approved: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch {
    return null;
  }
}

export async function getSiteContent(key: string) {
  try {
    const item = await prisma.siteContent.findUnique({ where: { key } });
    return item?.value ?? null;
  } catch {
    return null;
  }
}

export async function getAllSiteContent() {
  try {
    const items = await prisma.siteContent.findMany();
    const map: Record<string, unknown> = {};
    for (const item of items) map[item.key] = item.value;
    return map;
  } catch {
    return null;
  }
}
