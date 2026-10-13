"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-guard";

// Must stay in sync with CATEGORY_OPTIONS in new-part-form.tsx and
// edit-part-form.tsx — the <select> sends these exact readable strings
// (e.g. "Capacitor"), not enum-style codes, since the database column
// itself is plain text, not a Prisma enum.
const PART_CATEGORIES = [
  "Capacitor",
  "Resistor",
  "Diode",
  "Transistor",
  "IC Chip",
  "Voltage Regulator",
  "Inductor",
  "Fuse",
  "Connector",
  "Cable / Wire",
  "Screen / Display",
  "Backlight",
  "Battery",
  "Speaker",
  "Camera Module",
  "Charging Port",
  "Motherboard / PCB",
  "Button / Switch",
  "Sensor",
  "Antenna",
  "Other",
] as const;

const partSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Please select a category"),
  quantityAvailable: z.coerce.number().min(0, "Quantity must be 0 or more"),
  lowStockThreshold: z.coerce.number().min(0, "Threshold must be 0 or more"),
  unitCost: z.coerce.number().min(0, "Unit cost must be 0 or more"),
  unitPrice: z.coerce.number().min(0, "Unit price must be 0 or more"),
});

export type PartFormState = { error?: string };

export async function createPartAction(
  _prevState: PartFormState,
  formData: FormData
): Promise<PartFormState> {
  await requireAuth();

  const parsed = partSchema.safeParse({
    name: formData.get("name"),
    sku: formData.get("sku"),
    category: formData.get("category"),
    quantityAvailable: formData.get("quantityAvailable"),
    lowStockThreshold: formData.get("lowStockThreshold"),
    unitCost: formData.get("unitCost"),
    unitPrice: formData.get("unitPrice"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const existing = await prisma.sparePart.findUnique({ where: { sku: parsed.data.sku } });
  if (existing) return { error: "A part with this SKU already exists." };

  await prisma.sparePart.create({ data: parsed.data });

  revalidatePath("/inventory");
  redirect("/inventory");
}

export async function updatePartAction(
  _prevState: PartFormState,
  formData: FormData
): Promise<PartFormState> {
  await requireAuth();

  const id = formData.get("id") as string;

  const parsed = partSchema.safeParse({
    name: formData.get("name"),
    sku: formData.get("sku"),
    category: formData.get("category"),
    quantityAvailable: formData.get("quantityAvailable"),
    lowStockThreshold: formData.get("lowStockThreshold"),
    unitCost: formData.get("unitCost"),
    unitPrice: formData.get("unitPrice"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const existing = await prisma.sparePart.findFirst({
    where: { sku: parsed.data.sku, NOT: { id } },
  });
  if (existing) return { error: "A part with this SKU already exists." };

  await prisma.sparePart.update({ where: { id }, data: parsed.data });

  revalidatePath("/inventory");
  redirect("/inventory");
}

export async function deletePartAction(formData: FormData) {
  await requireAuth();

  const id = formData.get("id") as string;
  await prisma.sparePart.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/inventory");
}