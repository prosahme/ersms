"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { gatherBackupData } from "@/lib/backup";
import { put } from "@vercel/blob";

export type RestoreState = { error?: string; success?: boolean; safetyBackupUrl?: string };

export async function restoreBackupAction(
  _prevState: RestoreState,
  formData: FormData
): Promise<RestoreState> {
  // This is a destructive, database-wide action — restrict it to
  // Administrator only, enforced server-side, independent of the UI.
  await requireAdmin();

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

  // Safety backup FIRST, before anything is deleted. If this fails for
  // any reason, we stop here — the restore never runs, and no current
  // data is touched.
  let safetyBackupUrl: string;
  try {
    const safetyData = await gatherBackupData();
    const blob = await put(
      `safety-backups/pre-restore-${Date.now()}.json`,
      JSON.stringify(safetyData, null, 2),
      { access: "public", contentType: "application/json" }
    );
    safetyBackupUrl = blob.url;
  } catch (error) {
    console.error("SAFETY BACKUP FAILED — RESTORE ABORTED, NO DATA WAS TOUCHED:", error);
    return {
      error: "Could not create a safety backup of your current data, so the restore was not performed. No changes were made. Please try again.",
    };
  }

  try {
   await prisma.$transaction(
  async (tx) => {
      await tx.media.deleteMany();
      await tx.repairStatusHistory.deleteMany();
      await tx.repairPart.deleteMany();
      await tx.payment.deleteMany();
      await tx.expense.deleteMany();
      await tx.notification.deleteMany();
      await tx.reminder.deleteMany();
      await tx.repairTicket.deleteMany();
      await tx.sparePart.deleteMany();
      await tx.customer.deleteMany();
      await tx.businessInfo.deleteMany();
      // User rows are intentionally left untouched — see note below.

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
      if (data.expenses?.length) {
        await tx.expense.createMany({
          data: data.expenses.map((e: any) => ({
            ...e,
            recordedById: existingUserIds.includes(e.recordedById) ? e.recordedById : null,
          })),
        });
      }
      if (data.media?.length) await tx.media.createMany({ data: data.media });
      if (data.statusHistory?.length) await tx.repairStatusHistory.createMany({ data: data.statusHistory });
      if (data.reminders?.length) await tx.reminder.createMany({ data: data.reminders });
      if (data.notifications?.length) await tx.notification.createMany({ data: data.notifications });
      
            if (data.businessInfo?.length) await tx.businessInfo.createMany({ data: data.businessInfo });
    },
    { timeout: 20000  , maxWait: 20000}
  );
  } catch (error){


    console.error("RESTORE ERROR:", error);
    return { error: "Restore failed. The backup file may be corrupted or incompatible. Your original data was not changed (the restore is transactional)." };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true, safetyBackupUrl };
}