"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { deleteMenuImage } from "@/lib/storage";
import crypto from "crypto";

async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
}

export async function createCategory(data: {
  nameAr: string;
  nameEn: string;
  order: number;
  image: string;
}) {
  await requireAuth();
  const category = await prisma.category.create({
    data,
    include: { items: true },
  });
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  return category;
}

export async function updateCategory(
  id: number,
  data: {
    nameAr?: string;
    nameEn?: string;
    order?: number;
    image?: string;
  },
) {
  await requireAuth();
  if (data.image !== undefined) {
    const old = await prisma.category.findUnique({ where: { id }, select: { image: true } });
    if (old?.image && old.image !== data.image) await deleteMenuImage(old.image);
  }
  const category = await prisma.category.update({
    where: { id },
    data,
  });
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  return category;
}

export async function deleteCategory(id: number) {
  await requireAuth();
  const category = await prisma.category.findUnique({ where: { id }, select: { image: true } });
  if (category?.image) await deleteMenuImage(category.image);
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
}

export async function createMenuItem(input: {
  categoryId: number;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  price?: number;
  sizes?: Prisma.InputJsonValue;
  image: string;
  badge?: string;
}) {
  await requireAuth();
  const data: Prisma.MenuItemUncheckedCreateInput = {
    categoryId: input.categoryId,
    nameAr: input.nameAr,
    nameEn: input.nameEn,
    descAr: input.descAr,
    descEn: input.descEn,
    image: input.image,
    price: input.price,
    sizes: input.sizes,
    badge: input.badge,
  };
  const item = await prisma.menuItem.create({ data });
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  return item;
}

export async function updateMenuItem(
  id: number,
  input: {
    categoryId?: number;
    nameAr?: string;
    nameEn?: string;
    descAr?: string;
    descEn?: string;
    price?: number | null;
    sizes?: Prisma.InputJsonValue | null;
    image?: string;
    badge?: string | null;
    available?: boolean;
  },
) {
  await requireAuth();
  const data: Prisma.MenuItemUncheckedUpdateInput = {};
  if (input.image !== undefined) {
    const old = await prisma.menuItem.findUnique({ where: { id }, select: { image: true } });
    if (old?.image && old.image !== input.image) await deleteMenuImage(old.image);
    data.image = input.image;
  }
  if (input.categoryId !== undefined) data.categoryId = input.categoryId;
  if (input.nameAr !== undefined) data.nameAr = input.nameAr;
  if (input.nameEn !== undefined) data.nameEn = input.nameEn;
  if (input.descAr !== undefined) data.descAr = input.descAr;
  if (input.descEn !== undefined) data.descEn = input.descEn;
  if (input.price !== undefined) data.price = input.price;
  if (input.sizes !== undefined) data.sizes = input.sizes as Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;
  if (input.badge !== undefined) data.badge = input.badge;
  if (input.available !== undefined) data.available = input.available;

  const item = await prisma.menuItem.update({ where: { id }, data });
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  return item;
}

export async function deleteMenuItem(id: number) {
  await requireAuth();
  const item = await prisma.menuItem.findUnique({ where: { id }, select: { image: true } });
  if (item?.image) await deleteMenuImage(item.image);
  await prisma.menuItem.delete({ where: { id } });
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
}

export async function toggleMenuItemAvailability(id: number) {
  await requireAuth();
  const item = await prisma.menuItem.findUnique({ where: { id } });
  if (!item) throw new Error("Item not found");
  const updated = await prisma.menuItem.update({
    where: { id },
    data: { available: !item.available },
  });
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  return updated;
}

export async function updateBranch(
  id: number,
  data: {
    number?: string;
    nameAr?: string;
    nameEn?: string;
    addressAr?: string;
    addressEn?: string;
    phone?: string;
    whatsapp?: string;
    mapsUrl?: string;
  },
) {
  await requireAuth();
  const branch = await prisma.branch.update({
    where: { id },
    data,
  });
  revalidatePath("/admin/branches");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/tables");
  revalidatePath("/admin/reviews");
  revalidatePath("/branches");
  revalidatePath("/");
  return branch;
}

export async function createBranch(data: {
  number: string;
  nameAr: string;
  nameEn: string;
  addressAr: string;
  addressEn: string;
  phone: string;
  whatsapp: string;
  mapsUrl: string;
}) {
  await requireAuth();
  const branch = await prisma.branch.create({ data });
  revalidatePath("/admin/branches");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/tables");
  revalidatePath("/admin/reviews");
  revalidatePath("/branches");
  revalidatePath("/");
  return branch;
}

export async function deleteBranch(id: number) {
  await requireAuth();
  await prisma.branch.delete({ where: { id } });
  revalidatePath("/admin/branches");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/tables");
  revalidatePath("/admin/reviews");
  revalidatePath("/branches");
  revalidatePath("/");
}

