import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format-currency";

const typeStyles: Record<string, string> = {
  DEPOSIT: "bg-blue-100 text-blue-700",
  PARTIAL: "bg-amber-100 text-amber-700",
  FINAL: "bg-green-100 text-green-700",
};

const methodLabels: Record<string, string> = {
  CASH: "Cash",
  TELEBIRR: "Telebirr",
  BANK_TRANSFER: "Bank Transfer",
};

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ method?: string }>;
}) {
  const { method } = await searchParams;

  const payments = await prisma.payment.findMany({
    where: method ? { paymentMethod: method as any } : {},
    include: { repairTicket: { include: { customer: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Payments</h1>

      <form className="flex flex-wrap gap-2 mb-4">
        <a href="/payments" className={`px-4 py-2 rounded-md text-sm ${!method ? "bg-orange-600 text-white" : "bg-white border border-orange-300"}`}>All</a>
        <a href="/payments?method=CASH" className={`px-4 py-2 rounded-md text-sm ${method === "CASH" ? "bg-orange-600 text-white" : "bg-white border border-orange-300"}`}>Cash</a>
        <a href="/payments?method=TELEBIRR" className={`px-4 py-2 rounded-md text-sm ${method === "TELEBIRR" ? "bg-orange-600 text-white" : "bg-white border border-orange-300"}`}>Telebirr</a>
        <a href="/payments?method=BANK_TRANSFER" className={`px-4 py-2 rounded-md text-sm ${method === "BANK_TRANSFER" ? "bg-orange-600 text-white" : "bg-white border border-orange-300"}`}>Bank Transfer</a>
      </form>

      <div className="space-y-3">
        {payments.map((p) => (
          
          <div key={p.id} className="bg-white border border-orange-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{p.repairTicket.ticketNumber}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeStyles[p.paymentType]}`}>
                  {p.paymentType}
                </span>
              </div>
              <p className="text-sm text-slate-500">{p.repairTicket.customer.name} — {methodLabels[p.paymentMethod]}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-orange-600">{formatCurrency(p.amount)}</p>
              <p className="text-xs text-slate-400">{p.createdAt.toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>

      {payments.length === 0 && (
        <p className="text-center text-slate-500 py-8">No payments recorded yet.</p>
      )}
    </div>
  );
}