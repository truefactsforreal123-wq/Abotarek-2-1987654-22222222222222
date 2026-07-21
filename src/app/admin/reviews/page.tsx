import { prisma } from "@/lib/prisma";
import { ReviewsClient } from "./ReviewsClient";

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: { branch: true },
    orderBy: { createdAt: "desc" },
  });

  const pendingCount = reviews.filter(
    (r: (typeof reviews)[number]) => !r.approved,
  ).length;
  const approvedCount = reviews.filter(
    (r: (typeof reviews)[number]) => r.approved,
  ).length;

  return (
    <ReviewsClient
      reviews={JSON.parse(JSON.stringify(reviews))}
      pendingCount={pendingCount}
      approvedCount={approvedCount}
    />
  );
}
