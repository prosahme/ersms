import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getLanguage } from "@/lib/language";
import { t } from "@/lib/translations";
import { CustomersList } from "./customers-list";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const lang = await getLanguage();
  const { search } = await searchParams;

  const customers = await prisma.customer.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, phone: true, email: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="relative min-h-full overflow-hidden bg-[#050505] px-4 py-6 text-white sm:px-6 md:px-8 lg:px-10 lg:py-10">
      {/* Soft ambient light (very subtle, no grid) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.10),transparent_65%)]"
      />

      <div className="relative mx-auto w-full max-w-7xl space-y-5 sm:space-y-6">
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
                Customer Management
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <h1 className="ersms-gold-bright text-3xl font-extrabold tracking-tight sm:text-4xl">
                  {t("customers", lang)}
                </h1>

                <span className="ersms-gold-border inline-flex items-baseline gap-1.5 rounded-full border bg-[#D4AF37]/[0.07] px-3.5 py-1.5 text-sm font-bold text-[#F5D76E]">
                  {customers.length}
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    {customers.length === 1 ? "customer" : "customers"}
                  </span>
                </span>
              </div>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/55 sm:text-base sm:leading-7">
                {t("manageCustomers", lang)}
              </p>
            </div>

            <Link
              href="/customers/new"
              className="ersms-gold-button inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-extrabold transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/40 active:translate-y-0 motion-reduce:hover:translate-y-0"
            >
              <Plus size={18} aria-hidden="true" />
              {t("addCustomer", lang)}
            </Link>
          </div>
        </header>

        {/* Search and list */}
        <div className="ersms-fade-up min-w-0" style={{ animationDelay: "80ms" }}>
          <CustomersList customers={customers} lang={lang} initialQuery={search ?? ""} />
        </div>
      </div>
    </div>
  );
}