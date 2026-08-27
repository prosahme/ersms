import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency } from "@/lib/format-currency";
import { markReminderPaidAction, deleteReminderAction } from "./actions";
import { getLanguage } from "@/lib/language";
import { t } from "@/lib/translations";

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
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold">{t("reminders", lang)}</h1>
        <Link href="/reminders/new" className="rounded-md bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:bg-orange-700 text-center">
          {t("addReminder", lang)}
        </Link>
      </div>

      <div className="space-y-3">
        {reminders.map((reminder) => {
          const isOverdue = reminder.dueDate < new Date();
          return (
            <div key={reminder.id} className={`bg-white border border-orange-200 rounded-lg p-4 ${isOverdue ? "border-l-4 border-l-red-500" : ""}`}>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <p className="font-medium">{reminder.title}</p>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">{categoryLabels[reminder.category]}</span>
                {reminder.recurrenceDays && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    {t("repeatsEvery", lang)} {reminder.recurrenceDays}d
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mb-3">
                {t("dueDate", lang)} {reminder.dueDate.toLocaleDateString()}
                {reminder.amount && ` — ${formatCurrency(reminder.amount)}`}
              </p>
              <div className="flex items-center gap-4 pt-2 border-t border-orange-100">
                <form action={markReminderPaidAction} className="inline">
                  <input type="hidden" name="id" value={reminder.id} />
                  <button type="submit" className="text-green-600 hover:underline text-sm">{t("markPaid", lang)}</button>
                </form>
                <form action={deleteReminderAction} className="inline">
                  <input type="hidden" name="id" value={reminder.id} />
                  <button type="submit" className="text-red-600 hover:underline text-sm">{t("delete", lang)}</button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
      {reminders.length === 0 && <p className="text-center text-slate-500 py-8">{t("noPendingReminders", lang)}</p>}
    </div>
  );
}