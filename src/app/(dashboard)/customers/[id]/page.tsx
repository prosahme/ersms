import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function CustomerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
  });

  if (!customer) {
    notFound();
  }

  return (
    
    <div className="p-8">
      <h1 className="text-2xl font-semibold">{customer.name}</h1>
      <p className="text-slate-500 mt-1">{customer.phone}</p>
      {customer.email && <p className="text-slate-500">{customer.email}</p>}
      {customer.address && <p className="text-slate-500">{customer.address}</p>}

      <h2 className="text-lg font-semibold mt-8 mb-2">Repair History</h2>
      <p className="text-slate-500">No repairs yet.</p>
    </div>

     
  );
}