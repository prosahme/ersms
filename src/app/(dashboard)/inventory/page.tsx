import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Package, AlertTriangle, ChevronRight, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { DeletePartButton } from "./delete-button";
import { formatCurrency } from "@/lib/format-currency";
import { getLanguage } from "@/lib/language";
import { t } from "@/lib/translations";

const fieldClass =
  "h-12 w-full rounded-xl border border-[#D4AF37]/30 bg-[#0a0a0a] px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/30 hover:border-[#D4AF37]/55 focus:border-[#D4AF37] focus:bg-[#0d0c08] focus:ring-4 focus:ring-[#D4AF37]/15 [color-scheme:dark]";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; lowStock?: string }>;
}) {
  const lang = await getLanguage();
  const { search, category, lowStock } = await searchParams;

  const allParts = await prisma.sparePart.findMany({ where: { deletedAt: null } });
  const lowStockCount = allParts.filter((p) => p.quantityAvailable <= p.lowStockThreshold).length;

  const categories = Array.from(new Set(allParts.map((p) => p.category))).sort((a, b) =>
    a.localeCompare(b)
  );

  const isLowStockOnly = lowStock === "1";

  const parts = allParts
    .filter((p) => {
      if (category && p.category !== category) return false;
      if (isLowStockOnly && p.quantityAvailable > p.lowStockThreshold) return false;
      if (search) {
        const q = search.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const hasActiveFilters = Boolean(search || category || isLowStockOnly);

  return (
    <div className="relative min-h-full overflow-hidden bg-[#050505] px-4 py-6 text-white sm:px-6 md:px-8 lg:px-10 lg:py-10">
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
                Inventory
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <h1 className="ersms-gold-bright text-3xl font-extrabold tracking-tight sm:text-4xl">
                  {t("inventory", lang)}
                </h1>

                <span className="ersms-gold-border inline-flex items-baseline gap-1.5 rounded-full border bg-[#D4AF37]/[0.07] px-3.5 py-1.5 text-sm font-bold text-[#F5D76E]">
                  {allParts.length}
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    {allParts.length === 1 ? "part" : "parts"}
                  </span>
                </span>

                {lowStockCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/40 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-300">
                    <AlertTriangle size={13} aria-hidden="true" />
                    {lowStockCount} low stock
                  </span>
                )}
              </div>
            </div>

            <Link
              href="/inventory/new"
              className="ersms-gold-button inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-extrabold transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/40 active:translate-y-0"
            >
              <Plus size={18} aria-hidden="true" />
              {t("addSparePart", lang)}
            </Link>
          </div>
        </header>

        {/* Filter form: Category dropdown + Low Stock dropdown + Filter button */}
        <form
          method="get"
          className="ersms-fade-up ersms-gold-line grid grid-cols-1 gap-3 rounded-2xl border bg-[#0d0d0d] p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:p-5"
          style={{ animationDelay: "60ms" }}
        >
          {search && <input type="hidden" name="search" value={search} />}

          <div className="relative">
            <select
              name="category"
              defaultValue={category ?? ""}
              aria-label="Filter by category"
              className={`${fieldClass} cursor-pointer appearance-none pr-10 [&>option]:bg-[#111111] [&>option]:text-white`}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/70"
            />
          </div>

          <div className="relative">
            <select
              name="lowStock"
              defaultValue={lowStock ?? ""}
              aria-label="Filter by stock level"
              className={`${fieldClass} cursor-pointer appearance-none pr-10 [&>option]:bg-[#111111] [&>option]:text-white`}
            >
              <option value="">All Stock Levels</option>
              <option value="1">Low Stock Only {lowStockCount > 0 ? `(${lowStockCount})` : ""}</option>
            </select>
            <ChevronDown
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/70"
            />
          </div>

          <button
            type="submit"
            className="ersms-gold-border inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border bg-[#161616] px-6 text-sm font-bold text-[#F5D76E] transition-all duration-200 hover:bg-[#D4AF37]/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/30 sm:col-span-2 lg:col-span-1 lg:w-auto"
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            Filter
          </button>
        </form>

        {hasActiveFilters && (
          <div className="ersms-fade-up flex flex-wrap items-center gap-2 text-sm text-white/55">
            <span>
              Showing {parts.length} {parts.length === 1 ? "result" : "results"}
              {search && (
                <>
                  {" "}for <span className="font-bold text-[#F5D76E]">&ldquo;{search}&rdquo;</span>
                </>
              )}
            </span>
            <Link
              href="/inventory"
              className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-xs font-bold text-white/60 transition-colors duration-200 hover:border-[#D4AF37]/50 hover:text-[#F5D76E]"
            >
              <X size={12} aria-hidden="true" />
              Clear all
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {parts.map((part, i) => {
            const isLowStock = part.quantityAvailable <= part.lowStockThreshold;
            return (
              <div
                key={part.id}
                className={`ersms-fade-up group relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-[#0f0f0f] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-all duration-200 hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${
                  isLowStock
                    ? "border-red-400/35 hover:border-red-400/60"
                    : "ersms-gold-line hover:border-[#D4AF37]/55 hover:bg-[#14130e]"
                }`}
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              >
                {isLowStock && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-red-500" />}

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <p className="truncate text-[15px] font-extrabold text-white">{part.name}</p>
                    {isLowStock && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-red-400/40 bg-red-500/10 px-2.5 py-0.5 text-xs font-bold text-red-300">
                        <AlertTriangle size={11} aria-hidden="true" />
                        {t("lowStock", lang)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                    <span className="inline-flex items-center rounded-full border border-purple-400/30 bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-200">
                      {part.category}
                    </span>
                    <span className="text-white/60">{part.quantityAvailable} units</span>
                    <span className="font-bold text-[#F5D76E]">{formatCurrency(part.unitPrice)}</span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-4 border-t border-white/10 pt-3 sm:border-t-0 sm:pt-0">
                  <Link
                    href={`/inventory/${part.id}/edit`}
                    className="inline-flex items-center gap-1 text-sm font-bold text-[#F5D76E] hover:underline"
                  >
                    {t("edit", lang)}
                    <ChevronRight size={14} aria-hidden="true" />
                  </Link>
                  <DeletePartButton id={part.id} />
                </div>
              </div>
            );
          })}
        </div>

        {parts.length === 0 && (
          <div className="ersms-gold-line flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-[#0d0d0d] px-6 py-14 text-center">
            <Package size={30} aria-hidden="true" className="text-[#D4AF37]/70" />
            <p className="text-sm font-semibold text-white/60">
              {hasActiveFilters ? "No parts match your filters." : t("noResultsYet", lang)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}