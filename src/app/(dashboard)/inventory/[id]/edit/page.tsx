import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
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
    <div className="relative min-h-full overflow-hidden bg-[#050505] px-4 py-6 text-white sm:px-6 md:px-8 lg:px-10 lg:py-10">
      {/* Soft ambient light (very subtle, no grid) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.10),transparent_65%)]"
      />

      <div className="relative mx-auto w-full max-w-2xl">
        {/* Back */}
        <div className="ersms-fade-up mb-5">
          <Link
            href="/inventory"
            className="group inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-white/55 transition-colors duration-200 hover:text-[#F5D76E] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/30"
          >
            <ArrowLeft
              size={16}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:-translate-x-1"
            />
            Back to inventory
          </Link>
        </div>

        {/* Header */}
        <header
          className="ersms-fade-up ersms-gold-border relative mb-6 overflow-hidden rounded-2xl border bg-gradient-to-b from-[#131313] to-[#0b0b0b] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.5)] sm:p-7"
          style={{ animationDelay: "40ms" }}
        >
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
          />

          <div className="flex items-start gap-4 sm:gap-5">
            <div className="ersms-gold-border flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br from-[#D4AF37]/25 to-[#B87333]/10 sm:h-14 sm:w-14">
              <Pencil size={22} aria-hidden="true" className="text-[#F5D76E]" />
            </div>

            <div className="min-w-0">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#B87333] sm:text-xs">
                Inventory
              </p>

              <h1 className="ersms-gold-bright truncate text-2xl font-extrabold tracking-tight sm:text-4xl">
                Edit Spare Part
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/55 sm:text-base sm:leading-7">
                Update {part.name}&apos;s stock, category and pricing.
              </p>
            </div>
          </div>
        </header>

        {/* Form */}
        <div className="ersms-fade-up" style={{ animationDelay: "80ms" }}>
          <EditPartForm part={part} />
        </div>
      </div>
    </div>
  );
}