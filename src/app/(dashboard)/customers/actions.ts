"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  address: z.string().optional(),
});

export type CustomerFormState = { error?: string };

export async function createCustomerAction(
  _prevState: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
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

  await prisma.customer.create({
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

export async function updateCustomerAction(
  _prevState: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
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
  const id = formData.get("id") as string;

  await prisma.customer.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/customers");
}