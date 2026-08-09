import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditCustomerForm } from "./edit-customer-form";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({ where: { id } });

  if (!customer) {
    notFound();
  }

  return (
    <div className="p-8 max-w-md">
      <h1 className="text-2xl font-semibold mb-6">Edit Customer</h1>
      <EditCustomerForm customer={customer} />
    </div>
  );
}