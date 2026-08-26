import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency } from "@/lib/format-currency";
import { Users, Wrench, CheckCircle2, Wallet, AlertTriangle } from "lucide-react";
import { RepairStatusChart } from "@/components/shared/repair-status-chart";
import { IncomeChart } from "@/components/shared/income-chart";

const statusStyles: Record<string, string> = {
  RECEIVED: "bg-slate-100 text-slate-700",
  DIAGNOSING: "bg-purple-100 text-purple-700",
  WAITING_FOR_PARTS: "bg-amber-100 text-amber-700",
  REPAIRING: "bg-orange-100 text-orange-700",
  COMPLETED: "bg-green-100 text-green-700",
  DELIVERED: "bg-slate-200 text-slate-600",
};

export default async function DashboardPage() {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const [
    totalCustomers,
    repairsInProgress,
    completedTickets,
    todaysPayments,
    lowStockParts,
    recentTickets,
  ] = await Promise.all([
    prisma.customer.count({ where: { deletedAt: null } }),
    prisma.repairTicket.count({
      where: { deletedAt: null, status: { in: ["DIAGNOSING", "WAITING_FOR_PARTS", "REPAIRING"] } },
    }),
    prisma.repairTicket.count({ where: { deletedAt: null, status: "COMPLETED" } }),
    prisma.payment.findMany({ where: { createdAt: { gte: startOfToday } } }),
    prisma.sparePart.findMany({ where: { deletedAt: null } }),
    prisma.repairTicket.findMany({
      where: { deletedAt: null },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const statusCounts = await prisma.repairTicket.groupBy({
  by: ["status"],
  where: { deletedAt: null },
  _count: true,
});

const statusChartData = statusCounts
  .filter((s) => ["DIAGNOSING", "WAITING_FOR_PARTS", "REPAIRING", "COMPLETED"].includes(s.status))
  .map((s) => ({
    name: s.status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
    value: s._count,
  }));

const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
const recentPayments = await prisma.payment.findMany({
  where: { createdAt: { gte: sevenDaysAgo } },
});

const incomeByDay: Record<string, number> = {};
for (let i = 6; i >= 0; i--) {
  const d = new Date();
  d.setDate(d.getDate() - i);
  const label = d.toLocaleDateString("en-US", { weekday: "short" });
  incomeByDay[label] = 0;
}
recentPayments.forEach((p) => {
  const label = p.createdAt.toLocaleDateString("en-US", { weekday: "short" });
  if (label in incomeByDay) incomeByDay[label] += p.amount;
});
const incomeChartData = Object.entries(incomeByDay).map(([day, income]) => ({ day, income }));

  const todaysIncome = todaysPayments.reduce((sum, p) => sum + p.amount, 0);
  const lowStockCount = lowStockParts.filter((p) => p.quantityAvailable <= p.lowStockThreshold).length;

  const stats = [
    { label: "Total Customers", value: totalCustomers, icon: Users, color: "bg-orange-100 text-orange-600" },
    { label: "Repairs in Progress", value: repairsInProgress, icon: Wrench, color: "bg-purple-100 text-purple-600" },
    { label: "Completed Repairs", value: completedTickets, icon: CheckCircle2, color: "bg-green-100 text-green-600" },
    { label: "Today's Income", value: formatCurrency(todaysIncome), icon: Wallet, color: "bg-blue-100 text-blue-600" },
    { label: "Low Stock Items", value: lowStockCount, icon: AlertTriangle, color: "bg-red-100 text-red-600" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
      <p className="text-slate-500 mb-6">Here's what's happening in your shop today.</p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white border border-orange-200 rounded-lg p-4">
              <div className={`h-9 w-9 rounded-md flex items-center justify-center mb-3 ${stat.color}`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-semibold">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Link href="/customers/new" className="rounded-md bg-white border border-orange-300 px-4 py-2 text-sm font-medium hover:bg-orange-50">
          + Add Customer
        </Link>
        <Link href="/repairs/new" className="rounded-md bg-white border border-orange-300 px-4 py-2 text-sm font-medium hover:bg-orange-50">
          + Create Repair
        </Link>
        <Link href="/inventory/new" className="rounded-md bg-white border border-orange-300 px-4 py-2 text-sm font-medium hover:bg-orange-50">
          + Add Spare Part
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
  <div className="bg-white border border-orange-200 rounded-lg p-4">
    <h2 className="font-semibold mb-2">Income Overview (Last 7 Days)</h2>
    <IncomeChart data={incomeChartData} />
  </div>
  <div className="bg-white border border-orange-200 rounded-lg p-4">
    <h2 className="font-semibold mb-2">Repair Status</h2>
    <RepairStatusChart data={statusChartData} />
  </div>
</div>

      <div className="bg-white border border-orange-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Recent Repair Tickets</h2>
          <Link href="/repairs" className="text-sm text-orange-600 hover:underline">View All</Link>
        </div>
        <div className="space-y-3">
          {recentTickets.map((ticket) => (
           
           <div key={ticket.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-orange-50 last:border-0 pb-3 last:pb-0">
              <div>
                <p className="text-sm font-medium">{ticket.ticketNumber}</p>
                <p className="text-xs text-slate-500">{ticket.customer.name} — {ticket.deviceBrand} {ticket.deviceModel}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[ticket.status]}`}>
                {ticket.status.replace(/_/g, " ")}
              </span>
            </div>
          ))}
          {recentTickets.length === 0 && (
            <p className="text-sm text-slate-500 py-4 text-center">No repair tickets yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

