import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Search,
  Plus,
  Clock,
  X,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  ClipboardList,
} from "lucide-react";
import { formatCurrency } from "@/lib/format-currency";
import { getLanguage } from "@/lib/language";
import { t } from "@/lib/translations";
import { requireAuth, canSeeFinancials } from "@/lib/auth-guard";
import { getOverdueCategory, overdueCategoryLabels, overdueCategoryStyles, overdueCutoffDate, TRACKABLE_STATUSES } from "@/lib/overdue";

const statusStyles: Record<string, string> = {
  RECEIVED: "border-white/20 bg-white/10 text-white/85",
  DIAGNOSING: "border-purple-400/40 bg-purple-500/15 text-purple-200",
  WAITING_FOR_PARTS: "border-amber-400/40 bg-amber-500/15 text-amber-200",
  REPAIRING: "border-[#B87333]/50 bg-[#B87333]/20 text-[#F0B27A]",
  COMPLETED: "border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
  DELIVERED: "border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#F5D76E]",
};

const statusLabels: Record<string, string> = {
  RECEIVED: "Received",
  DIAGNOSING: "Diagnosing",
  WAITING_FOR_PARTS: "Waiting for Parts",
  REPAIRING: "Repairing",
  COMPLETED: "Completed",
  DELIVERED: "Delivered",
};

const pillBase =
  "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold";

const fieldClass =
  "h-12 w-full rounded-xl border border-[#D4AF37]/30 bg-[#0a0a0a] px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/30 hover:border-[#D4AF37]/55 focus:border-[#D4AF37] focus:bg-[#0d0c08] focus:ring-4 focus:ring-[#D4AF37]/15 [color-scheme:dark]";

const thClass =
  "ersms-gold-bright px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em]";

