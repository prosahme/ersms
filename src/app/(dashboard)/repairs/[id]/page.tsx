import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { User, Smartphone } from "lucide-react";
import { uploadMediaAction } from "./media-actions";
import { updateStatusAction } from "./status-actions";
import { addPartToRepairAction } from "./parts-actions";
import { formatCurrency } from "@/lib/format-currency";
import { addPaymentAction } from "./payment-actions";

const statusLabels: Record<string, string> = {
  RECEIVED: "Received",
  DIAGNOSING: "Diagnosing",
  WAITING_FOR_PARTS: "Waiting for Parts",
  REPAIRING: "Repairing",
  COMPLETED: "Completed",
  DELIVERED: "Delivered",
};

export default async function RepairDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ticket = await prisma.repairTicket.findUnique({
    where: { id },
    include: {
      customer: true,
      media: true,
      statusHistory: { orderBy: { changedAt: "asc" } },
      assignedTechnician: true,
      repairParts: { include: { sparePart: true } },
      payments: true,
    },
  });

  if (!ticket) notFound();

  const availableParts = await prisma.sparePart.findMany({
    where: { deletedAt: null, quantityAvailable: { gt: 0 } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl md:text-2xl font-semibold">{ticket.ticketNumber}</h1>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
          {statusLabels[ticket.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-orange-500 text-xs uppercase tracking-wide">Customer</h2>
            <User size={16} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium">{ticket.customer.name}</p>
          <p className="text-sm text-orange-500">{ticket.customer.phone}</p>
          {ticket.customer.email && <p className="text-sm text-orange-500">{ticket.customer.email}</p>}
        </div>

        <div className="bg-white border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-orange-500 text-xs uppercase tracking-wide">Device</h2>
            <Smartphone size={16} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium">{ticket.deviceBrand} {ticket.deviceModel}</p>
          {ticket.serialNumberImei && (
            <p className="text-sm text-orange-500">Serial: {ticket.serialNumberImei}</p>
          )}
          <p className="text-sm text-orange-500">
            Technician: {ticket.assignedTechnician?.fullName ?? "Unassigned"}
          </p>
        </div>
      </div>

      <div className="bg-white border border-orange-200 rounded-lg p-4">
        <h2 className="font-semibold text-orange-500 text-xs uppercase tracking-wide mb-2">Reported Problem</h2>
        <p className="text-sm text-slate-700">"{ticket.reportedProblem}"</p>
      </div>

      {ticket.technicianNotes && (
        <div className="bg-white border border-orange-200 rounded-lg p-4">
          <h2 className="font-semibold text-orange-500 text-xs uppercase tracking-wide mb-2">Technician Notes</h2>
          <p className="text-sm text-slate-700">"{ticket.technicianNotes}"</p>
        </div>
      )}

      <div className="bg-white border border-orange-200 rounded-lg p-4">
        <h2 className="font-semibold text-orange-500 text-xs uppercase tracking-wide mb-3">
          Documentation ({ticket.media.length})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {ticket.media.map((m) =>
            m.fileType === "IMAGE" ? (
              <img key={m.id} src={m.fileUrl} className="rounded-md aspect-square object-cover" />
            ) : (
              <video key={m.id} src={m.fileUrl} controls className="rounded-md aspect-square object-cover" />
            )
          )}
        </div>
        <form action={uploadMediaAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="repairId" value={ticket.id} />
          <input type="file" name="file" accept="image/*,video/*" required className="text-sm" />
          <button type="submit" className="rounded-md bg-orange-600 text-white px-3 py-1.5 text-sm">
            Upload
          </button>
        </form>
      </div>

      <div className="bg-white border border-orange-200 rounded-lg p-4">
        <h2 className="font-semibold text-slate-500 text-xs uppercase tracking-wide mb-3">Used Spare Parts</h2>

        {ticket.repairParts.length > 0 && (
          <div className="space-y-2 mb-4 md:hidden">
            {ticket.repairParts.map((rp) => (
              <div key={rp.id} className="flex items-center justify-between text-sm border-b border-orange-50 pb-2 last:border-0">
                <div>
                  <p>{rp.sparePart.name}</p>
                  <p className="text-slate-500 text-xs">Qty {rp.quantityUsed} × {formatCurrency(rp.unitPriceAtUse)}</p>
                </div>
                <p className="font-medium">{formatCurrency(rp.unitPriceAtUse * rp.quantityUsed)}</p>
              </div>
            ))}
          </div>
        )}

        {ticket.repairParts.length > 0 && (
          <table className="w-full text-sm mb-4 hidden md:table">
            <thead>
              <tr className="text-left text-slate-500 border-b border-orange-100">
                <th className="py-2 font-medium">Part</th>
                <th className="py-2 font-medium">Qty</th>
                <th className="py-2 font-medium">Unit Price</th>
                <th className="py-2 font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {ticket.repairParts.map((rp) => (
                <tr key={rp.id} className="border-b border-orange-50 last:border-0">
                  <td className="py-2">{rp.sparePart.name}</td>
                  <td className="py-2">{rp.quantityUsed}</td>
                  <td className="py-2">{formatCurrency(rp.unitPriceAtUse)}</td>
                  <td className="py-2 font-medium">{formatCurrency(rp.unitPriceAtUse * rp.quantityUsed)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <form action={addPartToRepairAction} className="flex flex-col sm:flex-row sm:items-end gap-3">
          <input type="hidden" name="repairId" value={ticket.id} />
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1">Part</label>
            <select name="partId" required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm">
              {availableParts.map((part) => (
                <option key={part.id} value={part.id}>
                  {part.name} ({part.quantityAvailable} available)
                </option>
              ))}
            </select>
          </div>
          <div className="sm:w-24">
            <label className="block text-xs font-medium mb-1">Quantity</label>
            <input name="quantityUsed" type="number" min="1" defaultValue={1} required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="rounded-md bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:bg-orange-700">
            Add Part
          </button>
        </form>
      </div>

      <div className="bg-white border border-orange-200 rounded-lg p-4">
        <h2 className="font-semibold text-orange-500 text-xs uppercase tracking-wide mb-4">Repair Timeline</h2>
        <div className="space-y-4 mb-6">
          {ticket.statusHistory.map((entry, index) => {
            const isCurrent = index === ticket.statusHistory.length - 1;
            return (
              <div key={entry.id} className="flex gap-3">
                <div
                  className={`h-3 w-3 rounded-full mt-1 flex-shrink-0 ${
                    isCurrent ? "bg-orange-600" : "bg-orange-200"
                  }`}
                />
                <div>
                  <p className={`text-sm ${isCurrent ? "font-semibold text-orange-600" : "text-slate-700"}`}>
                    {statusLabels[entry.status]}
                  </p>
                  <p className="text-xs text-slate-400">{entry.changedAt.toLocaleString()}</p>
                  {entry.notes && <p className="text-xs text-orange-500 mt-0.5">{entry.notes}</p>}
                </div>
              </div>
            );
          })}
        </div>

        <form action={updateStatusAction} className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-end gap-3">
          <input type="hidden" name="repairId" value={ticket.id} />
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1">Update Status</label>
            <select name="status" required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm">
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1">Notes (optional)</label>
            <input name="notes" type="text" className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="rounded-md bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:bg-orange-700">
            Update
          </button>
        </form>
      </div>

      <div className="bg-white border border-orange-200 rounded-lg p-4">
        <h2 className="font-semibold text-orange-500 text-xs uppercase tracking-wide mb-3">Payments</h2>

        <p className="text-sm text-slate-600 mb-1">Estimated Cost: {formatCurrency(ticket.estimatedCost)}</p>
        {(() => {
          const totalPaid = ticket.payments.reduce((sum, p) => sum + p.amount, 0);
          const balance = ticket.estimatedCost - totalPaid;
          return (
            <>
              <p className="text-sm text-slate-600 mb-3">Total Paid: {formatCurrency(totalPaid)}</p>
              <p className={`text-sm font-semibold mb-4 ${balance > 0 ? "text-red-600" : "text-green-600"}`}>
                {balance > 0 ? `Remaining Balance: ${formatCurrency(balance)}` : "Paid in Full"}
              </p>
            </>
          );
        })()}

        {ticket.payments.length > 0 && (
          <div className="space-y-2 mb-4 md:hidden">
            {ticket.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm border-b border-orange-50 pb-2 last:border-0">
                <div>
                  <p>{p.paymentType} — {p.paymentMethod}</p>
                  <p className="text-slate-500 text-xs">{p.createdAt.toLocaleDateString()}</p>
                </div>
                <p className="font-medium">{formatCurrency(p.amount)}</p>
              </div>
            ))}
          </div>
        )}

        {ticket.payments.length > 0 && (
          <table className="w-full text-sm mb-4 hidden md:table">
            <thead>
              <tr className="text-left text-slate-500 border-b border-orange-100">
                <th className="py-2 font-medium">Type</th>
                <th className="py-2 font-medium">Method</th>
                <th className="py-2 font-medium">Amount</th>
                <th className="py-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {ticket.payments.map((p) => (
                <tr key={p.id} className="border-b border-orange-50 last:border-0">
                  <td className="py-2">{p.paymentType}</td>
                  <td className="py-2">{p.paymentMethod}</td>
                  <td className="py-2">{formatCurrency(p.amount)}</td>
                  <td className="py-2 text-slate-500">{p.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <form action={addPaymentAction} className="flex flex-col sm:flex-row sm:items-end gap-3">
          <input type="hidden" name="repairId" value={ticket.id} />
          <div>
            <label className="block text-xs font-medium mb-1">Type</label>
            <select name="paymentType" required className="w-full sm:w-auto rounded-md border border-orange-300 px-3 py-2 text-sm">
              <option value="PARTIAL">Partial</option>
              <option value="FINAL">Final</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Method</label>
            <select name="paymentMethod" required className="w-full sm:w-auto rounded-md border border-orange-300 px-3 py-2 text-sm">
              <option value="CASH">Cash</option>
              <option value="TELEBIRR">Telebirr</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
          </div>
          <div className="sm:w-32">
            <label className="block text-xs font-medium mb-1">Amount</label>
            <input name="amount" type="number" step="0.01" required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="rounded-md bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:bg-orange-700">
            Add Payment
          </button>
        </form>
      </div>
    </div>
  );
}