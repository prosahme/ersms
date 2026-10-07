import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  User,
  Smartphone,
  ArrowLeft,
  Phone,
  Mail,
  Hash,
  UserCog,
  FileText,
  StickyNote,
  Images,
  Package,
  History,
  Wallet,
  ChevronDown,
  Plus,
  RefreshCw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MediaUploader } from "./media-uploader";
import { MediaGridItem } from "./media-grid-item";
import { updateStatusAction } from "./status-actions";
import { addPartToRepairAction } from "./parts-actions";
import { PartRowActions } from "./part-row-actions";
import { EstimatedCostEditor } from "./estimated-cost-editor";
import { formatCurrency } from "@/lib/format-currency";
import { addPaymentAction } from "./payment-actions";
import { requireAuth, canSeeFinancials } from "@/lib/auth-guard";

const statusLabels: Record<string, string> = {
  RECEIVED: "Received",
  DIAGNOSING: "Diagnosing",
  WAITING_FOR_PARTS: "Waiting for Parts",
  REPAIRING: "Repairing",
  COMPLETED: "Completed",
  DELIVERED: "Delivered",
};

const statusStyles: Record<string, string> = {
  RECEIVED: "border-white/20 bg-white/10 text-white/85",
  DIAGNOSING: "border-purple-400/40 bg-purple-500/15 text-purple-200",
  WAITING_FOR_PARTS: "border-amber-400/40 bg-amber-500/15 text-amber-200",
  REPAIRING: "border-[#B87333]/50 bg-[#B87333]/20 text-[#F0B27A]",
  COMPLETED: "border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
  DELIVERED: "border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#F5D76E]",
};

const paymentTypeLabels: Record<string, string> = {
  DEPOSIT: "Deposit",
  PARTIAL: "Partial Payment",
  FINAL: "Final Payment",
};

const fieldClass =
  "block h-12 w-full rounded-xl border border-[#D4AF37]/35 bg-[#0a0a0a] px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/30 hover:border-[#D4AF37]/60 focus:border-[#D4AF37] focus:bg-[#0d0c08] focus:ring-4 focus:ring-[#D4AF37]/15 [color-scheme:dark]";

const selectClass = `${fieldClass} cursor-pointer appearance-none pr-11 [&>option]:bg-[#111111] [&>option]:text-white`;

const labelClass =
  "mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#F5D76E]";

const goldBtn =
  "ersms-gold-button inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-extrabold transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/40 active:translate-y-0 sm:w-auto";

function Card({
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
      className="ersms-fade-up ersms-gold-line relative min-w-0 rounded-2xl border bg-[#0f0f0f] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.45)] sm:p-6"
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

function SelectWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/75"
      />
    </div>
  );
}

