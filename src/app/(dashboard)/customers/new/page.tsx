import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { NewCustomerForm } from "./new-customer-form";

export default async function NewCustomerPage() {
  const currentUser = await requireAuth();

  const technicians = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { fullName: "asc" },
  });

  return (
    <div className="p-4 md:p-8 max-w-lg">
      <h1 className="text-2xl font-semibold mb-6">Add Customer</h1>
      <NewCustomerForm technicians={technicians} isAdmin={currentUser.role === "ADMINISTRATOR"} />
    </div>
  );
}