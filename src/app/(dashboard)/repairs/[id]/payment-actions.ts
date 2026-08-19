"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { formatCurrency } from "@/lib/format-currency";

const paymentSchema = z.object({
  repairId: z.string(),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  paymentType: z.enum(["DEPOSIT", "PARTIAL", "FINAL"]),
  paymentMethod: z.enum(["CASH", "TELEBIRR", "BANK_TRANSFER"]),
});

export async function addPaymentAction(formData: FormData) {
  const parsed = paymentSchema.safeParse({
    repairId: formData.get("repairId"),
    amount: formData.get("amount"),
    paymentType: formData.get("paymentType"),
    paymentMethod: formData.get("paymentMethod"),
  });

  if (!parsed.success) return;

  await prisma.payment.create({ data: parsed.data , include: { repairTicket: { include: { customer: true } } },
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