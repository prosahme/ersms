import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Pencil,
  Wrench,
} from "lucide-react";

function initialOf(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export default async function CustomerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
  });

  if (!customer) {
    notFound();
  }

  return (
    <div className="relative min-h-full overflow-hidden bg-[#050505] px-4 py-6 text-white sm:px-6 md:px-8 lg:px-10 lg:py-10">
      {/* Soft ambient light (very subtle, no grid) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.10),transparent_65%)]"
      />

      <div className="relative mx-auto w-full max-w-3xl space-y-5 sm:space-y-6">
        {/* Back */}
        <div className="ersms-fade-up">
          <Link
            href="/customers"
            className="group inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-white/55 transition-colors duration-200 hover:text-[#F5D76E] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/30"
          >
            <ArrowLeft
              size={16}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:-translate-x-1"
            />
            Back to customers
          </Link>
        </div>

        {/* Header */}
        <header
          className="ersms-fade-up ersms-gold-border relative overflow-hidden rounded-2xl border bg-gradient-to-b from-[#131313] to-[#0b0b0b] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.5)] sm:p-7"
          style={{ animationDelay: "40ms" }}
        >
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
          />

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="ersms-gold-button flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-extrabold sm:h-16 sm:w-16 sm:text-2xl">
                {initialOf(customer.name)}
              </div>

              <div className="min-w-0">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#B87333]">
                  Customer Profile
                </p>
                <h1 className="ersms-gold-bright truncate text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {customer.name}
                </h1>
              </div>
            </div>

            <Link
              href={`/customers/${customer.id}/edit`}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/15 bg-[#161616] px-5 text-sm font-bold text-white/85 transition-all duration-200 hover:border-[#D4AF37]/55 hover:bg-[#1c1c1c] hover:text-[#F5D76E] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/30"
            >
              <Pencil size={15} aria-hidden="true" />
              Edit
            </Link>
          </div>
        </header>

        {/* Contact details */}
        <section
          className="ersms-fade-up ersms-gold-line relative rounded-2xl border bg-[#0f0f0f] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.45)] sm:p-6"
          style={{ animationDelay: "80ms" }}
        >
          <span
            aria-hidden="true"
            className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent"
          />
          <h2 className="ersms-gold-bright mb-4 text-xs font-extrabold uppercase tracking-[0.14em]">
            Contact Details
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="ersms-gold-line flex items-center gap-3 rounded-xl border bg-[#0a0a0a] p-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#D4AF37]/35 bg-[#D4AF37]/10">
                <Phone size={16} aria-hidden="true" className="text-[#D4AF37]" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/40">
                  Phone
                </p>
                <p className="truncate text-sm font-bold text-white">{customer.phone}</p>
              </div>
            </div>

            {customer.email && (
              <div className="ersms-gold-line flex items-center gap-3 rounded-xl border bg-[#0a0a0a] p-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#D4AF37]/35 bg-[#D4AF37]/10">
                  <Mail size={16} aria-hidden="true" className="text-[#D4AF37]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/40">
                    Email
                  </p>
                  <p className="truncate text-sm font-bold text-white">{customer.email}</p>
                </div>
              </div>
            )}

            {customer.address && (
              <div className="ersms-gold-line flex items-center gap-3 rounded-xl border bg-[#0a0a0a] p-3.5 sm:col-span-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#D4AF37]/35 bg-[#D4AF37]/10">
                  <MapPin size={16} aria-hidden="true" className="text-[#D4AF37]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/40">
                    Address
                  </p>
                  <p className="break-words text-sm font-bold text-white">{customer.address}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Repair history */}
        <section
          className="ersms-fade-up ersms-gold-line relative rounded-2xl border bg-[#0f0f0f] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.45)] sm:p-6"
          style={{ animationDelay: "120ms" }}
        >
          <span
            aria-hidden="true"
            className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent"
          />
          <h2 className="ersms-gold-bright mb-4 text-xs font-extrabold uppercase tracking-[0.14em]">
            Repair History
          </h2>

          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Wrench size={28} aria-hidden="true" className="text-[#D4AF37]/70" />
            <p className="text-sm font-semibold text-white/60">No repairs yet.</p>
          </div>
        </section>
      </div>
    </div>
  );
}