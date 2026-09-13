import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency } from "@/lib/format-currency";
import { Users, Wrench, CheckCircle2, Wallet, AlertTriangle, ClipboardList, PackageCheck, Clock } from "lucide-react";
import { RepairStatusChart } from "@/components/shared/repair-status-chart";
import { IncomeChart } from "@/components/shared/income-chart";
import { getLanguage } from "@/lib/language";
import { t } from "@/lib/translations";
import { requireAuth, canSeeFinancials } from "@/lib/auth-guard";
import { overdueCutoffDate, TRACKABLE_STATUSES } from "@/lib/overdue";

const statusStyles: Record<string, string> = {
  RECEIVED: "bg-slate-100 text-slate-700",
  DIAGNOSING: "bg-purple-100 text-purple-700",
  WAITING_FOR_PARTS: "bg-amber-100 text-amber-700",
  REPAIRING: "bg-orange-100 text-orange-700",
  COMPLETED: "bg-green-100 text-green-700",
  DELIVERED: "bg-slate-200 text-slate-600",
};

export default async function DashboardPage() {
  const lang = await getLanguage();
  const currentUser = await requireAuth();
  const isFinancial = canSeeFinancials(currentUser.role);

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const [totalCustomers, repairsInProgress, completedTickets, lowStockParts, recentTickets, overdueCount] =
    await Promise.all([
      prisma.customer.count({ where: { deletedAt: null } }),
      prisma.repairTicket.count({ where: { deletedAt: null, status: { in: ["DIAGNOSING", "WAITING_FOR_PARTS", "REPAIRING"] } } }),
      prisma.repairTicket.count({ where: { deletedAt: null, status: "COMPLETED" } }),
      prisma.sparePart.findMany({ where: { deletedAt: null } }),
      prisma.repairTicket.findMany({
        where: {
          deletedAt: null,
          // Private (owner-only) repairs never appear on a non-Administrator's
          // dashboard, same server-side rule as the repairs list.
          ...(currentUser.role !== "ADMINISTRATOR" ? { visibility: "NORMAL" } : {}),
        },
        include: { customer: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.repairTicket.count({
        where: {
          deletedAt: null,
          status: { in: [...TRACKABLE_STATUSES] },
          dateReceived: { lte: overdueCutoffDate() },
          ...(currentUser.role !== "ADMINISTRATOR" ? { visibility: "NORMAL" } : {}),
        },
      }),
    ]);

  const statusCounts = await prisma.repairTicket.groupBy({ by: ["status"], where: { deletedAt: null }, _count: true });
  const statusChartData = statusCounts
    .filter((s) => ["DIAGNOSING", "WAITING_FOR_PARTS", "REPAIRING", "COMPLETED"].includes(s.status))
    .map((s) => ({ name: s.status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()), value: s._count }));

  const lowStockCount = lowStockParts.filter((p) => p.quantityAvailable <= p.lowStockThreshold).length;

  // Financial figures (today's income, the 7-day income chart) are only
  // queried at all when the current user is allowed to see them — a
  // Technician's dashboard never even fetches payment data, not just
  // hides it in the UI.
  let todaysIncome = 0;
  let incomeChartData: { day: string; income: number }[] = [];
  if (isFinancial) {
    const todaysPayments = await prisma.payment.findMany({ where: { createdAt: { gte: startOfToday } } });
    todaysIncome = todaysPayments.reduce((sum, p) => sum + p.amount, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const recentPayments = await prisma.payment.findMany({ where: { createdAt: { gte: sevenDaysAgo } } });

    const incomeByDay: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      incomeByDay[d.toLocaleDateString("en-US", { weekday: "short" })] = 0;
    }
    recentPayments.forEach((p) => {
      const label = p.createdAt.toLocaleDateString("en-US", { weekday: "short" });
      if (label in incomeByDay) incomeByDay[label] += p.amount;
    });
    incomeChartData = Object.entries(incomeByDay).map(([day, income]) => ({ day, income }));
  }

  // Operational figures shown to non-financial staff (Technicians) instead
  // of revenue. Also handy context for financial roles, but the stat cards
  // below only show one or the other to keep the row readable.
  let myAssignedCount = 0;
  let pendingCount = 0;
  let readyCount = 0;
  if (!isFinancial) {
    [myAssignedCount, pendingCount, readyCount] = await Promise.all([
      prisma.repairTicket.count({
        where: { deletedAt: null, assignedTechnicianId: currentUser.id, status: { notIn: ["DELIVERED"] } },
      }),
      prisma.repairTicket.count({ where: { deletedAt: null, status: "RECEIVED" } }),
      prisma.repairTicket.count({ where: { deletedAt: null, status: "COMPLETED" } }),
    ]);
  }

  const stats = isFinancial
    ? [
        { label: t("totalCustomers", lang), value: totalCustomers, icon: Users, color: "bg-orange-100 text-orange-600" },
        { label: t("repairsInProgress", lang), value: repairsInProgress, icon: Wrench, color: "bg-purple-100 text-purple-600" },
        { label: t("completedRepairs", lang), value: completedTickets, icon: CheckCircle2, color: "bg-green-100 text-green-600" },
        { label: t("todaysIncome", lang), value: formatCurrency(todaysIncome), icon: Wallet, color: "bg-blue-100 text-blue-600" },
        { label: "Overdue / Forgotten", value: overdueCount, icon: Clock, color: "bg-red-100 text-red-600", href: "/repairs?overdue=1" },
        { label: t("lowStockItems", lang), value: lowStockCount, icon: AlertTriangle, color: "bg-amber-100 text-amber-600" },
      ]
    : [
        { label: t("myAssignedRepairs", lang), value: myAssignedCount, icon: ClipboardList, color: "bg-blue-100 text-blue-600" },
        { label: t("pendingRepairs", lang), value: pendingCount, icon: Wrench, color: "bg-purple-100 text-purple-600" },
        { label: t("repairsInProgress", lang), value: repairsInProgress, icon: Wrench, color: "bg-orange-100 text-orange-600" },
        { label: t("readyForPickup", lang), value: readyCount, icon: PackageCheck, color: "bg-green-100 text-green-600" },
        { label: "Overdue / Forgotten", value: overdueCount, icon: Clock, color: "bg-red-100 text-red-600", href: "/repairs?overdue=1" },
        { label: t("lowStockItems", lang), value: lowStockCount, icon: AlertTriangle, color: "bg-amber-100 text-amber-600" },
      ];

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-semibold mb-1">{t("dashboard", lang)}</h1>
      <p className="text-slate-500 mb-6">{t("shopUpdateToday", lang)}</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const content = (
            <>
              <div className={`h-9 w-9 rounded-md flex items-center justify-center mb-3 ${stat.color}`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-semibold">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </>
          );
          return "href" in stat && stat.href ? (
            <Link key={stat.label} href={stat.href} className="bg-white border border-orange-200 rounded-lg p-4 hover:border-orange-400 transition-colors">
              {content}
            </Link>
          ) : (
            <div key={stat.label} className="bg-white border border-orange-200 rounded-lg p-4">
              {content}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Link href="/customers/new" className="rounded-md bg-white border border-orange-300 px-4 py-2 text-sm font-medium hover:bg-orange-50">
          + {t("addCustomer", lang)}
        </Link>
        <Link href="/repairs/new" className="rounded-md bg-white border border-orange-300 px-4 py-2 text-sm font-medium hover:bg-orange-50">
          + {t("createRepair", lang)}
        </Link>
        <Link href="/inventory/new" className="rounded-md bg-white border border-orange-300 px-4 py-2 text-sm font-medium hover:bg-orange-50">
          + {t("addSparePart", lang)}
        </Link>
      </div>

      <div className={`grid grid-cols-1 ${isFinancial ? "md:grid-cols-2" : ""} gap-4 mb-6`}>
        {isFinancial && (
          <div className="bg-white border border-orange-200 rounded-lg p-4">
            <h2 className="font-semibold mb-2">{t("incomeOverview", lang)}</h2>
            <IncomeChart data={incomeChartData} />
          </div>
        )}
        <div className="bg-white border border-orange-200 rounded-lg p-4">
          <h2 className="font-semibold mb-2">{t("repairStatus", lang)}</h2>
          <RepairStatusChart data={statusChartData} />
        </div>
      </div>

      <div className="bg-white border border-orange-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">{t("recentRepairTickets", lang)}</h2>
          <Link href="/repairs" className="text-sm text-orange-600 hover:underline">{t("viewAll", lang)}</Link>
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
          {recentTickets.length === 0 && <p className="text-sm text-slate-500 py-4 text-center">{t("noResultsYet", lang)}</p>}
        </div>
      </div>
    </div>
  );
}