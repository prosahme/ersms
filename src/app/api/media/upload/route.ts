import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { assertRepairAccess, UnauthorizedError, ForbiddenError } from "@/lib/auth-guard";

// A plain server action can't expose upload-progress events to the
// browser, so this route exists specifically to let the client track
// real byte-level progress via XHR while keeping the exact same
// authorization rules (assertRepairAccess) as every other action that
// touches a repair.
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const repairId = formData.get("repairId") as string;

  if (!repairId) {
    return NextResponse.json({ error: "Missing repairId." }, { status: 400 });
  }

  try {
    await assertRepairAccess(repairId);
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      return NextResponse.json({ error: e.message }, { status: 401 });
    }
    if (e instanceof ForbiddenError) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }
    throw e;
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const blob = await put(file.name, file, { access: "public" });
  const fileType = file.type.startsWith("video") ? "VIDEO" : "IMAGE";

  const media = await prisma.media.create({
    data: { repairId, fileUrl: blob.url, fileType },
  });

  revalidatePath(`/repairs/${repairId}`);

  return NextResponse.json({ id: media.id, fileUrl: media.fileUrl, fileType: media.fileType });
}
