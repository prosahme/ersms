import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format-currency";
import { getLanguage } from "@/lib/language";
import { t } from "@/lib/translations";
import { requireFinancialAccess, UnauthorizedError, ForbiddenError } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import { Wallet, ChevronRight } from "lucide-react";

const typeStyles: Record<string, string> = {
  DEPOSIT: "border-purple-400/40 bg-purple-500/15 text-purple-200",
  PARTIAL: "border-amber-400/40 bg-amber-500/15 text-amber-200",
  FINAL: "border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
};

const pillBase =
  "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ method?: string }>;
}) {
  // Defense-in-depth: middleware also blocks non-financial roles from this
  // route, but the page/query itself must never serve payment data to a
  // role that shouldn't see it, even if the route were reached some other way.
  try {
    await requireFinancialAccess();
  } catch (e) {
    if (e instanceof UnauthorizedError || e instanceof ForbiddenError) {
      redirect("/dashboard");
    }
    throw e;
  }

  const lang = await getLanguage();
  const { method } = await searchParams;
  const methodLabels: Record<string, string> = {
    CASH: t("cash", lang),
    TELEBIRR: t("telebirr", lang),
    BANK_TRANSFER: t("bankTransfer", lang),
  };
  const typeLabels: Record<string, string> = {
    DEPOSIT: t("deposit", lang),
    PARTIAL: t("partial", lang),
    FINAL: t("final", lang),
  };

  const payments = await prisma.payment.findMany({
    where: method ? { paymentMethod: method as any } : {},
    include: { repairTicket: { include: { customer: true } } },
    orderBy: { createdAt: "desc" },
  });

  const total = payments.reduce((sum, p) => sum + p.amount, 0);

  const filters: { label: string; href: string; active: boolean }[] = [
    { label: t("all", lang), href: "/payments", active: !method },
    { label: t("cash", lang), href: "/payments?method=CASH", active: method === "CASH" },
    { label: t("telebirr", lang), href: "/payments?method=TELEBIRR", active: method === "TELEBIRR" },
    { label: t("bankTransfer", lang), href: "/payments?method=BANK_TRANSFER", active: method === "BANK_TRANSFER" },
  ];

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
                {t("payments", lang)}
              </h1>
            </div>

            <div className="ersms-gold-border inline-flex flex-col items-start gap-0.5 rounded-xl border bg-[#D4AF37]/[0.07] px-4 py-3 sm:items-end">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/50">
                {method ? `${methodLabels[method]} total` : "Total shown"}
              </span>
              <span className="text-xl font-extrabold text-[#F5D76E] sm:text-2xl">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div
          className="ersms-fade-up flex flex-wrap gap-2"
          style={{ animationDelay: "60ms" }}
        >
          {filters.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className={`inline-flex min-h-10 items-center justify-center rounded-xl border px-4 text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/30 ${
                f.active
                  ? "ersms-gold-button border-transparent"
                  : "border-[#D4AF37]/25 bg-[#0f0f0f] text-white/65 hover:border-[#D4AF37]/55 hover:bg-[#D4AF37]/10 hover:text-[#F5D76E]"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {/* Payments list */}
        <div className="space-y-3">
          {payments.map((p, i) => (
            <Link
              key={p.id}
              href={`/repairs/${p.repairTicket.id}`}
              className="ersms-fade-up ersms-gold-line group flex flex-col gap-3 rounded-2xl border bg-[#0f0f0f] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D4AF37]/55 hover:bg-[#14130e] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/30 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              <div className="min-w-0">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <span className="ersms-gold-bright font-extrabold">
                    {p.repairTicket.ticketNumber}
                  </span>
                  <span className={`${pillBase} ${typeStyles[p.paymentType]}`}>
                    {typeLabels[p.paymentType]}
                  </span>
                </div>
                <p className="truncate text-sm text-white/55">
                  {p.repairTicket.customer.name}
                  <span className="mx-1.5 text-white/25">•</span>
                  {methodLabels[p.paymentMethod]}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-0.5">
                <p className="text-lg font-extrabold text-[#F5D76E]">{formatCurrency(p.amount)}</p>
                <p className="text-xs text-white/40">{p.createdAt.toLocaleDateString()}</p>
              </div>

              <ChevronRight
                size={16}
                aria-hidden="true"
                className="hidden shrink-0 text-white/25 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#F5D76E] sm:block"
              />
            </Link>
          ))}
        </div>

        {payments.length === 0 && (
          <div className="ersms-gold-line flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-[#0d0d0d] px-6 py-14 text-center">
            <Wallet size={30} aria-hidden="true" className="text-[#D4AF37]/70" />
            <p className="text-sm font-semibold text-white/60">{t("noResultsYet", lang)}</p>
          </div>
        )}
      </div>
    </div>
  );
}