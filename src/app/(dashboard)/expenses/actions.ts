"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireFinancialAccess } from "@/lib/auth-guard";
import { EXPENSE_CATEGORIES } from "@/lib/expense-categories";

const expenseSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES),
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
});

export type ExpenseFormState = { error?: string };

export async function createExpenseAction(
  _prevState: ExpenseFormState,
  formData: FormData
): Promise<ExpenseFormState> {
  // Server-side enforcement: only Owner/Administrator, Manager, or Cashier
  // may record a shop expense — same financial-role rule as payments.
  const currentUser = await requireFinancialAccess();

  const parsed = expenseSchema.safeParse({
    category: formData.get("category"),
    description: formData.get("description"),
    amount: formData.get("amount"),
    date: formData.get("date"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.expense.create({
    data: {
      category: parsed.data.category,
      description: parsed.data.description,
      amount: parsed.data.amount,
      date: new Date(parsed.data.date),
      recordedById: currentUser.id,
    },
  });

  revalidatePath("/expenses");
  revalidatePath("/reports");
  redirect("/expenses");
}

export async function deleteExpenseAction(formData: FormData) {
  // Deleting a financial record is restricted the same way creating one is.
  await requireFinancialAccess();

  const id = formData.get("id") as string;

  await prisma.expense.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/expenses");
  revalidatePath("/reports");
}
