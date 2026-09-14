import { prisma } from "@/lib/prisma";
import Link from "next/link";
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
  TEA_COFFEE: "bg-amber-100 text-amber-700",
  FOOD: "bg-green-100 text-green-700",
  TRANSPORT: "bg-blue-100 text-blue-700",
  UTILITIES: "bg-purple-100 text-purple-700",
  USED_DEVICE_PURCHASE: "bg-orange-100 text-orange-700",
  PARTS_PURCHASE: "bg-teal-100 text-teal-700",
  OTHER: "bg-slate-100 text-slate-600",
};

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
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
        <h1 className="text-2xl font-semibold">Shop Expenses</h1>
        <Link href="/expenses/new" className="rounded-md bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:bg-orange-700 text-center">
          Add Expense
        </Link>
      </div>
      <p className="text-sm text-orange-500 mb-6">Shop spending separate from customer repair payments.</p>

      <div className="bg-white border border-orange-200 rounded-lg p-4 mb-4">
        <p className="text-xs text-slate-500 mb-1">{category ? `${categoryLabels[category] ?? category} Total` : "Total (filtered view)"}</p>
        <p className="text-2xl font-semibold text-red-600">{formatCurrency(total)}</p>
      </div>

      <form className="flex flex-wrap gap-2 mb-4">
        <a href="/expenses" className={`px-3 py-1.5 rounded-md text-sm ${!category ? "bg-orange-600 text-white" : "bg-white border border-orange-300"}`}>All</a>
        {EXPENSE_CATEGORIES.map((c) => (
          <a key={c} href={`/expenses?category=${c}`} className={`px-3 py-1.5 rounded-md text-sm ${category === c ? "bg-orange-600 text-white" : "bg-white border border-orange-300"}`}>
            {categoryLabels[c]}
          </a>
        ))}
      </form>

      <div className="space-y-3">
        {expenses.map((e) => (
          <div key={e.id} className="bg-white border border-orange-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryStyles[e.category]}`}>{categoryLabels[e.category]}</span>
                <span className="text-xs text-slate-400">{e.date.toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-slate-600">{e.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-lg font-semibold text-red-600">{formatCurrency(e.amount)}</p>
              <DeleteExpenseButton id={e.id} />
            </div>
          </div>
        ))}
      </div>
      {expenses.length === 0 && <p className="text-center text-slate-500 py-8">No expenses recorded yet.</p>}
    </div>
  );
}
