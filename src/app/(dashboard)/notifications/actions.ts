"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function markAllReadAction() {
  await prisma.notification.updateMany({ where: { isRead: false }, data: { isRead: true } });
  revalidatePath("/notifications");
}