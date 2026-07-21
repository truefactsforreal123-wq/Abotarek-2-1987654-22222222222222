import { prisma } from "@/lib/prisma";
import { TablesManagerClient } from "./TablesManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminTablesPage() {
  const [tables, branches] = await Promise.all([
    prisma.restaurantTable.findMany({
      include: { branch: true, orders: true },
      orderBy: [{ branchId: "asc" }, { tableNumber: "asc" }],
    }),
    prisma.branch.findMany({ orderBy: { id: "asc" } }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-paper">Tables</h1>
        <p className="mt-1 text-sm text-paper/40">
          {tables.length} tables across {branches.length} branches
        </p>
      </div>
      <TablesManagerClient tables={tables} branches={branches} />
    </div>
  );
}
