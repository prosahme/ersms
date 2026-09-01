"use server";

import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";

export async function uploadMediaAction(formData: FormData) {
  await requireAuth();

  const repairId = formData.get("repairId") as string;
  const file = formData.get("file") as File;

  if (!file || file.size === 0) return;

  const blob = await put(file.name, file, { access: "public" });

  const fileType = file.type.startsWith("video") ? "VIDEO" : "IMAGE";

  await prisma.media.create({
    data: {
      repairId,
      fileUrl: blob.url,
      fileType,
    },
  });

  revalidatePath(`/repairs/${repairId}`);
}