import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Receipt, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/format-currency";
import { requireFinancialAccess, UnauthorizedError, ForbiddenError } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import { DeleteExpenseButton } from "./delete-expense-button";
import { EXPENSE_CATEGORIES } from "@/lib/expense-categories";

const categoryLabels: Record<string, string> = {
  TEA_COFFEE: "Tea & Coffee",
  FOOD: "Food",
  TRANSPORT: "Transport",
  UTILITIES: "Utilities",
  USED_DEVICE_PURCHASE: "Used Device Purchase",
  PARTS_PURCHASE: "Parts Purchase",
  OTHER: "Other",
};

const categoryStyles: Record<string, string> = {
  TEA_COFFEE: "border-amber-400/40 bg-amber-500/15 text-amber-200",
  FOOD: "border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
  TRANSPORT: "border-blue-400/40 bg-blue-500/15 text-blue-200",
  UTILITIES: "border-purple-400/40 bg-purple-500/15 text-purple-200",
  USED_DEVICE_PURCHASE: "border-[#B87333]/50 bg-[#B87333]/20 text-[#F0B27A]",
  PARTS_PURCHASE: "border-teal-400/40 bg-teal-500/15 text-teal-200",
  OTHER: "border-white/20 bg-white/10 text-white/75",
};

const pillBase =
  "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  // Defense-in-depth: middleware (if configured) also blocks non-financial
  // roles from this route, but the page/query itself must never serve
  // expense data to a role that shouldn't see it.
  try {
    await requireFinancialAccess();
  } catch (e) {
    if (e instanceof UnauthorizedError || e instanceof ForbiddenError) {
      redirect("/dashboard");
    }
    throw e;
  }

  const { category } = await searchParams;

  const expenses = await prisma.expense.findMany({
    where: {
      deletedAt: null,
      ...(category ? { category: category as any } : {}),
    },
    orderBy: { date: "desc" },
  });

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="relative min-h-full overflow-hidden bg-[#050505] px-4 py-6 text-white sm:px-6 md:px-8 lg:px-10 lg:py-10">
      {/* Soft ambient light (very subtle, no grid) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.10),transparent_65%)]"
      />

      <div className="relative mx-auto w-full max-w-5xl space-y-5 sm:space-y-6">
        {/* Header */}
        <header className="ersms-fade-up ersms-gold-border relative overflow-hidden rounded-2xl border bg-gradient-to-b from-[#131313] to-[#0b0b0b] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.5)] sm:p-7">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
          />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="mb-2 flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#B87333]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#B87333]" />
                Finance
              </p>

              <h1 className="ersms-gold-bright text-3xl font-extrabold tracking-tight sm:text-4xl">
                Shop Expenses
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/55 sm:text-base sm:leading-7">
                Shop spending separate from customer repair payments.
              </p>
            </div>

            <Link
              href="/expenses/new"
              className="ersms-gold-button inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl px-6 text-sm font-extrabold transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/40 active:translate-y-0"
            >
              <Plus size={18} aria-hidden="true" />
              Add Expense
            </Link>
          </div>
        </header>

        {/* Total */}
        <div
          className="ersms-fade-up flex items-center gap-4 rounded-2xl border border-red-400/35 bg-red-500/[0.07] p-4 sm:p-5"
          style={{ animationDelay: "60ms" }}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-400/40 bg-red-500/15">
            <TrendingDown size={20} aria-hidden="true" className="text-red-300" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/50">
              {category ? `${categoryLabels[category] ?? category} total` : "Total (filtered view)"}
            </p>
            <p className="mt-0.5 text-2xl font-extrabold text-red-300 sm:text-3xl">
              {formatCurrency(total)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div
          className="ersms-fade-up flex flex-wrap gap-2"
          style={{ animationDelay: "100ms" }}
        >
          <Link
            href="/expenses"
            className={`inline-flex min-h-10 items-center justify-center rounded-xl border px-4 text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/30 ${
              !category
                ? "ersms-gold-button border-transparent"
                : "border-[#D4AF37]/25 bg-[#0f0f0f] text-white/65 hover:border-[#D4AF37]/55 hover:bg-[#D4AF37]/10 hover:text-[#F5D76E]"
            }`}
          >
            All
          </Link>
          {EXPENSE_CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/expenses?category=${c}`}
              className={`inline-flex min-h-10 items-center justify-center rounded-xl border px-4 text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/30 ${
                category === c
                  ? "ersms-gold-button border-transparent"
                  : "border-[#D4AF37]/25 bg-[#0f0f0f] text-white/65 hover:border-[#D4AF37]/55 hover:bg-[#D4AF37]/10 hover:text-[#F5D76E]"
              }`}
            >
              {categoryLabels[c]}
            </Link>
          ))}
        </div>

        {/* Expenses list */}
        <div className="space-y-3">
          {expenses.map((e, i) => (
            <div
              key={e.id}
              className="ersms-fade-up ersms-gold-line flex flex-col gap-3 rounded-2xl border bg-[#0f0f0f] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-all duration-200 hover:border-[#D4AF37]/55 hover:bg-[#14130e] sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              <div className="min-w-0">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <span className={`${pillBase} ${categoryStyles[e.category]}`}>
                    {categoryLabels[e.category]}
                  </span>
                  <span className="text-xs text-white/40">{e.date.toLocaleDateString()}</span>
                </div>
                <p className="truncate text-sm text-white/70">{e.description}</p>
              </div>

              <div className="flex shrink-0 items-center gap-4">
                <p className="text-lg font-extrabold text-red-300">{formatCurrency(e.amount)}</p>
                <DeleteExpenseButton id={e.id} />
              </div>
            </div>
          ))}
        </div>

        {expenses.length === 0 && (
          <div className="ersms-gold-line flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-[#0d0d0d] px-6 py-14 text-center">
            <Receipt size={30} aria-hidden="true" className="text-[#D4AF37]/70" />
            <p className="text-sm font-semibold text-white/60">No expenses recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}