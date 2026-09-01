"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";

const reminderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.enum(["SALARY", "RENT", "EKUB", "OTHER"]),
  amount: z.coerce.number().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  recurrenceDays: z.coerce.number().optional(),
  notes: z.string().optional(),
});

export type ReminderFormState = { error?: string };

export async function createReminderAction(
  _prevState: ReminderFormState,
  formData: FormData
): Promise<ReminderFormState> {
  await requireAdmin();

  const parsed = reminderSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    amount: formData.get("amount") || undefined,
    dueDate: formData.get("dueDate"),
    recurrenceDays: formData.get("recurrenceDays") || undefined,
    notes: formData.get("notes"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.reminder.create({
    data: {
      title: parsed.data.title,
      category: parsed.data.category,
      amount: parsed.data.amount ?? null,
      dueDate: new Date(parsed.data.dueDate),
      recurrenceDays: parsed.data.recurrenceDays ?? null,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/reminders");
  redirect("/reminders");
}

export async function markReminderPaidAction(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;

  const reminder = await prisma.reminder.findUnique({ where: { id } });
  if (!reminder) return;

  await prisma.reminder.update({ where: { id }, data: { isPaid: true } });

  if (reminder.recurrenceDays) {
    const nextDueDate = new Date(reminder.dueDate);
    nextDueDate.setDate(nextDueDate.getDate() + reminder.recurrenceDays);

    await prisma.reminder.create({
      data: {
        title: reminder.title,
        category: reminder.category,
        amount: reminder.amount,
        dueDate: nextDueDate,
        recurrenceDays: reminder.recurrenceDays,
        notes: reminder.notes,
      },
    });
  }

  revalidatePath("/reminders");
}

export async function deleteReminderAction(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;
  await prisma.reminder.delete({ where: { id } });
  revalidatePath("/reminders");
}