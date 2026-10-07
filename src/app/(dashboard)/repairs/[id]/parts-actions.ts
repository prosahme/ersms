"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { assertRepairAccess } from "@/lib/auth-guard";

export async function addPartToRepairAction(formData: FormData) {
  const repairId = formData.get("repairId") as string;
  await assertRepairAccess(repairId);

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

/**
 * Removes a used part from a repair ticket and returns its quantity back
 * to inventory stock — the exact inverse of addPartToRepairAction, so
 * stock levels stay accurate after a mistaken add is corrected.
 */
export async function removePartFromRepairAction(formData: FormData) {
  const repairId = formData.get("repairId") as string;
  await assertRepairAccess(repairId);

  const repairPartId = formData.get("repairPartId") as string;

  const repairPart = await prisma.repairPart.findUnique({ where: { id: repairPartId } });
  if (!repairPart || repairPart.repairId !== repairId) return;

  await prisma.$transaction([
    prisma.repairPart.delete({ where: { id: repairPartId } }),
    prisma.sparePart.update({
      where: { id: repairPart.partId },
      data: { quantityAvailable: { increment: repairPart.quantityUsed } },
    }),
  ]);

  revalidatePath(`/repairs/${repairId}`);
  revalidatePath("/inventory");
}

/**
 * Changes the quantity of an already-used part, adjusting inventory stock
 * by exactly the difference (not a blind add-back-then-subtract), so a
 * correction from 3 to 2 only returns 1 unit, and 2 to 5 only takes 3.
 */
export async function updatePartQuantityAction(formData: FormData) {
  const repairId = formData.get("repairId") as string;
  await assertRepairAccess(repairId);

  const repairPartId = formData.get("repairPartId") as string;
  const newQuantity = Number(formData.get("quantityUsed"));

  if (!Number.isFinite(newQuantity) || newQuantity < 1) return;

  const repairPart = await prisma.repairPart.findUnique({ where: { id: repairPartId } });
  if (!repairPart || repairPart.repairId !== repairId) return;

  const part = await prisma.sparePart.findUnique({ where: { id: repairPart.partId } });
  if (!part) return;

  const difference = newQuantity - repairPart.quantityUsed;

  // difference > 0 means more units are now being used, so stock must
  // cover that extra amount; difference < 0 returns units to stock.
  if (difference > 0 && difference > part.quantityAvailable) {
    return;
  }

  await prisma.$transaction([
    prisma.repairPart.update({
      where: { id: repairPartId },
      data: { quantityUsed: newQuantity },
    }),
    prisma.sparePart.update({
      where: { id: repairPart.partId },
      data: { quantityAvailable: { decrement: difference } },
    }),
  ]);

  revalidatePath(`/repairs/${repairId}`);
  revalidatePath("/inventory");
}