export default async function RepairsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; technicianId?: string; overdue?: string }>;
}) {
  const lang = await getLanguage();
  const currentUser = await requireAuth();
  const isFinancial = canSeeFinancials(currentUser.role);
  const { search, status, technicianId, overdue } = await searchParams;

  const where: any = { deletedAt: null };
  // Private (owner-only) repairs are excluded from this query for anyone
  // who isn't an Administrator — server-side, not just hidden in the UI.
  // This was missing from the original Day 2 rollout; adding it here
  // because Day 4's overdue detection must not surface private repairs
  // to unauthorized staff, and this is the query that feeds it.
  if (currentUser.role !== "ADMINISTRATOR") {
    where.visibility = "NORMAL";
  }
  if (search) {
    where.OR = [
      { ticketNumber: { contains: search, mode: "insensitive" } },
      { customer: { name: { contains: search, mode: "insensitive" } } },
    ];
  }
  if (status) where.status = status;
  if (technicianId) where.assignedTechnicianId = technicianId;
  if (overdue === "1") {
    // Data-driven filter, not a client-side label: only tickets whose
    // status is still trackable AND whose intake date is at or before
    // the 30-day cutoff are returned at all.
    where.status = { in: [...TRACKABLE_STATUSES] };
    where.dateReceived = { lte: overdueCutoffDate() };
  }

  const tickets = await prisma.repairTicket.findMany({ where, include: { customer: true }, orderBy: { createdAt: "desc" } });
  const technicians = await prisma.user.findMany({ where: { isActive: true } });

  return (
    <div className="relative min-h-full overflow-hidden bg-[#050505] px-4 py-6 text-white sm:px-6 md:px-8 lg:px-10 lg:py-10">
      {/* Soft ambient light (very subtle, no grid) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.10),transparent_65%)]"
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <header className="ersms-fade-up ersms-gold-border relative mb-5 overflow-hidden rounded-2xl border bg-gradient-to-b from-[#131313] to-[#0b0b0b] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.5)] sm:p-7">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
          />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="ersms-gold mb-2 flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.2em]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                Repair Management
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <h1 className="ersms-gold-bright text-3xl font-extrabold tracking-tight sm:text-4xl">
                  {t("repairTickets", lang)}
                </h1>

                <span className="ersms-gold-border inline-flex items-baseline gap-1.5 rounded-full border bg-[#D4AF37]/[0.07] px-3.5 py-1.5 text-sm font-bold text-[#F5D76E]">
                  {tickets.length}
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    {tickets.length === 1 ? "ticket" : "tickets"}
                  </span>
                </span>
              </div>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
                Follow every device from intake to delivery.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={overdue === "1" ? "/repairs" : "/repairs?overdue=1"}
                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-400/30 ${
                  overdue === "1"
                    ? "border-red-500 bg-red-600 text-white hover:bg-red-700"
                    : "border-red-400/40 bg-red-500/[0.08] text-red-300 hover:border-red-400/70 hover:bg-red-500/[0.16]"
                }`}
              >
                {overdue === "1" ? (
                  <>
                    <X size={16} aria-hidden="true" />
                    Showing Overdue Only
                  </>
                ) : (
                  <>
                    <Clock size={16} aria-hidden="true" />
                    Overdue / Forgotten
                  </>
                )}
              </Link>

              <Link
                href="/repairs/new"
                className="ersms-gold-button inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-extrabold transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/40 active:translate-y-0"
              >
                <Plus size={18} aria-hidden="true" />
                {t("createRepair", lang)}
              </Link>
            </div>
          </div>
        </header>

        {/* Search and filters */}
        <form
          className="ersms-fade-up ersms-gold-line mb-6 grid gap-3 rounded-2xl border bg-[#0d0d0d] p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:p-5"
          style={{ animationDelay: "60ms" }}
        >
          <div className="group relative sm:col-span-2 lg:col-span-1">
            <Search
              size={17}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/60 transition-colors duration-200 group-focus-within:text-[#F5D76E]"
            />
            <input
              type="text"
              name="search"
              defaultValue={search}
              aria-label="Search ticket number or customer"
              placeholder="Search ticket # or customer..."
              className={`${fieldClass} pl-11`}
            />
          </div>

          <div className="relative">
            <select
              name="status"
              defaultValue={status ?? ""}
              aria-label="Filter by status"
              className={`${fieldClass} cursor-pointer appearance-none pr-10 lg:min-w-[180px] [&>option]:bg-[#111111] [&>option]:text-white`}
            >
              <option value="">All Statuses</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
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
              name="technicianId"
              defaultValue={technicianId ?? ""}
              aria-label="Filter by technician"
              className={`${fieldClass} cursor-pointer appearance-none pr-10 lg:min-w-[190px] [&>option]:bg-[#111111] [&>option]:text-white`}
            >
              <option value="">All Technicians</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>{tech.fullName}</option>
              ))}
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

        {/* Cards: phones, tablets and small laptops */}
        <div className="grid gap-3 sm:grid-cols-2 xl:hidden">
          {tickets.map((ticket, index) => {
            const overdueCategory = getOverdueCategory(ticket.status, ticket.dateReceived);
            return (
              <Link
                key={ticket.id}
                href={`/repairs/${ticket.id}`}
                className="ersms-fade-up ersms-gold-line group block rounded-2xl border bg-[#0f0f0f] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#14130e] hover:shadow-[0_16px_40px_rgba(212,175,55,0.08)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/30 sm:p-5"
                style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="ersms-gold-bright text-base font-extrabold tracking-tight">
                    {ticket.ticketNumber}
                  </span>
                  <span className={`${pillBase} ${statusStyles[ticket.status]}`}>
                    {statusLabels[ticket.status]}
                  </span>
                </div>

                {(overdueCategory === "OVERDUE" || overdueCategory === "NEEDS_ATTENTION") && (
                  <span
                    className={`mb-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${overdueCategoryStyles[overdueCategory]}`}
                  >
                    {overdueCategoryLabels[overdueCategory]}
                  </span>
                )}

                <p className="text-[15px] font-bold text-white">{ticket.customer.name}</p>
                <p className="mb-3 mt-0.5 text-sm text-white/55">
                  {ticket.deviceBrand} {ticket.deviceModel}
                </p>

                <div className="ersms-gold-line flex items-center justify-between gap-3 border-t pt-3 text-sm">
                  {isFinancial ? (
                    <span className="text-white/60">
                      {t("estCost", lang)}:{" "}
                      <span className="font-bold text-[#F5D76E]">{formatCurrency(ticket.estimatedCost)}</span>
                    </span>
                  ) : (
                    <span className="text-white/60">{ticket.deviceType.replace(/_/g, " ")}</span>
                  )}
                  <span className="text-white/50">{ticket.dateReceived.toLocaleDateString()}</span>
                </div>
              </Link>
            );
          })}

          {tickets.length === 0 && (
            <div className="ersms-gold-line flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-[#0d0d0d] px-6 py-14 text-center sm:col-span-2">
              <ClipboardList size={30} aria-hidden="true" className="text-[#D4AF37]/70" />
              <p className="text-sm font-semibold text-white/60">{t("noResultsYet", lang)}</p>
            </div>
          )}
        </div>

        {/* Table: large desktop screens */}
        <div
          className="ersms-fade-up ersms-gold-border hidden overflow-x-auto rounded-2xl border bg-[#0d0d0d] shadow-[0_20px_60px_rgba(0,0,0,0.45)] xl:block"
          style={{ animationDelay: "100ms" }}
        >
          <table className="w-full text-sm">
            <thead className="ersms-gold-border border-b bg-[#D4AF37]/[0.07]">
              <tr>
                <th scope="col" className={thClass}>Ticket #</th>
                <th scope="col" className={thClass}>{t("customer", lang)}</th>
                <th scope="col" className={thClass}>{t("device", lang)}</th>
                <th scope="col" className={thClass}>{t("status", lang)}</th>
                <th scope="col" className={thClass}>Attention</th>
                {isFinancial && (
                  <>
                    <th scope="col" className={thClass}>{t("estCost", lang)}</th>
                    <th scope="col" className={thClass}>{t("balance", lang)}</th>
                  </>
                )}
                <th scope="col" className={thClass}>{t("received", lang)}</th>
                <th scope="col" className={thClass}>{t("actions", lang)}</th>
              </tr>
            </thead>

            <tbody>
              {tickets.map((ticket) => {
                const overdueCategory = getOverdueCategory(ticket.status, ticket.dateReceived);
                return (
                  <tr
                    key={ticket.id}
                    className="ersms-gold-line group border-b transition-colors duration-200 last:border-0 hover:bg-[#D4AF37]/[0.06]"
                  >
                    <td className="ersms-gold-bright px-5 py-4 font-extrabold transition-shadow duration-200 group-hover:shadow-[inset_3px_0_0_#D4AF37]">
                      {ticket.ticketNumber}
                    </td>
                    <td className="px-5 py-4 font-bold text-white">{ticket.customer.name}</td>
                    <td className="px-5 py-4 text-white/60">
                      {ticket.deviceBrand} {ticket.deviceModel}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`${pillBase} ${statusStyles[ticket.status]}`}>
                        {statusLabels[ticket.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {(overdueCategory === "OVERDUE" || overdueCategory === "NEEDS_ATTENTION") && (
                        <span
                          className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${overdueCategoryStyles[overdueCategory]}`}
                        >
                          {overdueCategoryLabels[overdueCategory]}
                        </span>
                      )}
                    </td>
                    {isFinancial && (
                      <>
                        <td className="px-5 py-4 font-semibold text-white/80">
                          {formatCurrency(ticket.estimatedCost)}
                        </td>
                        <td className="px-5 py-4 font-bold text-[#F5D76E]">
                          {formatCurrency(ticket.estimatedCost - ticket.depositAmount)}
                        </td>
                      </>
                    )}
                    <td className="whitespace-nowrap px-5 py-4 text-white/55">
                      {ticket.dateReceived.toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/repairs/${ticket.id}`}
                        className="ersms-gold-border inline-flex items-center gap-1 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-bold text-[#F5D76E] transition-all duration-200 hover:bg-[#D4AF37]/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/30"
                      >
                        {t("viewProfile", lang)}
                        <ChevronRight
                          size={14}
                          aria-hidden="true"
                          className="transition-transform duration-200 group-hover:translate-x-0.5"
                        />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {tickets.length === 0 && (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <ClipboardList size={30} aria-hidden="true" className="text-[#D4AF37]/70" />
              <p className="text-sm font-semibold text-white/60">{t("noResultsYet", lang)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}