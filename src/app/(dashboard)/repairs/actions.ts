"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateTicketNumber } from "@/lib/generate-ticket-number";
import { requireAuth, UnauthorizedError } from "@/lib/auth-guard";
import { customerSchema } from "@/lib/customer-schema";
import { DEVICE_TYPES, repairDetailsSchema, createRepairForCustomer } from "@/lib/repair-intake";

const repairSchema = z.object({
  customerMode: z.enum(["existing", "new"]),
  customerId: z.string().optional(),
  newCustomerName: z.string().optional(),
  newCustomerPhone: z.string().optional(),
  newCustomerEmail: z.string().optional(),
  newCustomerAddress: z.string().optional(),
}).merge(repairDetailsSchema);

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
    customerMode: formData.get("customerMode"),
    customerId: formData.get("customerId"),
    newCustomerName: formData.get("newCustomerName"),
    newCustomerPhone: formData.get("newCustomerPhone"),
    newCustomerEmail: formData.get("newCustomerEmail"),
    newCustomerAddress: formData.get("newCustomerAddress"),
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

  // Server-side validation of the customer half of the form — never trust
  // that the client only submitted one mode correctly. Reuses the exact
  // same rules as the standalone "New Customer" page (customerSchema),
  // so a customer created from this combined flow is held to the same
  // standard as one created the normal way. name/phone are each
  // individually optional, as long as at least one of them is filled in
  // (enforced inside customerSchema itself).
  let newCustomerData: { name: string; phone: string | null; email: string | null; address: string | null } | null = null;

  if (parsed.data.customerMode === "existing") {
    if (!parsed.data.customerId || parsed.data.customerId.trim() === "") {
      return { error: "Please select an existing customer, or switch to Add New Customer." };
    }
    const existingCustomer = await prisma.customer.findFirst({
      where: { id: parsed.data.customerId, deletedAt: null },
    });
    if (!existingCustomer) {
      return { error: "Selected customer could not be found. Please search again." };
    }
  } else {
    const customerParsed = customerSchema.safeParse({
      name: parsed.data.newCustomerName,
      phone: parsed.data.newCustomerPhone,
      email: parsed.data.newCustomerEmail,
      address: parsed.data.newCustomerAddress,
    });
    if (!customerParsed.success) {
      return { error: customerParsed.error.issues[0].message };
    }

    const phone =
      customerParsed.data.phone && customerParsed.data.phone.trim() !== ""
        ? customerParsed.data.phone.trim()
        : null;

    if (phone) {
      const duplicatePhone = await prisma.customer.findUnique({ where: { phone } });
      if (duplicatePhone) {
        return { error: "A customer with this phone number already exists. Please search for them instead." };
      }
    }

    newCustomerData = {
      name: customerParsed.data.name?.trim() || "Unnamed customer",
      phone,
      email: customerParsed.data.email || null,
      address: customerParsed.data.address || null,
    };
  }

  let result;
  try {
    result = await createRepairForCustomer({
      customerId: parsed.data.customerMode === "existing" ? parsed.data.customerId : undefined,
      newCustomer: newCustomerData ?? undefined,
      repair: parsed.data,
      isAdministrator: currentUser.role === "ADMINISTRATOR",
    });
  } catch (e) {
    return { error: "Could not create the repair ticket. Please check the details and try again." };
  }

  if (result.createdCustomerId) {
    await prisma.notification.create({
      data: {
        type: "NEW_CUSTOMER",
        title: "New Customer",
        message: `New customer added: ${newCustomerData!.name}.`,
        link: `/customers/${result.createdCustomerId}`,
      },
    });
    revalidatePath("/customers");
  }

  revalidatePath("/repairs");
  redirect(`/repairs/${result.ticketId}`);
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