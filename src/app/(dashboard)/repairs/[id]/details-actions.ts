"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { assertRepairAccess } from "@/lib/auth-guard";

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