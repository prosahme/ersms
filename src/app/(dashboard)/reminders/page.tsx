import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Calendar1, Check, Trash2, Repeat } from "lucide-react";
import { formatCurrency } from "@/lib/format-currency";
import { markReminderPaidAction, deleteReminderAction } from "./actions";
import { getLanguage } from "@/lib/language";
import { t } from "@/lib/translations";

const categoryStyles: Record<string, string> = {
  SALARY: "border-blue-400/40 bg-blue-500/15 text-blue-200",
  RENT: "border-purple-400/40 bg-purple-500/15 text-purple-200",
  EKUB: "border-[#B87333]/50 bg-[#B87333]/20 text-[#F0B27A]",
  OTHER: "border-white/20 bg-white/10 text-white/75",
};

const pillBase =
  "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold";

export default async function RemindersPage() {
  const lang = await getLanguage();
  const categoryLabels: Record<string, string> = {
    SALARY: t("salary", lang),
    RENT: t("rent", lang),
    EKUB: t("ekub", lang),
    OTHER: t("other", lang),
  };
  const reminders = await prisma.reminder.findMany({ where: { isPaid: false }, orderBy: { dueDate: "asc" } });

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

              <div className="flex flex-wrap items-center gap-3">
                <h1 className="ersms-gold-bright text-3xl font-extrabold tracking-tight sm:text-4xl">
                  {t("reminders", lang)}
                </h1>

                <span className="ersms-gold-border inline-flex items-baseline gap-1.5 rounded-full border bg-[#D4AF37]/[0.07] px-3.5 py-1.5 text-sm font-bold text-[#F5D76E]">
                  {reminders.length}
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    pending
                  </span>
                </span>
              </div>
            </div>

            <Link
              href="/reminders/new"
              className="ersms-gold-button inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl px-6 text-sm font-extrabold transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/40 active:translate-y-0"
            >
              <Plus size={18} aria-hidden="true" />
              {t("addReminder", lang)}
            </Link>
          </div>
        </header>

        {/* Reminders list */}
        <div className="space-y-3">
          {reminders.map((reminder, i) => {
            const isOverdue = reminder.dueDate < new Date();
            return (
              <div
                key={reminder.id}
                className={`ersms-fade-up relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-[#0f0f0f] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-all duration-200 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${
                  isOverdue
                    ? "border-red-400/35 hover:border-red-400/60"
                    : "ersms-gold-line hover:border-[#D4AF37]/55 hover:bg-[#14130e]"
                }`}
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              >
                {isOverdue && (
                  <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-red-500" />
                )}

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <p className="truncate text-[15px] font-extrabold text-white">{reminder.title}</p>
                    <span className={`${pillBase} ${categoryStyles[reminder.category]}`}>
                      {categoryLabels[reminder.category]}
                    </span>
                    {reminder.recurrenceDays && (
                      <span className={`${pillBase} border-white/20 bg-white/10 text-white/70`}>
                        <Repeat size={11} aria-hidden="true" className="mr-1" />
                        {t("repeatsEvery", lang)} {reminder.recurrenceDays}d
                      </span>
                    )}
                    {isOverdue && (
                      <span className={`${pillBase} border-red-400/40 bg-red-500/15 text-red-300`}>
                        Overdue
                      </span>
                    )}
                  </div>

                  <p className="flex items-center gap-2 text-sm text-white/55">
                    <Calendar1 size={14} aria-hidden="true" className="shrink-0 text-[#D4AF37]/70" />
                    {t("dueDate", lang)} {reminder.dueDate.toLocaleDateString()}
                    {reminder.amount && (
                      <span className="font-bold text-[#F5D76E]"> — {formatCurrency(reminder.amount)}</span>
                    )}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3 border-t border-white/10 pt-3 sm:border-t-0 sm:pt-0">
                  <form action={markReminderPaidAction}>
                    <input type="hidden" name="id" value={reminder.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/35 bg-emerald-500/[0.06] px-3 py-2 text-sm font-bold text-emerald-300 transition-all duration-200 hover:border-emerald-400/70 hover:bg-emerald-500/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/30"
                    >
                      <Check size={15} aria-hidden="true" />
                      {t("markPaid", lang)}
                    </button>
                  </form>

                  <form action={deleteReminderAction}>
                    <input type="hidden" name="id" value={reminder.id} />
                    <button
                      type="submit"
                      aria-label={t("delete", lang)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-400/35 bg-red-500/[0.06] text-red-300 transition-all duration-200 hover:border-red-400/70 hover:bg-red-600 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-400/40"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>

        {reminders.length === 0 && (
          <div className="ersms-gold-line flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-[#0d0d0d] px-6 py-14 text-center">
            <Calendar1 size={30} aria-hidden="true" className="text-[#D4AF37]/70" />
            <p className="text-sm font-semibold text-white/60">{t("noPendingReminders", lang)}</p>
          </div>
        )}
      </div>
    </div>
  );
}