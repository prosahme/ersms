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
    <header className="h-16 border-b border-orange-200 bg-orange-50 flex items-center justify-between px-3 md:px-6 sticky top-0 z-10">
      <GlobalSearchForm />
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">

        <form action={setLanguageAction}>
  <input type="hidden" name="lang" value={lang === "en" ? "am" : "en"} />
  <button type="submit" className="flex items-center gap-1 text-slate-400 hover:text-slate-600 text-xs font-medium">
    <Globe size={20} />
    {lang === "en" ? "አማ" : "EN"}
  </button>
</form>
        

        <Link href="/notifications" className="relative text-slate-400 hover:text-slate-600" aria-label="Notifications">
          <Bell size={20} />
          {hasAlerts && <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500" />}
        </Link>

        <Link href="/account" className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-900">{user?.name}</p>
            <p className="text-xs text-orange-500 capitalize">{user?.role?.toLowerCase()}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-sm font-semibold flex-shrink-0">
            {user?.name?.charAt(0) ?? "U"}
          </div>
        </Link>
      </div>
    </header>
  );
}