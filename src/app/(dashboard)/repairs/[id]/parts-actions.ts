"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addPartToRepairAction(formData: FormData) {
  const repairId = formData.get("repairId") as string;
  const partId = formData.get("partId") as string;
  const quantityUsed = Number(formData.get("quantityUsed"));

  const part = await prisma.sparePart.findUnique({ where: { id: partId } });
  if (!part) return;

  if (quantityUsed > part.quantityAvailable) {
    return;
  }

  await prisma.$transaction([
    prisma.repairPart.create({
      data: {
        repairId,
        partId,
        quantityUsed,
        unitPriceAtUse: part.unitPrice,
      },
    }),
    prisma.sparePart.update({
      where: { id: partId },
      data: { quantityAvailable: part.quantityAvailable - quantityUsed },
    }),
  ]);

  revalidatePath(`/repairs/${repairId}`);
}