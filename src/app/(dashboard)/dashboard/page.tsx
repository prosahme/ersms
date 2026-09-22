import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency } from "@/lib/format-currency";
import {
  Users,
  Wrench,
  CheckCircle2,
  Wallet,
  AlertTriangle,
  ClipboardList,
  PackageCheck,
  Clock,
  Plus,
  ArrowUpRight,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { RepairStatusChart } from "@/components/shared/repair-status-chart";
import { IncomeChart } from "@/components/shared/income-chart";
import { getLanguage } from "@/lib/language";
import { t } from "@/lib/translations";
import { requireAuth, canSeeFinancials } from "@/lib/auth-guard";
import { overdueCutoffDate, TRACKABLE_STATUSES } from "@/lib/overdue";

const statusStyles: Record<string, string> = {
  RECEIVED: "border-white/20 bg-white/10 text-white/85",
  DIAGNOSING: "border-purple-400/40 bg-purple-500/15 text-purple-200",
  WAITING_FOR_PARTS: "border-amber-400/40 bg-amber-500/15 text-amber-200",
  REPAIRING: "border-[#B87333]/50 bg-[#B87333]/20 text-[#F0B27A]",
  COMPLETED: "border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
  DELIVERED: "border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#F5D76E]",
};

type Stat = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone: string;
  href?: string;
};

// Icon-box colors. Gold leads; the others are muted and only used
// where the color carries meaning (overdue = red, low stock = amber).
const tone = {
  gold: "border-[#D4AF37]/40 bg-[#D4AF37]/12 text-[#F5D76E]",
  copper: "border-[#B87333]/50 bg-[#B87333]/15 text-[#F0B27A]",
  green: "border-emerald-400/35 bg-emerald-500/12 text-emerald-300",
  red: "border-red-400/40 bg-red-500/12 text-red-300",
  amber: "border-amber-400/40 bg-amber-500/12 text-amber-300",
  neutral: "border-white/20 bg-white/[0.06] text-white/80",
};

