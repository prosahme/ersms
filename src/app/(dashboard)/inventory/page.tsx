import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Package, AlertTriangle, ChevronRight } from "lucide-react";
import { DeletePartButton } from "./delete-button";
import { formatCurrency } from "@/lib/format-currency";
import { getLanguage } from "@/lib/language";
import { t } from "@/lib/translations";

export default async function InventoryPage() {
  const lang = await getLanguage();
  const parts = await prisma.sparePart.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });
  const lowStockCount = parts.filter((p) => p.quantityAvailable <= p.lowStockThreshold).length;

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
                Inventory
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <h1 className="ersms-gold-bright text-3xl font-extrabold tracking-tight sm:text-4xl">
                  {t("inventory", lang)}
                </h1>

                <span className="ersms-gold-border inline-flex items-baseline gap-1.5 rounded-full border bg-[#D4AF37]/[0.07] px-3.5 py-1.5 text-sm font-bold text-[#F5D76E]">
                  {parts.length}
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    {parts.length === 1 ? "part" : "parts"}
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

        {/* Parts list */}
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
                {isLowStock && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-1 bg-red-500"
                  />
                )}

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
            <p className="text-sm font-semibold text-white/60">{t("noResultsYet", lang)}</p>
          </div>
        )}
      </div>
    </div>
  );
}