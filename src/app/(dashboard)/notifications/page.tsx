import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserPlus,
  Wallet,
  BellRing,
  CheckCheck,
  ChevronRight,
} from "lucide-react";
import { markAllReadAction } from "./actions";
import { getLanguage } from "@/lib/language";
import { t } from "@/lib/translations";

const iconMap: Record<string, any> = {
  LOW_STOCK: AlertTriangle,
  OVERDUE: Clock,
  REPAIR_COMPLETED: CheckCircle2,
  NEW_CUSTOMER: UserPlus,
  PAYMENT_RECEIVED: Wallet,
  REMINDER: Clock,
};

const colorMap: Record<string, string> = {
  LOW_STOCK: "border-red-400/40 bg-red-500/15 text-red-300",
  OVERDUE: "border-red-400/40 bg-red-500/15 text-red-300",
  REPAIR_COMPLETED: "border-emerald-400/40 bg-emerald-500/15 text-emerald-300",
  NEW_CUSTOMER: "border-purple-400/40 bg-purple-500/15 text-purple-200",
  PAYMENT_RECEIVED: "border-blue-400/40 bg-blue-500/15 text-blue-200",
  REMINDER: "border-amber-400/40 bg-amber-500/15 text-amber-200",
};

type Item = {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  createdAt: Date;
  category: "lowstock" | "completed" | "overdue" | "other";
};

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const lang = await getLanguage();
  const { tab } = await searchParams;
  const activeTab = tab ?? "all";

  const [events, lowStockParts, overdueTickets, dueReminders] = await Promise.all([
    prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),

    prisma.sparePart.findMany({
      where: { deletedAt: null },
    }),

    prisma.repairTicket.findMany({
      where: {
        deletedAt: null,
        status: {
          notIn: ["COMPLETED", "DELIVERED"],
        },
        expectedCompletionDate: {
          lt: new Date(),
        },
      },
      include: {
        customer: true,
      },
    }),

    prisma.reminder.findMany({
      where: {
        isPaid: false,
        dueDate: {
          lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  const items: Item[] = [];

  lowStockParts
    .filter((p) => p.quantityAvailable <= p.lowStockThreshold)
    .forEach((p) => {
      items.push({
        id: `lowstock-${p.id}`,
        type: "LOW_STOCK",
        title: "Low Stock Alert",
        message: `${p.name} is below threshold (${p.quantityAvailable} left).`,
        link: "/inventory",
        createdAt: p.updatedAt,
        category: "lowstock",
      });
    });

  overdueTickets.forEach((ticket) => {
    items.push({
      id: `overdue-${ticket.id}`,
      type: "OVERDUE",
      title: "Overdue Repair",
      message: `Ticket ${ticket.ticketNumber} for ${ticket.customer.name} is overdue.`,
      link: `/repairs/${ticket.id}`,
      createdAt: ticket.expectedCompletionDate ?? ticket.createdAt,
      category: "overdue",
    });
  });

  dueReminders.forEach((r) => {
    const overdue = r.dueDate < new Date();

    items.push({
      id: `reminder-${r.id}`,
      type: "REMINDER",
      title: overdue ? "Overdue Reminder" : "Upcoming Reminder",
      message: `${r.title} is due ${r.dueDate.toLocaleDateString()}.`,
      link: "/reminders",
      createdAt: r.dueDate,
      category: overdue ? "overdue" : "other",
    });
  });

  events.forEach((e) => {
    items.push({
      id: e.id,
      type: e.type,
      title: e.title,
      message: e.message,
      link: e.link,
      createdAt: e.createdAt,
      category: e.type === "REPAIR_COMPLETED" ? "completed" : "other",
    });
  });

  items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const filtered = items.filter((item) => activeTab === "all" || item.category === activeTab);

  const tabs = [
    { key: "all", label: "All" },
    { key: "lowstock", label: "Low Stock" },
    { key: "completed", label: "Completed" },
    { key: "overdue", label: "Overdue" },
  ];

  return (
    <div className="relative min-h-full overflow-hidden bg-[#050505] px-4 py-6 text-white sm:px-6 md:px-8 lg:px-10 lg:py-10">
      {/* Soft ambient light (very subtle, no grid) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.10),transparent_65%)]"
      />

      <div className="relative mx-auto w-full max-w-4xl space-y-5 sm:space-y-6">
        {/* Header */}
        <header className="ersms-fade-up ersms-gold-border relative overflow-hidden rounded-2xl border bg-gradient-to-b from-[#131313] to-[#0b0b0b] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.5)] sm:p-7">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
          />

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="ersms-gold-border flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br from-[#D4AF37]/25 to-[#B87333]/10 sm:h-14 sm:w-14">
                <BellRing size={22} aria-hidden="true" className="text-[#F5D76E]" />
              </div>

              <div className="min-w-0">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#B87333]">
                  Activity
                </p>
                <h1 className="ersms-gold-bright text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {t("notifications", lang)}
                </h1>
                <p className="mt-1 text-sm text-white/55">
                  Stay updated with repairs, inventory, and system status.
                </p>
              </div>
            </div>

            <form action={markAllReadAction} className="shrink-0">
              <button
                type="submit"
                className="ersms-gold-border inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border bg-[#D4AF37]/[0.07] px-5 text-sm font-bold text-[#F5D76E] transition-all duration-200 hover:bg-[#D4AF37]/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/30 sm:w-auto"
              >
                <CheckCheck size={16} aria-hidden="true" />
                {t("markAllRead", lang)}
              </button>
            </form>
          </div>
        </header>

        {/* Tabs */}
        <div
          className="ersms-fade-up -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0"
          style={{ animationDelay: "60ms" }}
        >
          {tabs.map((tabItem) => (
            <Link
              key={tabItem.key}
              href={`/notifications?tab=${tabItem.key}`}
              className={`inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border px-4 text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/30 ${
                activeTab === tabItem.key
                  ? "ersms-gold-button border-transparent"
                  : "border-[#D4AF37]/25 bg-[#0f0f0f] text-white/65 hover:border-[#D4AF37]/55 hover:bg-[#D4AF37]/10 hover:text-[#F5D76E]"
              }`}
            >
              {tabItem.label}
            </Link>
          ))}
        </div>

        {/* Notifications list */}
        <div className="space-y-3">
          {filtered.map((item, i) => {
            const Icon = iconMap[item.type] ?? AlertTriangle;
            const isUrgent = item.category === "overdue" || item.category === "lowstock";

            const content = (
              <div
                className={`ersms-fade-up group relative flex gap-3 overflow-hidden rounded-2xl border bg-[#0f0f0f] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-all duration-200 sm:p-5 ${
                  isUrgent
                    ? "border-red-400/35 hover:border-red-400/60"
                    : "ersms-gold-line hover:border-[#D4AF37]/55 hover:bg-[#14130e]"
                } ${item.link ? "hover:-translate-y-0.5" : ""}`}
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              >
                {isUrgent && (
                  <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-red-500" />
                )}

                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                    colorMap[item.type] ?? "border-white/20 bg-white/10 text-white/75"
                  }`}
                >
                  <Icon size={18} aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-extrabold text-white">{item.title}</p>
                    <p className="shrink-0 text-xs text-white/40">
                      {item.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <p className="mt-1 break-words text-sm leading-6 text-white/60">{item.message}</p>
                </div>

                {item.link && (
                  <ChevronRight
                    size={16}
                    aria-hidden="true"
                    className="hidden shrink-0 self-center text-white/25 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#F5D76E] sm:block"
                  />
                )}
              </div>
            );

            return item.link ? (
              <Link
                key={item.id}
                href={item.link}
                className="block rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/30"
              >
                {content}
              </Link>
            ) : (
              <div key={item.id}>{content}</div>
            );
          })}

          {filtered.length === 0 && (
            <div className="ersms-gold-line flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-[#0d0d0d] px-6 py-14 text-center">
              <BellRing size={30} aria-hidden="true" className="text-[#D4AF37]/70" />
              <p className="text-sm font-semibold text-white/60">{t("noResultsYet", lang)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}