function Panel({
  title,
  action,
  delay = 0,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <section
      className="ersms-fade-up ersms-gold-line relative min-w-0 overflow-hidden rounded-2xl border bg-[#0f0f0f] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.45)] sm:p-6"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent"
      />
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="ersms-gold-bright text-xs font-extrabold uppercase tracking-[0.14em]">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

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

  const stats: Stat[] = isFinancial
    ? [
        { label: t("totalCustomers", lang), value: totalCustomers, icon: Users, tone: tone.gold },
        { label: t("repairsInProgress", lang), value: repairsInProgress, icon: Wrench, tone: tone.copper },
        { label: t("completedRepairs", lang), value: completedTickets, icon: CheckCircle2, tone: tone.green },
        { label: t("todaysIncome", lang), value: formatCurrency(todaysIncome), icon: Wallet, tone: tone.gold },
        { label: "Overdue / Forgotten", value: overdueCount, icon: Clock, tone: tone.red, href: "/repairs?overdue=1" },
        { label: t("lowStockItems", lang), value: lowStockCount, icon: AlertTriangle, tone: tone.amber },
      ]
    : [
        { label: t("myAssignedRepairs", lang), value: myAssignedCount, icon: ClipboardList, tone: tone.gold },
        { label: t("pendingRepairs", lang), value: pendingCount, icon: Wrench, tone: tone.neutral },
        { label: t("repairsInProgress", lang), value: repairsInProgress, icon: Wrench, tone: tone.copper },
        { label: t("readyForPickup", lang), value: readyCount, icon: PackageCheck, tone: tone.green },
        { label: "Overdue / Forgotten", value: overdueCount, icon: Clock, tone: tone.red, href: "/repairs?overdue=1" },
        { label: t("lowStockItems", lang), value: lowStockCount, icon: AlertTriangle, tone: tone.amber },
      ];

  const todayLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative min-h-full overflow-hidden bg-[#050505] px-4 py-6 text-white sm:px-6 md:px-8 lg:px-10 lg:py-10">
      {/* Soft ambient light (very subtle, no grid) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.11),transparent_65%)]"
      />

      <div className="relative mx-auto w-full max-w-7xl space-y-5 sm:space-y-6">
        {/* Header with quick actions */}
        <header className="ersms-fade-up ersms-gold-border relative overflow-hidden rounded-2xl border bg-gradient-to-b from-[#131313] to-[#0b0b0b] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.5)] sm:p-7">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
          />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="mb-2 flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#B87333]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#B87333]" />
                Overview
              </p>

              <h1 className="ersms-gold-bright text-3xl font-extrabold tracking-tight sm:text-4xl">
                {t("dashboard", lang)}
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/55 sm:text-base sm:leading-7">
                {t("shopUpdateToday", lang)}
              </p>

              <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/60">
                <CalendarDays size={14} aria-hidden="true" className="text-[#D4AF37]" />
                {todayLabel}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
              <Link
                href="/customers/new"
                className="ersms-gold-button inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-extrabold transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/40 active:translate-y-0 motion-reduce:hover:translate-y-0"
              >
                <Plus size={17} aria-hidden="true" />
                {t("addCustomer", lang)}
              </Link>

              <Link
                href="/repairs/new"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-[#161616] px-5 text-sm font-bold text-white/85 transition-all duration-200 hover:border-[#D4AF37]/55 hover:bg-[#1c1c1c] hover:text-[#F5D76E] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/30"
              >
                <Plus size={17} aria-hidden="true" className="text-[#D4AF37]" />
                {t("createRepair", lang)}
              </Link>

              <Link
                href="/inventory/new"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-[#161616] px-5 text-sm font-bold text-white/85 transition-all duration-200 hover:border-[#D4AF37]/55 hover:bg-[#1c1c1c] hover:text-[#F5D76E] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/30"
              >
                <Plus size={17} aria-hidden="true" className="text-[#D4AF37]" />
                {t("addSparePart", lang)}
              </Link>
            </div>
          </div>
        </header>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            const cardClass =
              "ersms-fade-up ersms-gold-line group relative block min-w-0 overflow-hidden rounded-2xl border bg-[#0f0f0f] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-all duration-200 sm:p-5";

            const content = (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${stat.tone}`}
                  >
                    <Icon size={20} aria-hidden="true" />
                  </div>

                  {stat.href && (
                    <ArrowUpRight
                      size={18}
                      aria-hidden="true"
                      className="text-white/30 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#F5D76E]"
                    />
                  )}
                </div>

                <p className="mt-4 break-words text-2xl font-extrabold tabular-nums tracking-tight text-white sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white/50">
                  {stat.label}
                </p>
              </>
            );

            const style = { animationDelay: `${80 + i * 50}ms` };

            return stat.href ? (
              <Link
                key={stat.label}
                href={stat.href}
                style={style}
                className={`${cardClass} hover:-translate-y-0.5 hover:border-[#D4AF37]/60 hover:bg-[#14130e] hover:shadow-[0_16px_40px_rgba(212,175,55,0.08)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/30 motion-reduce:hover:translate-y-0`}
              >
                {content}
              </Link>
            ) : (
              <div key={stat.label} style={style} className={cardClass}>
                {content}
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className={`grid grid-cols-1 gap-5 sm:gap-6 ${isFinancial ? "lg:grid-cols-2" : ""}`}>
          {isFinancial && (
            <Panel title={t("incomeOverview", lang)} delay={400}>
              <div className="min-w-0">
                <IncomeChart data={incomeChartData} />
              </div>
            </Panel>
          )}

          <Panel title={t("repairStatus", lang)} delay={450}>
            <div className="min-w-0">
              <RepairStatusChart data={statusChartData} />
            </div>
          </Panel>
        </div>

        {/* Recent tickets */}
        <Panel
          title={t("recentRepairTickets", lang)}
          delay={500}
          action={
            <Link
              href="/repairs"
              className="ersms-gold-border inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-bold text-[#F5D76E] transition-all duration-200 hover:bg-[#D4AF37]/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/30"
            >
              {t("viewAll", lang)}
              <ChevronRight size={14} aria-hidden="true" />
            </Link>
          }
        >
          {recentTickets.length > 0 ? (
            <ul className="space-y-2.5">
              {recentTickets.map((ticket) => (
                <li key={ticket.id}>
                  <Link
                    href={`/repairs/${ticket.id}`}
                    className="ersms-gold-line group flex flex-col gap-2 rounded-xl border bg-[#0a0a0a] p-4 transition-all duration-200 hover:border-[#D4AF37]/55 hover:bg-[#14130e] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/30 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <div className="min-w-0">
                      <p className="ersms-gold-bright text-sm font-extrabold">
                        {ticket.ticketNumber}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-white/55">
                        {ticket.customer.name}
                        <span className="mx-1.5 text-white/25">•</span>
                        {ticket.deviceBrand} {ticket.deviceModel}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex w-fit items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[ticket.status]}`}
                      >
                        {ticket.status.replace(/_/g, " ")}
                      </span>
                      <ChevronRight
                        size={16}
                        aria-hidden="true"
                        className="hidden text-white/25 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#F5D76E] sm:block"
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
              <ClipboardList size={28} aria-hidden="true" className="text-[#D4AF37]/70" />
              <p className="text-sm font-semibold text-white/60">{t("noResultsYet", lang)}</p>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}