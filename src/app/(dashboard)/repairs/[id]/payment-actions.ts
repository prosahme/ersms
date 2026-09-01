"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { formatCurrency } from "@/lib/format-currency";
import { requireFinancialAccess } from "@/lib/auth-guard";

const paymentSchema = z.object({
  repairId: z.string(),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  paymentType: z.enum(["DEPOSIT", "PARTIAL", "FINAL"]),
  paymentMethod: z.enum(["CASH", "TELEBIRR", "BANK_TRANSFER"]),
});

export async function addPaymentAction(formData: FormData) {
  // Server-side enforcement: only Owner/Administrator, Manager, or Cashier
  // may record a payment. This cannot be bypassed by hiding the UI button.
  await requireFinancialAccess();

  const parsed = paymentSchema.safeParse({
    repairId: formData.get("repairId"),
    amount: formData.get("amount"),
    paymentType: formData.get("paymentType"),
    paymentMethod: formData.get("paymentMethod"),
  });

  if (!parsed.success) return;

   const payment = await prisma.payment.create({ data: parsed.data , include: { repairTicket: { include: { customer: true } } },
  });

     await prisma.notification.create({
  data: {
    type: "PAYMENT_RECEIVED",
    title: "Payment Received",
    message: `${formatCurrency(payment.amount)} received for Ticket ${payment.repairTicket.ticketNumber}.`,
    link: `/repairs/${parsed.data.repairId}`,
  },
});
     
  revalidatePath(`/repairs/${parsed.data.repairId}`);
}