import { auth } from "@/auth";
import { Bell, Globe } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { GlobalSearchForm } from "./global-search-form";
import { setLanguageAction } from "@/app/(dashboard)/language-action";
import { t } from "@/lib/translations";

export async function Navbar({ lang }: { lang: "en" | "am" }) {
  const session = await auth();
  const user = session?.user as any;

  const [hasUnread, hasLowStock, hasOverdue, hasDueReminders] = await Promise.all([
    prisma.notification.count({ where: { isRead: false } }).then((c) => c > 0),
    prisma.sparePart.findMany({ where: { deletedAt: null } }).then((parts) => parts.some((p) => p.quantityAvailable <= p.lowStockThreshold)),
    prisma.repairTicket.count({ where: { deletedAt: null, status: { notIn: ["COMPLETED", "DELIVERED"] }, expectedCompletionDate: { lt: new Date() } } }).then((c) => c > 0),
    prisma.reminder.count({ where: { isPaid: false, dueDate: { lte: new Date() } } }).then((c) => c > 0),
  ]);
  const hasAlerts = hasUnread || hasLowStock || hasOverdue || hasDueReminders;

  return (
    <header className="ersms-fade-in sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-[#D4AF37]/15 bg-[#080808]/95 px-3 backdrop-blur-sm sm:px-4 md:px-6">
      {/* Thin gold line along the bottom edge */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/45 to-transparent"
      />

      {/* Search (takes all the free space and shrinks first on small screens) */}
      <div className="flex min-w-0 flex-1 items-center">
        <GlobalSearchForm />
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Language switch */}
        <form action={setLanguageAction}>
          <input type="hidden" name="lang" value={lang === "en" ? "am" : "en"} />
          <button
            type="submit"
            aria-label={lang === "en" ? "Switch to Amharic" : "Switch to English"}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-bold text-white/70 transition-all duration-200 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 hover:text-[#F5D76E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/70"
          >
            <Globe size={17} aria-hidden="true" className="text-[#D4AF37]/80" />
            {lang === "en" ? "አማ" : "EN"}
          </button>
        </form>

        {/* Notifications */}
        <Link
          href="/notifications"
          aria-label={t("notifications", lang)}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition-all duration-200 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 hover:text-[#F5D76E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/70"
        >
          <Bell size={19} aria-hidden="true" />

          {hasAlerts && (
            <span className="absolute right-2 top-2 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-red-500/70 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[#080808]" />
            </span>
          )}
        </Link>

        {/* Account */}
        <Link
          href="/account"
          className="group flex items-center gap-2.5 rounded-xl border border-transparent py-1 pl-1 pr-1 transition-all duration-200 hover:border-[#D4AF37]/30 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/70 sm:pl-3"
        >
          <div className="hidden min-w-0 text-right sm:block">
            <p className="max-w-[160px] truncate text-sm font-bold text-white">{user?.name}</p>
            <p className="text-[11px] font-semibold capitalize text-[#D4AF37]/85">
              {user?.role?.toLowerCase()}
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F5D76E] to-[#C9972B] text-sm font-extrabold uppercase text-black ring-2 ring-[#D4AF37]/30 transition-all duration-200 group-hover:ring-[#D4AF37]/70">
            {user?.name?.charAt(0) ?? "U"}
          </div>
        </Link>
      </div>
    </header>
  );
}