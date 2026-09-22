import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format-currency";
import { RevenueTrendChart } from "@/components/shared/revenue-trend-chart";
import { RepairStatusChart } from "@/components/shared/repair-status-chart";
import { getLanguage } from "@/lib/language";
import { t } from "@/lib/translations";
import { requireFinancialAccess, UnauthorizedError, ForbiddenError } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import {
  Wallet,
  CalendarDays,
  TrendingUp,
  Receipt,
  TrendingDown,
  Scale,
  PieChart,
  Activity,
  Smartphone,
  Package,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const statusColorNames: Record<string, string> = {
  DIAGNOSING: "Diagnosing",
  WAITING_FOR_PARTS: "Waiting for Parts",
  REPAIRING: "Repairing",
  COMPLETED: "Completed",
  DELIVERED: "Delivered",
};

function Panel({
  title,
  icon: Icon,
  delay = 0,
  children,
}: {
  title: string;
  icon: LucideIcon;
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
      <h2 className="ersms-gold-bright mb-4 flex items-center justify-between gap-3 text-xs font-extrabold uppercase tracking-[0.14em]">
        {title}
        <Icon size={17} aria-hidden="true" className="text-[#D4AF37]/70" />
      </h2>
      {children}
    </section>
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
  tone,
  delay = 0,
  sub,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: string;
  delay?: number;
  sub?: string;
}) {
  return (
    <div
      className="ersms-fade-up ersms-gold-line relative min-w-0 overflow-hidden rounded-2xl border bg-[#0f0f0f] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.4)] sm:p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl border ${tone}`}>
        <Icon size={18} aria-hidden="true" />
      </div>
      <p className="break-words text-xl font-extrabold tabular-nums tracking-tight text-white sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.1em] text-white/50">{label}</p>
      {sub && <p className="mt-1 text-[11px] text-white/35">{sub}</p>}
    </div>
  );
}

function BarRow({
  label,
  value,
  displayValue,
  max,
  barClass,
  trackClass,
}: {
  label: string;
  value: number;
  displayValue: string;
  max: number;
  barClass: string;
  trackClass: string;
}) {
  const pct = max > 0 ? Math.max((value / max) * 100, value > 0 ? 3 : 0) : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
        <span className="min-w-0 truncate font-semibold text-white/75">{label}</span>
        <span className="shrink-0 font-extrabold text-white">{displayValue}</span>
      </div>
      <div className={`h-2 overflow-hidden rounded-full ${trackClass}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${barClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default async function ReportsPage() {
  try {
    await requireFinancialAccess();
  } catch (e) {
    if (e instanceof UnauthorizedError || e instanceof ForbiddenError) {
      redirect("/dashboard");
    }
    throw e;
  }

  const lang = await getLanguage();
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todayPayments, weekPayments, monthPayments, statusCounts, deviceGroups, partGroups, todayExpenses, weekExpenses, monthExpenses, monthExpenseByCategory] = await Promise.all([
    prisma.payment.findMany({ where: { createdAt: { gte: startOfToday } } }),
    prisma.payment.findMany({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.payment.findMany({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.repairTicket.groupBy({ by: ["status"], where: { deletedAt: null }, _count: true }),
    prisma.repairTicket.groupBy({ by: ["deviceModel"], where: { deletedAt: null }, _count: true }),
    prisma.repairPart.groupBy({ by: ["partId"], _sum: { quantityUsed: true } }),
    prisma.expense.findMany({ where: { deletedAt: null, date: { gte: startOfToday } } }),
    prisma.expense.findMany({ where: { deletedAt: null, date: { gte: sevenDaysAgo } } }),
    prisma.expense.findMany({ where: { deletedAt: null, date: { gte: startOfMonth } } }),
    prisma.expense.groupBy({ by: ["category"], where: { deletedAt: null, date: { gte: startOfMonth } }, _sum: { amount: true } }),
  ]);

  const sum = (arr: { amount: number }[]) => arr.reduce((s, p) => s + p.amount, 0);
  const todayIncome = sum(todayPayments);
  const weekIncome = sum(weekPayments);
  const monthIncome = sum(monthPayments);

  const todayExpenseTotal = sum(todayExpenses);
  const weekExpenseTotal = sum(weekExpenses);
  const monthExpenseTotal = sum(monthExpenses);

  const netToday = todayIncome - todayExpenseTotal;
  const netWeek = weekIncome - weekExpenseTotal;
  const netMonth = monthIncome - monthExpenseTotal;

  const expenseCategoryLabels: Record<string, string> = {
    TEA_COFFEE: "Tea & Coffee",
    FOOD: "Food",
    TRANSPORT: "Transport",
    UTILITIES: "Utilities",
    USED_DEVICE_PURCHASE: "Used Device Purchase",
    PARTS_PURCHASE: "Parts Purchase",
    OTHER: "Other",
  };
  const expenseBreakdown = [...monthExpenseByCategory]
    .map((g) => ({ category: expenseCategoryLabels[g.category] ?? g.category, amount: g._sum.amount ?? 0 }))
    .sort((a, b) => b.amount - a.amount);
  const maxExpenseCategoryAmount = expenseBreakdown[0]?.amount ?? 1;

  const trendData: { day: string; income: number }[] = [];
  const incomeByDay: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    incomeByDay[d.toLocaleDateString("en-US", { weekday: "short" })] = 0;
  }
  weekPayments.forEach((p) => {
    const label = p.createdAt.toLocaleDateString("en-US", { weekday: "short" });
    if (label in incomeByDay) incomeByDay[label] += p.amount;
  });
  Object.entries(incomeByDay).forEach(([day, income]) => trendData.push({ day, income }));

  const totalStatusCount = statusCounts.reduce((s, sc) => s + sc._count, 0);
  const statusChartData = statusCounts.map((sc) => ({ name: statusColorNames[sc.status] ?? sc.status, value: sc._count }));

  const mostCommonRepairs = [...deviceGroups].sort((a, b) => b._count - a._count).slice(0, 5);
  const maxRepairCount = mostCommonRepairs[0]?._count ?? 1;

  const topPartsRaw = [...partGroups].sort((a, b) => (b._sum.quantityUsed ?? 0) - (a._sum.quantityUsed ?? 0)).slice(0, 5);
  const partIds = topPartsRaw.map((p) => p.partId);
  const parts = await prisma.sparePart.findMany({ where: { id: { in: partIds } } });
  const mostUsedParts = topPartsRaw.map((tp) => ({ name: parts.find((p) => p.id === tp.partId)?.name ?? "Unknown", qty: tp._sum.quantityUsed ?? 0 }));
  const maxPartQty = mostUsedParts[0]?.qty ?? 1;

  return (
    <div className="relative min-h-full overflow-hidden bg-[#050505] px-4 py-6 text-white sm:px-6 md:px-8 lg:px-10 lg:py-10">
      {/* Soft ambient light (very subtle, no grid) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.11),transparent_65%)]"
      />

      <div className="relative mx-auto w-full max-w-7xl space-y-5 sm:space-y-6">
        {/* Header */}
        <header className="ersms-fade-up ersms-gold-border relative overflow-hidden rounded-2xl border bg-gradient-to-b from-[#131313] to-[#0b0b0b] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.5)] sm:p-7">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
          />
          <p className="mb-2 flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#B87333]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#B87333]" />
            Finance
          </p>
          <h1 className="ersms-gold-bright text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("reports", lang)}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/55 sm:text-base sm:leading-7">
            {t("performanceOverview", lang)}
          </p>
        </header>

        {/* Income tiles */}
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-3 sm:gap-4">
          <StatTile
            label={t("todaysIncome", lang)}
            value={formatCurrency(todayIncome)}
            icon={Wallet}
            tone="border-[#D4AF37]/40 bg-[#D4AF37]/12 text-[#F5D76E]"
            delay={60}
          />
          <StatTile
            label={t("weeklyIncome", lang)}
            value={formatCurrency(weekIncome)}
            icon={CalendarDays}
            tone="border-[#D4AF37]/40 bg-[#D4AF37]/12 text-[#F5D76E]"
            delay={100}
          />
          <div
            className="ersms-fade-up relative min-w-0 overflow-hidden rounded-2xl border border-[#D4AF37]/50 bg-gradient-to-br from-[#D4AF37]/20 via-[#B87333]/10 to-[#0f0f0f] p-4 shadow-[0_16px_40px_rgba(212,175,55,0.12)] sm:p-5"
            style={{ animationDelay: "140ms" }}
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[#D4AF37]/50 bg-[#D4AF37]/20 text-[#F5D76E]">
              <TrendingUp size={18} aria-hidden="true" />
            </div>
            <p className="break-words text-xl font-extrabold tabular-nums tracking-tight text-[#F5D76E] sm:text-2xl">
              {formatCurrency(monthIncome)}
            </p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.1em] text-white/60">
              {t("monthlyRevenue", lang)}
            </p>
          </div>
        </div>

        {/* Expense tiles */}
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-3 sm:gap-4">
          <StatTile
            label="Today's Expenses"
            value={formatCurrency(todayExpenseTotal)}
            icon={Receipt}
            tone="border-red-400/40 bg-red-500/12 text-red-300"
            delay={60}
          />
          <StatTile
            label="Weekly Expenses"
            value={formatCurrency(weekExpenseTotal)}
            icon={TrendingDown}
            tone="border-red-400/40 bg-red-500/12 text-red-300"
            delay={100}
          />
          <div
            className={`ersms-fade-up relative min-w-0 overflow-hidden rounded-2xl border p-4 shadow-[0_16px_40px_rgba(0,0,0,0.3)] sm:p-5 ${
              netMonth >= 0
                ? "border-emerald-400/45 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-[#0f0f0f]"
                : "border-red-400/45 bg-gradient-to-br from-red-500/15 via-red-500/5 to-[#0f0f0f]"
            }`}
            style={{ animationDelay: "140ms" }}
          >
            <div
              className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl border ${
                netMonth >= 0
                  ? "border-emerald-400/45 bg-emerald-500/15 text-emerald-300"
                  : "border-red-400/45 bg-red-500/15 text-red-300"
              }`}
            >
              <Scale size={18} aria-hidden="true" />
            </div>
            <p
              className={`break-words text-xl font-extrabold tabular-nums tracking-tight sm:text-2xl ${
                netMonth >= 0 ? "text-emerald-300" : "text-red-300"
              }`}
            >
              {formatCurrency(netMonth)}
            </p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.1em] text-white/60">
              Net Revenue (Month)
            </p>
            <p className="mt-1 truncate text-[11px] text-white/40">
              Today: {formatCurrency(netToday)} · This week: {formatCurrency(netWeek)}
            </p>
          </div>
        </div>

        {/* Expense breakdown + status distribution */}
        <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2">
          <Panel title="Expense Breakdown by Category (This Month)" icon={PieChart} delay={180}>
            <div className="space-y-4">
              {expenseBreakdown.map((e) => (
                <BarRow
                  key={e.category}
                  label={e.category}
                  value={e.amount}
                  displayValue={formatCurrency(e.amount)}
                  max={maxExpenseCategoryAmount}
                  barClass="bg-gradient-to-r from-red-500 to-red-400"
                  trackClass="bg-red-500/10"
                />
              ))}
              {expenseBreakdown.length === 0 && (
                <p className="text-sm text-white/45">No expenses recorded this month.</p>
              )}
            </div>
          </Panel>

          <Panel title={t("repairStatusDistribution", lang)} icon={Activity} delay={220}>
            <div className="min-w-0">
              <RepairStatusChart data={statusChartData} total={totalStatusCount} />
            </div>
          </Panel>
        </div>

        {/* Revenue trend */}
        <div className="ersms-fade-up min-w-0" style={{ animationDelay: "260ms" }}>
          <RevenueTrendChart data={trendData} />
        </div>

        {/* Most common repairs + most used parts */}
        <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2">
          <Panel title={t("mostCommonRepairs", lang)} icon={Smartphone} delay={300}>
            <div className="space-y-4">
              {mostCommonRepairs.map((r) => (
                <BarRow
                  key={r.deviceModel}
                  label={r.deviceModel}
                  value={r._count}
                  displayValue={String(r._count)}
                  max={maxRepairCount}
                  barClass="bg-gradient-to-r from-[#B87333] to-[#F0B27A]"
                  trackClass="bg-[#B87333]/10"
                />
              ))}
              {mostCommonRepairs.length === 0 && (
                <p className="text-sm text-white/45">{t("noResultsYet", lang)}</p>
              )}
            </div>
          </Panel>

          <Panel title={t("mostUsedSpareParts", lang)} icon={Package} delay={340}>
            <div className="space-y-4">
              {mostUsedParts.map((p) => (
                <BarRow
                  key={p.name}
                  label={p.name}
                  value={p.qty}
                  displayValue={`${p.qty} units`}
                  max={maxPartQty}
                  barClass="bg-gradient-to-r from-purple-500 to-purple-400"
                  trackClass="bg-purple-500/10"
                />
              ))}
              {mostUsedParts.length === 0 && (
                <p className="text-sm text-white/45">{t("noResultsYet", lang)}</p>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}