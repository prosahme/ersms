"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateTicketNumber } from "@/lib/generate-ticket-number";
import { requireAuth, UnauthorizedError } from "@/lib/auth-guard";

const DEVICE_TYPES = [
  "PHONE",
  "TABLET",
  "LAPTOP",
  "DESKTOP",
  "TV",
  "RECEIVER",
  "AMPLIFIER",
  "MOSQUE_MICROPHONE",
  "SPEAKER",
  "OTHER",
] as const;

const repairSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  assignedTechnicianId: z.string().optional(),
  deviceType: z.enum(DEVICE_TYPES),
  deviceBrand: z.string().min(1, "Device brand is required"),
  deviceModel: z.string().min(1, "Device model is required"),
  serialNumberImei: z.string().optional(),
  reportedProblem: z.string().min(1, "Reported problem is required"),
  estimatedCost: z.coerce.number().min(0, "Estimated cost must be 0 or more"),
  depositAmount: z.coerce.number().min(0, "Deposit amount must be 0 or more"),
  paymentMethod: z.enum(["CASH", "TELEBIRR", "BANK_TRANSFER"]),
  visibility: z.enum(["NORMAL", "PRIVATE"]).optional(),
});

export type RepairFormState = { error?: string };

export async function createRepairAction(
  _prevState: RepairFormState,
  formData: FormData
): Promise<RepairFormState> {
  let currentUser;
  try {
    currentUser = await requireAuth();
  } catch (e) {
    if (e instanceof UnauthorizedError) return { error: e.message };
    throw e;
  }

  const parsed = repairSchema.safeParse({
    customerId: formData.get("customerId"),
    assignedTechnicianId: formData.get("assignedTechnicianId"),
    deviceType: formData.get("deviceType"),
    deviceBrand: formData.get("deviceBrand"),
    deviceModel: formData.get("deviceModel"),
    serialNumberImei: formData.get("serialNumberImei"),
    reportedProblem: formData.get("reportedProblem"),
    estimatedCost: formData.get("estimatedCost"),
    depositAmount: formData.get("depositAmount"),
    paymentMethod: formData.get("paymentMethod"),
    visibility: formData.get("visibility") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Server-side enforcement: only an Administrator can mark a repair
  // PRIVATE, no matter what the submitted form data says.
  const visibility =
    parsed.data.visibility === "PRIVATE" && currentUser.role === "ADMINISTRATOR"
      ? "PRIVATE"
      : "NORMAL";

  const ticketNumber = await generateTicketNumber();

  const ticket = await prisma.repairTicket.create({
    data: {
      ticketNumber,
      customerId: parsed.data.customerId,
      assignedTechnicianId: parsed.data.assignedTechnicianId || null,
      deviceType: parsed.data.deviceType,
      deviceBrand: parsed.data.deviceBrand,
      deviceModel: parsed.data.deviceModel,
      serialNumberImei: parsed.data.serialNumberImei || null,
      reportedProblem: parsed.data.reportedProblem,
      estimatedCost: parsed.data.estimatedCost,
      depositAmount: parsed.data.depositAmount,
      visibility,
    },
  });
  await prisma.repairStatusHistory.create({
  data: { repairId: ticket.id, status: "RECEIVED" },
  });

  if (parsed.data.depositAmount > 0) {
  await prisma.payment.create({
    data: {
      repairId: ticket.id,
      amount: parsed.data.depositAmount,
      paymentType: "DEPOSIT",
      paymentMethod: parsed.data.paymentMethod,
    },
  });
}
  revalidatePath("/repairs");
  redirect(`/repairs/${ticket.id}`);
}

export async function syncOfflineRepair(repair: {
  customerId: string;
  assignedTechnicianId?: string;
  deviceType: (typeof DEVICE_TYPES)[number];
  deviceBrand: string;
  deviceModel: string;
  serialNumberImei?: string;
  reportedProblem: string;
  estimatedCost: number;
  depositAmount: number;
  paymentMethod: "CASH" | "TELEBIRR" | "BANK_TRANSFER";
}) {
  await requireAuth();

  const ticketNumber = await generateTicketNumber();

  const ticket = await prisma.repairTicket.create({
    data: {
      ticketNumber,
      customerId: repair.customerId,
      assignedTechnicianId: repair.assignedTechnicianId || null,
      deviceType: repair.deviceType,
      deviceBrand: repair.deviceBrand,
      deviceModel: repair.deviceModel,
      serialNumberImei: repair.serialNumberImei || null,
      reportedProblem: repair.reportedProblem,
      estimatedCost: repair.estimatedCost,
      depositAmount: repair.depositAmount,
    },
  });

  await prisma.repairStatusHistory.create({
    data: {
      repairId: ticket.id,
      status: "RECEIVED",
    },
  });

  if (repair.depositAmount > 0) {
    await prisma.payment.create({
      data: {
        repairId: ticket.id,
        amount: repair.depositAmount,
        paymentType: "DEPOSIT",
        paymentMethod: repair.paymentMethod,
      },
    });
  }

  revalidatePath("/repairs");

  return { success: true, ticketId: ticket.id };
}