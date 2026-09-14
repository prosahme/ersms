import { auth } from "@/auth";
import { gatherBackupData } from "@/lib/backup";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMINISTRATOR") {
    return new Response("Unauthorized", { status: 403 });
  }

  const backup = await gatherBackupData();

  return new Response(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="ersms-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}