export async function approveReview(id: number) {
  await requireAuth();
  const review = await prisma.review.update({
    where: { id },
    data: { approved: true },
  });
  revalidatePath("/admin/reviews");
  revalidatePath("/");
  return review;
}

export async function deleteReview(id: number) {
  await requireAuth();
  await prisma.review.delete({ where: { id } });
  revalidatePath("/admin/reviews");
  revalidatePath("/");
}

export async function createTable(branchId: number, tableNumber: number) {
  await requireAuth();
  const table = await prisma.restaurantTable.create({
    data: {
      branchId,
      tableNumber,
      qrToken: crypto.randomBytes(8).toString("hex"),
    },
    include: { branch: true },
  });
  revalidatePath("/admin/tables");
  return table;
}

export async function generateTables(branchId: number, startNumber: number, count: number) {
  await requireAuth();
  const clampedCount = Math.min(Math.max(1, count), 500);
  await prisma.restaurantTable.createMany({
    data: Array.from({ length: clampedCount }, (_, i) => ({
      branchId,
      tableNumber: startNumber + i,
      qrToken: crypto.randomBytes(8).toString("hex"),
    })),
    skipDuplicates: true,
  });
  const tables = await prisma.restaurantTable.findMany({
    where: { branchId, tableNumber: { gte: startNumber, lte: startNumber + clampedCount - 1 } },
    include: { branch: true },
    orderBy: { tableNumber: "asc" },
  });
  revalidatePath("/admin/tables");
  return tables;
}

export async function toggleTableActive(id: string) {
  await requireAuth();
  const table = await prisma.restaurantTable.findUnique({ where: { id } });
  if (!table) throw new Error("Table not found");
  const updated = await prisma.restaurantTable.update({
    where: { id },
    data: { isActive: !table.isActive },
  });
  revalidatePath("/admin/tables");
  return updated;
}

export async function regenerateTableToken(id: string) {
  await requireAuth();
  const table = await prisma.restaurantTable.update({
    where: { id },
    data: { qrToken: crypto.randomBytes(8).toString("hex") },
    include: { branch: true },
  });
  revalidatePath("/admin/tables");
  return table;
}

export async function regenerateAllTableTokens() {
  await requireAuth();
  const tables = await prisma.restaurantTable.findMany({ select: { id: true } });
  await Promise.all(
    tables.map((t) =>
      prisma.restaurantTable.update({
        where: { id: t.id },
        data: { qrToken: crypto.randomBytes(8).toString("hex") },
      })
    )
  );
  revalidatePath("/admin/tables");
  revalidatePath("/admin/tables/print");
  return tables.length;
}

export async function updateSystemSetting(key: string, value: unknown) {
  await requireAuth();
  await prisma.systemSetting.upsert({
    where: { key },
    update: { value: value as Prisma.InputJsonValue },
    create: { key, value: value as Prisma.InputJsonValue },
  });
  revalidatePath("/admin/settings");
}

export async function markOrderServed(id: string) {
  await requireAuth();
  await prisma.order.update({
    where: { id },
    data: { status: "served", servedAt: new Date() },
  });
  revalidatePath("/admin/orders");
}

export async function markOrderPreparing(id: string) {
  await requireAuth();
  await prisma.order.update({
    where: { id },
    data: { status: "preparing" },
  });
  revalidatePath("/admin/orders");
}

export async function markOrderReady(id: string) {
  await requireAuth();
  await prisma.order.update({
    where: { id },
    data: { status: "ready" },
  });
  revalidatePath("/admin/orders");
}

export async function deleteOrder(id: string) {
  await requireAuth();
  await prisma.orderItem.deleteMany({ where: { orderId: id } });
  await prisma.order.delete({ where: { id } });
  revalidatePath("/admin/orders");
}

export async function getSystemSettings() {
  const settings = await prisma.systemSetting.findMany();
  const map: Record<string, unknown> = {};
  for (const s of settings) map[s.key] = s.value;
  return map;
}

export async function getNewOrderAlerts(since: string) {
  await requireAuth();
  const sinceDate = new Date(since);
  if (Number.isNaN(sinceDate.getTime())) throw new Error("Invalid alert cursor");

  const orders = await prisma.order.findMany({
    where: {
      status: { in: ["submitted", "preparing", "ready"] },
      submittedAt: { gt: sinceDate },
    },
    select: {
      id: true,
      tableId: true,
      submittedAt: true,
      table: { select: { branch: { select: { nameEn: true } } } },
    },
    orderBy: { submittedAt: "asc" },
    take: 100,
  });

  return orders.map((order) => ({
    id: order.id,
    tableId: order.tableId,
    submittedAt: order.submittedAt?.toISOString() ?? since,
    branchName: order.table.branch.nameEn,
  }));
}
