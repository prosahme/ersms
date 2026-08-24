"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type RestoreState = { error?: string; success?: boolean };

export async function restoreBackupAction(
  _prevState: RestoreState,
  formData: FormData
): Promise<RestoreState> {
  const file = formData.get("file") as File;
  if (!file || file.size === 0) return { error: "Please choose a backup file." };

  let data: any;
  try {
    const text = await file.text();
    data = JSON.parse(text);
  } catch {
    return { error: "This file isn't a valid backup file." };
  }

  if (!data.customers || !data.repairTickets) {
    return { error: "This doesn't look like an ERSMS backup file." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.media.deleteMany();
      await tx.repairStatusHistory.deleteMany();
      await tx.repairPart.deleteMany();
      await tx.payment.deleteMany();
      await tx.notification.deleteMany();
      await tx.reminder.deleteMany();
      await tx.repairTicket.deleteMany();
      await tx.sparePart.deleteMany();
      await tx.customer.deleteMany();
      await tx.businessInfo.deleteMany();

      if (data.customers.length) await tx.customer.createMany({ data: data.customers });
      if (data.spareParts?.length) await tx.sparePart.createMany({ data: data.spareParts });

      const existingUserIds = (await tx.user.findMany({ select: { id: true } })).map((u) => u.id);
      if (data.repairTickets.length) {
        await tx.repairTicket.createMany({
          data: data.repairTickets.map((t: any) => ({
            ...t,
            assignedTechnicianId: existingUserIds.includes(t.assignedTechnicianId) ? t.assignedTechnicianId : null,
          })),
        });
      }
      if (data.repairParts?.length) await tx.repairPart.createMany({ data: data.repairParts });
      if (data.payments?.length) await tx.payment.createMany({ data: data.payments });
      if (data.media?.length) await tx.media.createMany({ data: data.media });
      if (data.statusHistory?.length) await tx.repairStatusHistory.createMany({ data: data.statusHistory });
      if (data.reminders?.length) await tx.reminder.createMany({ data: data.reminders });
      if (data.notifications?.length) await tx.notification.createMany({ data: data.notifications });
      if (data.businessInfo?.length) await tx.businessInfo.createMany({ data: data.businessInfo });
    });
  } catch {
    return { error: "Restore failed. The backup file may be corrupted or incompatible." };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}