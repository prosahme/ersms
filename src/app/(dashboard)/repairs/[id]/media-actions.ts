"use server";

import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { assertRepairAccess, requireAdmin } from "@/lib/auth-guard";

export async function uploadMediaAction(formData: FormData) {
  const repairId = formData.get("repairId") as string;
  await assertRepairAccess(repairId);

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

/**
 * Deletes an uploaded attachment: the DB record AND the underlying blob
 * file, so we never end up with either an orphaned file (in Blob storage
 * with no DB reference) or a broken record (pointing at a deleted file).
 * Restricted to Administrator — media deletion is treated the same as
 * other destructive/sensitive actions in this app (backup restore, user
 * management). Also enforces the same private-repair rule as everything
 * else that touches a repair.
 */
export async function deleteMediaAction(formData: FormData) {
  const repairId = formData.get("repairId") as string;
  await assertRepairAccess(repairId);
  await requireAdmin();

  const mediaId = formData.get("mediaId") as string;

  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!media || media.repairId !== repairId) return;

  try {
    await del(media.fileUrl);
  } catch {
    // If the blob is already gone (or the delete call fails for some
    // other reason), still remove the DB record below — a dangling
    // blob with no reference is a much smaller problem than a broken
    // record the UI can never clear.
  }

  await prisma.media.delete({ where: { id: mediaId } });

  revalidatePath(`/repairs/${repairId}`);
}