"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertRepairAccess, requireAuth } from "@/lib/auth-guard";

const estimatedCostSchema = z.object({
  estimatedCost: z.coerce.number().min(0, "Estimated cost must be 0 or more"),
});

export type EstimatedCostFormState = { error?: string };

export async function updateEstimatedCostAction(
  _prevState: EstimatedCostFormState,
  formData: FormData
): Promise<EstimatedCostFormState> {
  const repairId = formData.get("repairId") as string;
  await assertRepairAccess(repairId);

  const parsed = estimatedCostSchema.safeParse({
    estimatedCost: formData.get("estimatedCost"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.repairTicket.update({
    where: { id: repairId },
    data: { estimatedCost: parsed.data.estimatedCost },
  });

  revalidatePath(`/repairs/${repairId}`);
  return {};
}

/**
 * Soft-deletes a repair ticket (same deletedAt pattern used everywhere
 * else — nothing is permanently destroyed, and it simply stops appearing
 * in lists and queries). Administrator-only: deleting a repair is a
 * serious, hard-to-undo-from-the-UI action, unlike adding a note or
 * updating a status, so it gets a stricter check than assertRepairAccess
 * alone provides.
 */
export async function deleteRepairAction(formData: FormData) {
  const repairId = formData.get("repairId") as string;
  await assertRepairAccess(repairId);

  const currentUser = await requireAuth();
  if (currentUser.role !== "ADMINISTRATOR") {
    throw new Error("Only an Administrator can delete a repair ticket.");
  }

  await prisma.repairTicket.update({
    where: { id: repairId },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/repairs");
  redirect("/repairs");
}