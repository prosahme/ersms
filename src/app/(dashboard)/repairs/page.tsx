import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency } from "@/lib/format-currency";

const statusStyles: Record<string, string> = {
  RECEIVED: "bg-slate-100 text-slate-700",
  DIAGNOSING: "bg-purple-100 text-purple-700",
  WAITING_FOR_PARTS: "bg-amber-100 text-amber-700",
  REPAIRING: "bg-orange-100 text-orange-700",
  COMPLETED: "bg-green-100 text-green-700",
  DELIVERED: "bg-slate-200 text-slate-600",
};

const statusLabels: Record<string, string> = {
  RECEIVED: "Received",
  DIAGNOSING: "Diagnosing",
  WAITING_FOR_PARTS: "Waiting for Parts",
  REPAIRING: "Repairing",
  COMPLETED: "Completed",
  DELIVERED: "Delivered",
};

export default async function RepairsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; technicianId?: string }>;
}) {
  const { search, status, technicianId } = await searchParams;

  const where: any = { deletedAt: null };

  if (search) {
    where.OR = [
      { ticketNumber: { contains: search, mode: "insensitive" } },
      { customer: { name: { contains: search, mode: "insensitive" } } },
    ];
  }
  if (status) where.status = status;
  if (technicianId) where.assignedTechnicianId = technicianId;

  const tickets = await prisma.repairTicket.findMany({
    where,
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });

  const technicians = await prisma.user.findMany({ where: { isActive: true } });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Repair Tickets</h1>
        <Link
          href="/repairs/new"
          className="rounded-md bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:bg-orange-700"
        >
          Create Repair
        </Link>
      </div>

      <form className="flex gap-3 mb-4">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search ticket # or customer..."
          className="rounded-md border border-orange-300 px-3 py-2 text-sm flex-1"
        />
        <select name="status" defaultValue={status ?? ""} className="rounded-md border border-orange-300 px-3 py-2 text-sm">
          <option value="">All Statuses</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select name="technicianId" defaultValue={technicianId ?? ""} className="rounded-md border border-orange-300 px-3 py-2 text-sm">
          <option value="">All Technicians</option>
          {technicians.map((tech) => (
            <option key={tech.id} value={tech.id}>{tech.fullName}</option>
          ))}
        </select>
       <button type="submit" className="rounded-md bg-orange-600 text-white px-4 py-2 text-sm">
          Filter
        </button>
      </form>

      <div className="bg-white border border-orange-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-orange-50 border-b border-orange-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-orange-500">Ticket #</th>
              <th className="text-left px-4 py-3 font-medium text-orange-500">Customer</th>
              <th className="text-left px-4 py-3 font-medium text-orange-500">Device</th>
              <th className="text-left px-4 py-3 font-medium text-orange-500">Status</th>
              <th className="text-left px-4 py-3 font-medium text-orange-500">Est. Cost</th>
              <th className="text-left px-4 py-3 font-medium text-orange-500">Balance</th>
              <th className="text-left px-4 py-3 font-medium text-orange-500">Received</th>
              <th className="text-left px-4 py-3 font-medium text-orange-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium">{ticket.ticketNumber}</td>
                <td className="px-4 py-3">{ticket.customer.name}</td>
                <td className="px-4 py-3 text-slate-600">
                  {ticket.deviceBrand} {ticket.deviceModel}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[ticket.status]}`}>
                    {statusLabels[ticket.status]}
                  </span>
                </td>

                <td className="px-4 py-3 text-slate-600">{formatCurrency(ticket.estimatedCost)}</td>
               <td className="px-4 py-3 text-slate-600">{formatCurrency(ticket.estimatedCost - ticket.depositAmount)}</td>
                <td className="px-4 py-3 text-slate-600">
                  {ticket.dateReceived.toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/repairs/${ticket.id}`} className="text-orange-600 hover:underline text-sm">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tickets.length === 0 && (
          <p className="text-center text-orange-500 py-8">No repair tickets yet.</p>
        )}
      </div>
    </div>
  );
}

  
