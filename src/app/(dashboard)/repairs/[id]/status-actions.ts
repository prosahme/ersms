"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateStatusAction(formData: FormData) {
  const repairId = formData.get("repairId") as string;
  const status = formData.get("status") as any;
  const notes = formData.get("notes") as string;

  await prisma.repairTicket.update({
    where: { id: repairId },
    data: { status },
  });

  await prisma.repairStatusHistory.create({
    data: { repairId, status, notes: notes || null },
  });

  revalidatePath(`/repairs/${repairId}`);
}