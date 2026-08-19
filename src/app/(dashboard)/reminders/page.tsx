import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency } from "@/lib/format-currency";
import { markReminderPaidAction, deleteReminderAction } from "./actions";

const categoryLabels: Record<string, string> = {
  SALARY: "Salary",
  RENT: "Rent",
  EKUB: "Ekub",
  OTHER: "Other",
};

export default async function RemindersPage() {
  const reminders = await prisma.reminder.findMany({
    where: { isPaid: false },
    orderBy: { dueDate: "asc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Reminders</h1>
        <Link href="/reminders/new" className="rounded-md bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:bg-orange-700">
          Add Reminder
        </Link>
      </div>

      <div className="space-y-3">
        {reminders.map((reminder) => {
          const isOverdue = reminder.dueDate < new Date();
          return (
            <div key={reminder.id} className={`bg-white border border-orange-200 rounded-lg p-4 flex items-center justify-between ${isOverdue ? "border-l-4 border-l-red-500" : ""}`}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{reminder.title}</p>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                    {categoryLabels[reminder.category]}
                  </span>
                  {reminder.recurrenceDays && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      Repeats every {reminder.recurrenceDays}d
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500">
                  Due {reminder.dueDate.toLocaleDateString()}
                  {reminder.amount && ` — ${formatCurrency(reminder.amount)}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <form action={markReminderPaidAction} className="inline">
                  <input type="hidden" name="id" value={reminder.id} />
                  <button type="submit" className="text-green-600 hover:underline text-sm">Mark Paid</button>
                </form>
                <form action={deleteReminderAction} className="inline">
                  <input type="hidden" name="id" value={reminder.id} />
                  <button type="submit" className="text-red-600 hover:underline text-sm">Delete</button>
                </form>
              </div>
            </div>
          );
        })}
      </div>

      {reminders.length === 0 && (
        <p className="text-center text-slate-500 py-8">No pending reminders.</p>
      )}
    </div>
  );
}