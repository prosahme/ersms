import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditPartForm } from "./edit-part-form";
import { requireAuth } from "@/lib/auth-guard";

export default async function EditPartPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();

  const { id } = await params;

  const part = await prisma.sparePart.findUnique({ where: { id } });

  if (!part || part.deletedAt) notFound();

  return (
    <div className="p-8 max-w-md">
      <h1 className="text-2xl font-semibold mb-6">Edit Spare Part</h1>
      <EditPartForm part={part} />
    </div>
  );
}
