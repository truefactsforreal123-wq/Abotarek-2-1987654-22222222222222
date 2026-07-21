import { prisma } from "@/lib/prisma";
import { BranchesClient } from "./BranchesClient";

export default async function BranchesPage() {
  const branches = await prisma.branch.findMany({
    orderBy: { number: "asc" },
  });

  return (
    <BranchesClient branches={JSON.parse(JSON.stringify(branches))} />
  );
}
