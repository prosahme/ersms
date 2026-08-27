import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency } from "@/lib/format-currency";
import { getLanguage } from "@/lib/language";
import { t } from "@/lib/translations";

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
  const lang = await getLanguage();
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

  const tickets = await prisma.repairTicket.findMany({ where, include: { customer: true }, orderBy: { createdAt: "desc" } });
  const technicians = await prisma.user.findMany({ where: { isActive: true } });

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold">{t("repairTickets", lang)}</h1>
        <Link href="/repairs/new" className="rounded-md bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:bg-orange-700 text-center">
          {t("createRepair", lang)}
        </Link>
      </div>

      <form className="flex flex-wrap gap-3 mb-4">
        <input type="text" name="search" defaultValue={search} placeholder="Search ticket # or customer..." className="rounded-md border border-orange-300 px-3 py-2 text-sm flex-1 min-w-[160px]" />
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
        <button type="submit" className="rounded-md bg-orange-600 text-white px-4 py-2 text-sm">Filter</button>
      </form>

      <div className="space-y-3 md:hidden">
        {tickets.map((ticket) => (
          <Link key={ticket.id} href={`/repairs/${ticket.id}`} className="block bg-white border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{ticket.ticketNumber}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[ticket.status]}`}>{statusLabels[ticket.status]}</span>
            </div>
            <p className="text-sm text-slate-600">{ticket.customer.name}</p>
            <p className="text-sm text-slate-500 mb-2">{ticket.deviceBrand} {ticket.deviceModel}</p>
            <div className="flex items-center justify-between text-sm border-t border-orange-100 pt-2">
              <span className="text-slate-500">{t("estCost", lang)}: {formatCurrency(ticket.estimatedCost)}</span>
              <span className="text-slate-500">{ticket.dateReceived.toLocaleDateString()}</span>
            </div>
          </Link>
        ))}
        {tickets.length === 0 && <p className="text-center text-orange-500 py-8">{t("noResultsYet", lang)}</p>}
      </div>

      <div className="hidden md:block bg-white border border-orange-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-orange-50 border-b border-orange-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-orange-500">Ticket #</th>
              <th className="text-left px-4 py-3 font-medium text-orange-500">{t("customer", lang)}</th>
              <th className="text-left px-4 py-3 font-medium text-orange-500">{t("device", lang)}</th>
              <th className="text-left px-4 py-3 font-medium text-orange-500">{t("status", lang)}</th>
              <th className="text-left px-4 py-3 font-medium text-orange-500">{t("estCost", lang)}</th>
              <th className="text-left px-4 py-3 font-medium text-orange-500">{t("balance", lang)}</th>
              <th className="text-left px-4 py-3 font-medium text-orange-500">{t("received", lang)}</th>
              <th className="text-left px-4 py-3 font-medium text-orange-500">{t("actions", lang)}</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium">{ticket.ticketNumber}</td>
                <td className="px-4 py-3">{ticket.customer.name}</td>
                <td className="px-4 py-3 text-slate-600">{ticket.deviceBrand} {ticket.deviceModel}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[ticket.status]}`}>{statusLabels[ticket.status]}</span></td>
                <td className="px-4 py-3 text-slate-600">{formatCurrency(ticket.estimatedCost)}</td>
                <td className="px-4 py-3 text-slate-600">{formatCurrency(ticket.estimatedCost - ticket.depositAmount)}</td>
                <td className="px-4 py-3 text-slate-600">{ticket.dateReceived.toLocaleDateString()}</td>
                <td className="px-4 py-3"><Link href={`/repairs/${ticket.id}`} className="text-orange-600 hover:underline text-sm">{t("viewProfile", lang)}</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {tickets.length === 0 && <p className="text-center text-orange-500 py-8">{t("noResultsYet", lang)}</p>}
      </div>
    </div>
  );
}