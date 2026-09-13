import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateTicketNumber } from "@/lib/generate-ticket-number";

export const DEVICE_TYPES = [
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

// Repair-side fields only — customer identification (existing vs. new) is
// handled separately by whichever workflow is calling this, since "New
// Repair" and "New Customer + Repair" gather that part differently.
export const repairDetailsSchema = z.object({
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

export type RepairDetailsInput = z.infer<typeof repairDetailsSchema>;

export type NewCustomerInput = {
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
};

/**
 * Creates a repair ticket (+ initial RECEIVED status history + optional
 * deposit payment), either for an existing customerId or for a brand-new
 * customer created in the same breath — always as one atomic transaction,
 * so a customer can never be created without their repair actually being
 * recorded, and a repair can never point at a customer that doesn't exist.
 *
 * Shared by:
 *   - "New Repair" (existing customer OR its own inline new-customer option)
 *   - "New Customer" (customer + first repair together, the primary flow)
 * so this DB-write logic lives in exactly one place.
 */
export async function createRepairForCustomer(params: {
  customerId?: string;
  newCustomer?: NewCustomerInput;
  repair: RepairDetailsInput;
  isAdministrator: boolean;
}): Promise<{ ticketId: string; createdCustomerId: string | null }> {
  // Server-side enforcement: only an Administrator can mark a repair
  // PRIVATE, no matter what the caller was told the form said.
  const visibility =
    params.repair.visibility === "PRIVATE" && params.isAdministrator ? "PRIVATE" : "NORMAL";

  const ticketNumber = await generateTicketNumber();

  let createdCustomerId: string | null = null;

  const ticketId = await prisma.$transaction(async (tx) => {
    let customerId = params.customerId ?? "";

    if (params.newCustomer) {
      const customer = await tx.customer.create({ data: params.newCustomer });
      customerId = customer.id;
      createdCustomerId = customer.id;
    }

    const ticket = await tx.repairTicket.create({
      data: {
        ticketNumber,
        customerId,
        assignedTechnicianId: params.repair.assignedTechnicianId || null,
        deviceType: params.repair.deviceType,
        deviceBrand: params.repair.deviceBrand,
        deviceModel: params.repair.deviceModel,
        serialNumberImei: params.repair.serialNumberImei || null,
        reportedProblem: params.repair.reportedProblem,
        estimatedCost: params.repair.estimatedCost,
        depositAmount: params.repair.depositAmount,
        visibility,
      },
    });

    await tx.repairStatusHistory.create({
      data: { repairId: ticket.id, status: "RECEIVED" },
    });

    if (params.repair.depositAmount > 0) {
      await tx.payment.create({
        data: {
          repairId: ticket.id,
          amount: params.repair.depositAmount,
          paymentType: "DEPOSIT",
          paymentMethod: params.repair.paymentMethod,
        },
      });
    }

    return ticket.id;
  });

  return { ticketId, createdCustomerId };
}
