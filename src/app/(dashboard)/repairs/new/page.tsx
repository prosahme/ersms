import { prisma } from "@/lib/prisma";
import { NewRepairForm } from "./new-repair-form";

export default async function NewRepairPage() {
  const customers = await prisma.customer.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
  });
  const technicians = await prisma.user.findMany({
  where: { isActive: true },
  orderBy: { fullName: "asc" },
});

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-semibold mb-6">Create Repair Ticket</h1>
      <NewRepairForm customers={customers} technicians={technicians} />
    </div>
  );
}
