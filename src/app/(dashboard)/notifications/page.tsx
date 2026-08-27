import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserPlus,
  Wallet,
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
  LOW_STOCK: "bg-red-100 text-red-600",
  OVERDUE: "bg-red-100 text-red-600",
  REPAIR_COMPLETED: "bg-green-100 text-green-600",
  NEW_CUSTOMER: "bg-purple-100 text-purple-600",
  PAYMENT_RECEIVED: "bg-blue-100 text-blue-600",
  REMINDER: "bg-amber-100 text-amber-600",
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

  const [
    events,
    lowStockParts,
    overdueTickets,
    dueReminders,
  ] = await Promise.all([
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
          lte: new Date(
            Date.now() + 3 * 24 * 60 * 60 * 1000
          ),
        },
      },
    }),
  ]);

  const items: Item[] = [];

  
  lowStockParts
    .filter(
      (p) => p.quantityAvailable <= p.lowStockThreshold
    )
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

  
  overdueTickets.forEach((t) => {
    items.push({
      id: `overdue-${t.id}`,
      type: "OVERDUE",
      title: "Overdue Repair",
      message: `Ticket ${t.ticketNumber} for ${t.customer.name} is overdue.`,
      link: `/repairs/${t.id}`,
      createdAt: t.expectedCompletionDate ?? t.createdAt,
      category: "overdue",
    });
  });

  
  dueReminders.forEach((r) => {
    const overdue = r.dueDate < new Date();

    items.push({
      id: `reminder-${r.id}`,
      type: "REMINDER",
      title: overdue
        ? "Overdue Reminder"
        : "Upcoming Reminder",
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
      category:
        e.type === "REPAIR_COMPLETED"
          ? "completed"
          : "other",
    });
  });

  
  items.sort(
    (a, b) =>
      b.createdAt.getTime() - a.createdAt.getTime()
  );

 
  const filtered = items.filter(
    (item) =>
      activeTab === "all" ||
      item.category === activeTab
  );

  const tabs = [
    { key: "all", label: "All" },
    { key: "lowstock", label: "Low Stock" },
    { key: "completed", label: "Completed" },
    { key: "overdue", label: "Overdue" },
  ];

  return (
    <div className="p-4 md:p-8">
     
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
        <h1 className="text-2xl font-semibold">{t("notifications", lang)}
          Notifications
        </h1>

        <form action={markAllReadAction}>
          <button
            type="submit"
            className="text-sm text-orange-600 hover:underline"
          >
           {t("markAllRead", lang)}
          </button>
        </form>
      </div>

      <p className="text-slate-500 mb-4">
        Stay updated with repairs, inventory, and system status.
      </p>

      
      <div className="flex flex-wrap gap-2 mb-6 border-b border-orange-200">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/notifications?tab=${t.key}`}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
              activeTab === t.key
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-slate-500"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      
      <div className="space-y-3">
        {filtered.map((item) => {
          const Icon =
            iconMap[item.type] ?? AlertTriangle;

          const isUrgent =
            item.category === "overdue" ||
            item.category === "lowstock";

          const content = (
            <div
              className={`bg-white border-l-4 rounded-lg p-4 flex gap-3 ${
                isUrgent
                  ? "border-l-red-500"
                  : "border-l-orange-300"
              }`}
            >
              <div
                className={`h-9 w-9 rounded-md flex items-center justify-center flex-shrink-0 ${
                  colorMap[item.type] ??
                  "bg-slate-100 text-slate-600"
                }`}
              >
                <Icon size={18} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5">
                  <p className="font-medium text-sm">
                    {item.title}
                  </p>

                  <p className="text-xs text-slate-400">
                    {item.createdAt.toLocaleDateString()}
                  </p>
                </div>

                <p className="text-sm text-slate-600 mt-0.5">
                  {item.message}
                </p>
              </div>
            </div>
          );

          return item.link ? (
            <Link
              key={item.id}
              href={item.link}
            >
              {content}
            </Link>
          ) : (
            <div key={item.id}>
              {content}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-center text-slate-500 py-8">
            {t("noResultsYet", lang)}
          </p>
        )}
      </div>
    </div>
  );
}