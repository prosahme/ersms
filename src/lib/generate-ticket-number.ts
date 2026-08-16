import { prisma } from "@/lib/prisma";
export async function generateTicketNumber(): Promise<string>{
    const currentYear = new Date().getFullYear();
    const prefix = `REP-${currentYear}-`;

    const count = await prisma.repairTicket.count({
        where: {
            ticketNumber: { startsWith: prefix },
        }
    });
    const nextNumber = count + 1;
    const padded = String(nextNumber).padStart(6, "0");

  return `${prefix}${padded}`;
}