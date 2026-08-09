import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { DeleteCustomerButton } from "./delete-button";

  export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;

  const where: any = { deletedAt: null };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
    ];
  }

  const customers = await prisma.customer.findMany({ where });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <Link
          href="/customers/new"
          className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700"
        >
          Add Customer
        </Link>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        Manage your customer database and repair history.
      </p>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
     <form className="mb-4">
  <input
    type="text"
    name="search"
    defaultValue={search}
    placeholder="Search by name or phone..."
    className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm"
  />
</form>

        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Customer Name</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Email</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
  {customers.map((customer) => (
    <tr key={customer.id} className="border-b border-slate-100 last:border-0">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-semibold">
            {customer.name.charAt(0)}
          </div>
          <span>{customer.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-slate-600">{customer.phone}</td>
      <td className="px-4 py-3 text-slate-600">{customer.email ?? "—"}</td>
      <td className="px-4 py-3 space-x-3">
  <Link href={`/customers/${customer.id}`} className="text-blue-600 hover:underline text-sm">
    View Profile
  </Link>
  <Link href={`/customers/${customer.id}/edit`} className="text-slate-600 hover:underline text-sm">
    Edit
  </Link>
   <DeleteCustomerButton id={customer.id} />

</td>
    </tr>
  ))}
</tbody>
        </table>

        {customers.length === 0 && (
          <p className="text-center text-slate-500 py-8">No customers yet.</p>
        )}
      </div>
    </div>
  );
}