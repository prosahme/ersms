"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";

export async function markAllReadAction() {
  await requireAuth();
  await prisma.notification.updateMany({ where: { isRead: false }, data: { isRead: true } });
  revalidatePath("/notifications");
}