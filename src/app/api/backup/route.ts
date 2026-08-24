import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMINISTRATOR") {
    return new Response("Unauthorized", { status: 403 });
  }

  const [customers, spareParts, repairTickets, repairParts, payments, media, statusHistory, reminders, notifications, businessInfo] =
    await Promise.all([
      prisma.customer.findMany(),
      prisma.sparePart.findMany(),
      prisma.repairTicket.findMany(),
      prisma.repairPart.findMany(),
      prisma.payment.findMany(),
      prisma.media.findMany(),
      prisma.repairStatusHistory.findMany(),
      prisma.reminder.findMany(),
      prisma.notification.findMany(),
      prisma.businessInfo.findMany(),
    ]);

  const backup = {
    exportedAt: new Date().toISOString(),
    customers, spareParts, repairTickets, repairParts, payments, media, statusHistory, reminders, notifications, businessInfo,
  };

  return new Response(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="ersms-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}