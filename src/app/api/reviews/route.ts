import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 30_000;
const MAX_RATE_LIMIT_ENTRIES = 10_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const last = rateLimitMap.get(ip) ?? 0;
  if (now - last < RATE_LIMIT_WINDOW_MS) return false;
  if (rateLimitMap.size >= MAX_RATE_LIMIT_ENTRIES) {
    for (const [key, timestamp] of rateLimitMap) {
      if (now - timestamp >= RATE_LIMIT_WINDOW_MS) rateLimitMap.delete(key);
    }
  }
  rateLimitMap.set(ip, now);
  return true;
}

export async function GET(request: NextRequest) {
  const branchIdParam = request.nextUrl.searchParams.get("branchId");
  let branchId: number | null = null;
  if (branchIdParam !== null) {
    const parsedBranchId = Number(branchIdParam);
    if (!Number.isInteger(parsedBranchId) || parsedBranchId <= 0) {
      return NextResponse.json({ error: "Invalid branch ID" }, { status: 400 });
    }
    branchId = parsedBranchId;
  }

  const where: Record<string, unknown> = {};
  if (branchId !== null) where.branchId = branchId;

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      branchId: true,
      name: true,
      rating: true,
      text: true,
      createdAt: true,
    },
  });
  return NextResponse.json(reviews);
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Please wait 30 seconds." }, { status: 429 });
  }

  let body: { name?: unknown; rating?: unknown; text?: unknown; branchId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, rating, text, branchId } = body;

  if (!name || !rating || !text) {
    return NextResponse.json({ error: "Name, rating and text are required" }, { status: 400 });
  }

  if (typeof name !== "string" || name.trim().length === 0 || name.length > 100) {
    return NextResponse.json({ error: "Name must be 1-100 characters" }, { status: 400 });
  }

  if (typeof text !== "string" || text.trim().length === 0 || text.length > 2000) {
    return NextResponse.json({ error: "Review text must be 1-2000 characters" }, { status: 400 });
  }

  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be a whole number between 1 and 5" }, { status: 400 });
  }

  let parsedBranchId: number | null = null;
  if (branchId !== undefined && branchId !== null) {
    if (typeof branchId !== "number" || !Number.isInteger(branchId) || branchId <= 0) {
      return NextResponse.json({ error: "Invalid branch ID" }, { status: 400 });
    }
    const branch = await prisma.branch.findUnique({ where: { id: branchId }, select: { id: true } });
    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }
    parsedBranchId = branch.id;
  }

  const review = await prisma.review.create({
    data: { name: name.trim(), rating, text: text.trim(), approved: false, branchId: parsedBranchId },
  });
  return NextResponse.json(review, { status: 201 });
}
