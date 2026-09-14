import { prisma } from "@/lib/prisma";

/**
 * Gathers a full application backup, including User records.
 *
 * User rows only ever include the already-hashed password (bcrypt hash —
 * the database never stores a plaintext password anywhere, so this is
 * exactly what's already in the User table, not a new secret). No
 * temporary/reset-password values exist in the schema either — a
 * password reset simply overwrites the same `password` column with a
 * new hash, so there's nothing else to accidentally include.
 *
 * Shared by the manual "Download Backup" route and the automatic
 * pre-restore safety backup, so both always capture the exact same
 * shape of data.
 */
export async function gatherBackupData() {
  const [
    customers,
    spareParts,
    repairTickets,
    repairParts,
    payments,
    media,
    statusHistory,
    reminders,
    notifications,
    businessInfo,
    expenses,
    users,
  ] = await Promise.all([
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
    prisma.expense.findMany(),
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        password: true, // bcrypt hash only — never plaintext, see note above
        role: true,
        isActive: true,
        firstLogin: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        updatedBy: true,
      },
    }),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    customers,
    spareParts,
    repairTickets,
    repairParts,
    payments,
    media,
    statusHistory,
    reminders,
    notifications,
    businessInfo,
    expenses,
    users,
  };
}
