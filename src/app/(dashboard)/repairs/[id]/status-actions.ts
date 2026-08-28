"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateStatusAction(formData: FormData) {
  const repairId = formData.get("repairId") as string;
  const status = formData.get("status") as any;
  const notes = formData.get("notes") as string;

   const updated = await prisma.repairTicket.update({
    where: { id: repairId },
    data: { status },
    include: { customer: true },
  });

  await prisma.repairStatusHistory.create({
    data: { repairId, status, notes: notes || null },
  });

  if (status === "COMPLETED") {
  await prisma.notification.create({
    data: {
      type: "REPAIR_COMPLETED",
      title: "Repair Completed",
      message: `Ticket ${updated.ticketNumber} for ${updated.customer.name} is marked as completed.`,
      link: `/repairs/${repairId}`,
    },
  });
}

  revalidatePath(`/repairs/${repairId}`);
}