export default async function RepairDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const currentUser = await requireAuth();
  const isFinancial = canSeeFinancials(currentUser.role);

  const ticket = await prisma.repairTicket.findUnique({
    where: { id },
    include: {
      customer: true,
      media: true,
      statusHistory: { orderBy: { changedAt: "asc" } },
      assignedTechnician: true,
      repairParts: { include: { sparePart: true } },
      // Payment records are only fetched at all for financial roles — a
      // Technician's request never pulls payment data into memory, let
      // alone renders it, so there's nothing to accidentally leak.
      payments: isFinancial,
    },
  });

  if (!ticket) notFound();

  // Server-side enforcement: a private (owner-only) repair is invisible
  // to anyone who isn't an Administrator, even via a direct URL — we
  // return notFound() rather than an "access denied" message so its
  // existence isn't confirmed to unauthorized staff either. This was
  // already correctly enforced on the repairs list query, but was
  // missing here on the detail page itself — closed as part of the
  // Day 6 security regression pass.
  if (ticket.visibility === "PRIVATE" && currentUser.role !== "ADMINISTRATOR") {
    notFound();
  }

  const availableParts = await prisma.sparePart.findMany({
    where: { deletedAt: null, quantityAvailable: { gt: 0 } },
    orderBy: { name: "asc" },
  });

  const totalPaid = (ticket.payments ?? []).reduce((sum, p) => sum + p.amount, 0);
  const balance = ticket.estimatedCost - totalPaid;

  return (
    <div className="relative min-h-full overflow-hidden bg-[#050505] px-4 py-6 text-white sm:px-6 md:px-8 lg:px-10 lg:py-10">
      {/* Soft ambient light (very subtle, no grid) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.10),transparent_65%)]"
      />

      <div className="relative mx-auto w-full max-w-5xl space-y-5 sm:space-y-6">
        {/* Back */}
        <div className="ersms-fade-up">
          <Link
            href="/repairs"
            className="group inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-white/55 transition-colors duration-200 hover:text-[#F5D76E] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/30"
          >
            <ArrowLeft
              size={16}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:-translate-x-1"
            />
            Back to repairs
          </Link>
        </div>

        {/* Header */}
        <header
          className="ersms-fade-up ersms-gold-border relative overflow-hidden rounded-2xl border bg-gradient-to-b from-[#131313] to-[#0b0b0b] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.5)] sm:p-7"
          style={{ animationDelay: "40ms" }}
        >
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
          />

          <p className="mb-2 flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#B87333]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#B87333]" />
            Repair Ticket
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="ersms-gold-bright break-all text-3xl font-extrabold tracking-tight sm:text-4xl">
              {ticket.ticketNumber}
            </h1>

            <span
              className={`inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[ticket.status]}`}
            >
              {statusLabels[ticket.status]}
            </span>
          </div>

          <p className="mt-3 text-sm text-white/55">
            {ticket.deviceBrand} {ticket.deviceModel}
            <span className="mx-2 text-white/25">•</span>
            {ticket.customer.name}
          </p>
        </header>

        {/* Customer and device */}
        <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
          <Card title="Customer" icon={User} delay={80}>
            <p className="text-lg font-extrabold text-white">{ticket.customer.name}</p>

            <div className="mt-3 space-y-2 text-sm">
              {ticket.customer.phone && (
                <p className="flex items-center gap-2.5 text-white/70">
                  <Phone size={15} aria-hidden="true" className="shrink-0 text-[#D4AF37]/70" />
                  <span className="break-all">{ticket.customer.phone}</span>
                </p>
              )}
              {ticket.customer.email && (
                <p className="flex items-center gap-2.5 text-white/70">
                  <Mail size={15} aria-hidden="true" className="shrink-0 text-[#D4AF37]/70" />
                  <span className="break-all">{ticket.customer.email}</span>
                </p>
              )}
            </div>
          </Card>

          <Card title="Device" icon={Smartphone} delay={120}>
            <p className="text-lg font-extrabold text-white">
              {ticket.deviceBrand} {ticket.deviceModel}
            </p>

            <div className="mt-3 space-y-2 text-sm">
              {ticket.serialNumberImei && (
                <p className="flex items-center gap-2.5 text-white/70">
                  <Hash size={15} aria-hidden="true" className="shrink-0 text-[#D4AF37]/70" />
                  <span className="break-all">Serial: {ticket.serialNumberImei}</span>
                </p>
              )}
              <p className="flex items-center gap-2.5 text-white/70">
                <UserCog size={15} aria-hidden="true" className="shrink-0 text-[#D4AF37]/70" />
                Technician: {ticket.assignedTechnician?.fullName ?? "Unassigned"}
              </p>
            </div>
          </Card>
        </div>

        {/* Reported problem */}
        <Card title="Reported Problem" icon={FileText} delay={160}>
          <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-white/80">
            &ldquo;{ticket.reportedProblem}&rdquo;
          </p>
        </Card>

        {ticket.technicianNotes && (
          <Card title="Technician Notes" icon={StickyNote} delay={180}>
            <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-white/80">
              &ldquo;{ticket.technicianNotes}&rdquo;
            </p>
          </Card>
        )}

        {/* Documentation */}
        <Card title={`Documentation (${ticket.media.length})`} icon={Images} delay={200}>
          {ticket.media.length > 0 ? (
            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {ticket.media.map((m) => (
                <MediaGridItem
                  key={m.id}
                  media={m}
                  repairId={ticket.id}
                  canDelete={currentUser.role === "ADMINISTRATOR"}
                />
              ))}
            </div>
          ) : (
            <p className="mb-5 text-sm text-white/45">
              No photos or videos have been added yet.
            </p>
          )}
          <MediaUploader repairId={ticket.id} />
        </Card>

        {/* Spare parts */}
        <Card title="Used Spare Parts" icon={Package} delay={220}>
          {ticket.repairParts.length > 0 && (
            <>
              <div className="mb-5 space-y-2 md:hidden">
                {ticket.repairParts.map((rp) => (
                  <div
                    key={rp.id}
                    className="ersms-gold-line flex items-center justify-between gap-3 rounded-xl border bg-[#0a0a0a] p-3.5 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-white">{rp.sparePart.name}</p>
                      <p className="mt-0.5 text-xs text-white/50">
                        Qty {rp.quantityUsed} × {formatCurrency(rp.unitPriceAtUse)}
                      </p>
                      <p className="mt-1 font-extrabold text-[#F5D76E]">
                        {formatCurrency(rp.unitPriceAtUse * rp.quantityUsed)}
                      </p>
                    </div>
                    <PartRowActions
                      repairId={ticket.id}
                      repairPartId={rp.id}
                      currentQuantity={rp.quantityUsed}
                    />
                  </div>
                ))}
              </div>

              <div className="ersms-gold-line mb-5 hidden overflow-x-auto rounded-xl border md:block">
                <table className="w-full text-sm">
                  <thead className="ersms-gold-line border-b bg-[#D4AF37]/[0.07]">
                    <tr className="text-left">
                      <th scope="col" className="ersms-gold-bright px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em]">Part</th>
                      <th scope="col" className="ersms-gold-bright px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em]">Qty</th>
                      <th scope="col" className="ersms-gold-bright px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em]">Unit Price</th>
                      <th scope="col" className="ersms-gold-bright px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em]">Subtotal</th>
                      <th scope="col" className="ersms-gold-bright px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticket.repairParts.map((rp) => (
                      <tr
                        key={rp.id}
                        className="ersms-gold-line border-b transition-colors duration-200 last:border-0 hover:bg-[#D4AF37]/[0.06]"
                      >
                        <td className="px-4 py-3 font-bold text-white">{rp.sparePart.name}</td>
                        <td className="px-4 py-3 text-white/70">{rp.quantityUsed}</td>
                        <td className="px-4 py-3 text-white/70">{formatCurrency(rp.unitPriceAtUse)}</td>
                        <td className="px-4 py-3 font-extrabold text-[#F5D76E]">
                          {formatCurrency(rp.unitPriceAtUse * rp.quantityUsed)}
                        </td>
                        <td className="px-4 py-3">
                          <PartRowActions
                            repairId={ticket.id}
                            repairPartId={rp.id}
                            currentQuantity={rp.quantityUsed}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <form
            action={addPartToRepairAction}
            className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_110px_auto] sm:items-end"
          >
            <input type="hidden" name="repairId" value={ticket.id} />

            <div className="min-w-0">
              <label htmlFor="partId" className={labelClass}>Part</label>
              <SelectWrap>
                <select id="partId" name="partId" required className={selectClass}>
                  {availableParts.map((part) => (
                    <option key={part.id} value={part.id}>
                      {part.name} ({part.quantityAvailable} available)
                    </option>
                  ))}
                </select>
              </SelectWrap>
            </div>

            <div>
              <label htmlFor="quantityUsed" className={labelClass}>Quantity</label>
              <input
                id="quantityUsed"
                name="quantityUsed"
                type="number"
                min="1"
                defaultValue={1}
                required
                className={fieldClass}
              />
            </div>

            <button type="submit" className={goldBtn}>
              <Plus size={17} aria-hidden="true" />
              Add Part
            </button>
          </form>
        </Card>

        {/* Timeline */}
        <Card title="Repair Timeline" icon={History} delay={240}>
          <ol className="mb-6">
            {ticket.statusHistory.map((entry, index) => {
              const isCurrent = index === ticket.statusHistory.length - 1;
              return (
                <li key={entry.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      aria-hidden="true"
                      className={`mt-1 h-3.5 w-3.5 shrink-0 rounded-full ${
                        isCurrent
                          ? "bg-[#D4AF37] shadow-[0_0_0_5px_rgba(212,175,55,0.18)]"
                          : "bg-[#D4AF37]/35"
                      }`}
                    />
                    {!isCurrent && (
                      <span aria-hidden="true" className="my-1 w-px flex-1 bg-[#D4AF37]/25" />
                    )}
                  </div>

                  <div className={`min-w-0 ${isCurrent ? "pb-0" : "pb-6"}`}>
                    <p
                      className={`text-sm ${
                        isCurrent ? "font-extrabold text-[#F5D76E]" : "font-semibold text-white/80"
                      }`}
                    >
                      {statusLabels[entry.status]}
                    </p>
                    <p className="mt-0.5 text-xs text-white/45">
                      {entry.changedAt.toLocaleString()}
                    </p>
                    {entry.notes && (
                      <p className="mt-1.5 break-words text-sm leading-6 text-white/65">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          <form
            action={updateStatusAction}
            className="ersms-gold-line grid grid-cols-1 gap-4 border-t pt-5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end"
          >
            <input type="hidden" name="repairId" value={ticket.id} />

            <div className="min-w-0">
              <label htmlFor="status" className={labelClass}>Update Status</label>
              <SelectWrap>
                <select id="status" name="status" required className={selectClass}>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </SelectWrap>
            </div>

            <div className="min-w-0">
              <label htmlFor="notes" className={labelClass}>
                Notes <span className="font-medium normal-case tracking-normal text-white/45">(optional)</span>
              </label>
              <input
                id="notes"
                name="notes"
                type="text"
                placeholder="Add a short note..."
                className={fieldClass}
              />
            </div>

            <button type="submit" className={`${goldBtn} sm:col-span-2 lg:col-span-1`}>
              <RefreshCw size={16} aria-hidden="true" />
              Update
            </button>
          </form>
        </Card>

        {/* Payments (financial roles only) */}
        {isFinancial && (
          <Card title="Payments" icon={Wallet} delay={260}>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <EstimatedCostEditor repairId={ticket.id} estimatedCost={ticket.estimatedCost} />

              <div className="ersms-gold-line rounded-xl border bg-[#0a0a0a] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/50">
                  Total Paid
                </p>
                <p className="mt-1.5 text-xl font-extrabold text-[#F5D76E]">
                  {formatCurrency(totalPaid)}
                </p>
                <p className="mt-0.5 text-[11px] text-white/40">Deposits + payments</p>
              </div>

              <div
                className={`rounded-xl border p-4 ${
                  balance > 0
                    ? "border-red-400/40 bg-red-500/[0.08]"
                    : "border-emerald-400/40 bg-emerald-500/[0.08]"
                }`}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/50">
                  {balance > 0 ? "Remaining Balance" : "Status"}
                </p>
                <p
                  className={`mt-1.5 text-xl font-extrabold ${
                    balance > 0 ? "text-red-300" : "text-emerald-300"
                  }`}
                >
                  {balance > 0 ? formatCurrency(balance) : "Fully Paid"}
                </p>
              </div>
            </div>

            {(ticket.payments?.length ?? 0) > 0 && (
              <>
                <div className="mb-5 space-y-2 md:hidden">
                  {ticket.payments!.map((p) => (
                    <div
                      key={p.id}
                      className="ersms-gold-line flex items-center justify-between gap-3 rounded-xl border bg-[#0a0a0a] p-3.5 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-white">
                          {paymentTypeLabels[p.paymentType] ?? p.paymentType}
                        </p>
                        <p className="mt-0.5 text-xs text-white/50">
                          {p.paymentMethod.replace(/_/g, " ")} • {p.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <p className="shrink-0 font-extrabold text-[#F5D76E]">
                        {formatCurrency(p.amount)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="ersms-gold-line mb-5 hidden overflow-x-auto rounded-xl border md:block">
                  <table className="w-full text-sm">
                    <thead className="ersms-gold-line border-b bg-[#D4AF37]/[0.07]">
                      <tr className="text-left">
                        <th scope="col" className="ersms-gold-bright px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em]">Type</th>
                        <th scope="col" className="ersms-gold-bright px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em]">Method</th>
                        <th scope="col" className="ersms-gold-bright px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em]">Amount</th>
                        <th scope="col" className="ersms-gold-bright px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em]">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ticket.payments!.map((p) => (
                        <tr
                          key={p.id}
                          className="ersms-gold-line border-b transition-colors duration-200 last:border-0 hover:bg-[#D4AF37]/[0.06]"
                        >
                          <td className="px-4 py-3 font-bold text-white">
                            {paymentTypeLabels[p.paymentType] ?? p.paymentType}
                          </td>
                          <td className="px-4 py-3 text-white/70">
                            {p.paymentMethod.replace(/_/g, " ")}
                          </td>
                          <td className="px-4 py-3 font-extrabold text-[#F5D76E]">
                            {formatCurrency(p.amount)}
                          </td>
                          <td className="px-4 py-3 text-white/55">
                            {p.createdAt.toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <form
              action={addPaymentAction}
              className="ersms-gold-line grid grid-cols-1 gap-4 border-t pt-5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,140px)_auto] lg:items-end"
            >
              <input type="hidden" name="repairId" value={ticket.id} />

              <div className="min-w-0">
                <label htmlFor="paymentType" className={labelClass}>Type</label>
                <SelectWrap>
                  <select id="paymentType" name="paymentType" required className={selectClass}>
                    <option value="PARTIAL">Partial Payment</option>
                    <option value="FINAL">Final Payment</option>
                  </select>
                </SelectWrap>
              </div>

              <div className="min-w-0">
                <label htmlFor="paymentMethod" className={labelClass}>Method</label>
                <SelectWrap>
                  <select id="paymentMethod" name="paymentMethod" required className={selectClass}>
                    <option value="CASH">Cash</option>
                    <option value="TELEBIRR">Telebirr</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </SelectWrap>
              </div>

              <div className="min-w-0">
                <label htmlFor="amount" className={labelClass}>Amount</label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className={fieldClass}
                />
              </div>

              <button type="submit" className={`${goldBtn} sm:col-span-2 lg:col-span-1`}>
                <Plus size={17} aria-hidden="true" />
                Add Payment
              </button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}