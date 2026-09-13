"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth, UnauthorizedError } from "@/lib/auth-guard";
import { repairDetailsSchema, createRepairForCustomer } from "@/lib/repair-intake";
import { customerSchema } from "@/lib/customer-schema";

export type CustomerFormState = { error?: string };

   export async function createCustomerAction(
  _prevState: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  try {
    await requireAuth();
  } catch (e) {
    if (e instanceof UnauthorizedError) return { error: e.message };
    throw e;
  }

  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existing = await prisma.customer.findUnique({
    where: { phone: parsed.data.phone },
  });
  if (existing) {
    return { error: "A customer with this phone number already exists." };
  }

  const customer = await prisma.customer.create({
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      address: parsed.data.address || null,
    },
  });

  await prisma.notification.create({
    data: {
      type: "NEW_CUSTOMER",
      title: "New Customer",
      message: `New customer added: ${customer.name}.`,
      link: `/customers/${customer.id}`,
    },
  });

  revalidatePath("/customers");
  return {};
}

export type CustomerRepairFormState = { error?: string };

/**
 * The primary "New Customer" workflow: customer info + (optionally) their
 * first repair, in one page, one submit, one atomic transaction.
 *
 * If the "includeRepair" toggle is off, this is identical to plain
 * customer creation — it delegates straight to createCustomerAction so
 * that simple path stays exactly as it was and isn't duplicated here.
 */
export async function createCustomerWithRepairAction(
  prevState: CustomerRepairFormState,
  formData: FormData
): Promise<CustomerRepairFormState> {
  const includeRepair = formData.get("includeRepair") === "1";

  if (!includeRepair) {
    return createCustomerAction(prevState, formData);
  }

  let currentUser;
  try {
    currentUser = await requireAuth();
  } catch (e) {
    if (e instanceof UnauthorizedError) return { error: e.message };
    throw e;
  }

  const customerParsed = customerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
  });
  if (!customerParsed.success) {
    return { error: customerParsed.error.issues[0].message };
  }

  const duplicate = await prisma.customer.findUnique({ where: { phone: customerParsed.data.phone } });
  if (duplicate) {
    return { error: "A customer with this phone number already exists." };
  }

  const repairParsed = repairDetailsSchema.safeParse({
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
  if (!repairParsed.success) {
    return { error: repairParsed.error.issues[0].message };
  }

  const newCustomerData = {
    name: customerParsed.data.name,
    phone: customerParsed.data.phone,
    email: customerParsed.data.email || null,
    address: customerParsed.data.address || null,
  };

  let result;
  try {
    result = await createRepairForCustomer({
      newCustomer: newCustomerData,
      repair: repairParsed.data,
      isAdministrator: currentUser.role === "ADMINISTRATOR",
    });
  } catch (e) {
    return { error: "Could not create the customer and repair. Please check the details and try again." };
  }

  if (result.createdCustomerId) {
    await prisma.notification.create({
      data: {
        type: "NEW_CUSTOMER",
        title: "New Customer",
        message: `New customer added: ${newCustomerData.name}.`,
        link: `/customers/${result.createdCustomerId}`,
      },
    });
  }

  revalidatePath("/customers");
  revalidatePath("/repairs");
  redirect(`/repairs/${result.ticketId}`);
}

export async function updateCustomerAction(
  _prevState: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  try {
    await requireAuth();
  } catch (e) {
    if (e instanceof UnauthorizedError) return { error: e.message };
    throw e;
  }

  const id = formData.get("id") as string;

  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existing = await prisma.customer.findFirst({
    where: { phone: parsed.data.phone, NOT: { id } },
  });
  if (existing) {
    return { error: "A customer with this phone number already exists." };
  }

  await prisma.customer.update({
    where: { id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      address: parsed.data.address || null,
    },
  });

  revalidatePath("/customers");
  redirect(`/customers/${id}`);
}
export async function deleteCustomerAction(formData: FormData) {
  await requireAuth();
  const id = formData.get("id") as string;

  await prisma.customer.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/customers");
}