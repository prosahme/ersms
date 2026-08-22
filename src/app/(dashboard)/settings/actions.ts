"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const userSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email format"),
  role: z.enum(["ADMINISTRATOR", "TECHNICIAN"]),
});


   export type UserFormState = { error?: string; tempPassword?: string; createdEmail?: string };

export async function createUserAction(
  _prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const parsed = userSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "Email already exists." };

  const tempPassword = Math.random().toString(36).slice(-8) + "!1";
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  await prisma.user.create({
    data: {
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      role: parsed.data.role,
      password: hashedPassword,
      isActive: true,
      firstLogin: true,
    },
  });

  revalidatePath("/settings");
  return { tempPassword, createdEmail: parsed.data.email };
}

export async function toggleUserActiveAction(formData: FormData) {
  const id = formData.get("id") as string;
  const isActive = formData.get("isActive") === "true";
  await prisma.user.update({ where: { id }, data: { isActive: !isActive } });
  revalidatePath("/settings");
}
export async function resetPasswordAction(formData: FormData) {
  const id = formData.get("id") as string;
  const tempPassword = Math.random().toString(36).slice(-8) + "!1";
  const hashedPassword = await bcrypt.hash(tempPassword, 10);
  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword, firstLogin: true },
  });
  revalidatePath("/settings");
}

const businessSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export async function updateBusinessInfoAction(formData: FormData) {
  const parsed = businessSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) return;

  const existing = await prisma.businessInfo.findFirst();

  if (existing) {
    await prisma.businessInfo.update({ where: { id: existing.id }, data: parsed.data });
  } else {
    await prisma.businessInfo.create({ data: parsed.data });
  }

  revalidatePath("/settings");
}



