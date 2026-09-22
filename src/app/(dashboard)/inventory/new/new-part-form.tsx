"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Package,
  Barcode,
  Tags,
  Boxes,
  AlertTriangle,
  Coins,
  CircleDollarSign,
  Loader2,
  Save,
  CircleAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createPartAction, type PartFormState } from "../actions";

const initialState: PartFormState = {};

const controlBase =
  "block w-full rounded-xl border border-[#D4AF37]/35 bg-[#0a0a0a] pl-11 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/30 hover:border-[#D4AF37]/60 focus:border-[#D4AF37] focus:bg-[#0d0c08] focus:ring-4 focus:ring-[#D4AF37]/15 [color-scheme:dark]";

const inputClass = `${controlBase} h-12`;
const numberClass = `${controlBase} h-12 pr-4 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`;
const numberSuffixClass = `${controlBase} h-12 pr-16 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`;

function Field({
  id,
  label,
  icon: Icon,
  required = false,
  className = "",
  suffix,
  children,
}: {
  id: string;
  label: string;
  icon: LucideIcon;
  required?: boolean;
  className?: string;
  suffix?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <label
        htmlFor={id}
        className="mb-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#F5D76E]"
      >
        {label}
        {required && (
          <span aria-hidden="true" className="text-[#D4AF37]">
            *
          </span>
        )}
      </label>

      <div className="group relative">
        {children}
        <Icon
          aria-hidden="true"
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/65 transition-colors duration-200 group-focus-within:text-[#F5D76E]"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold tracking-wide text-[#D4AF37]">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export function NewPartForm() {
  const [state, formAction, isPending] = useActionState(createPartAction, initialState);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.error) {
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-5 sm:space-y-6">
      <section className="ersms-gold-line relative rounded-2xl border bg-[#101010] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.45)] sm:p-7">
        <span
          aria-hidden="true"
          className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-transparent"
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="name" label="Part name" icon={Package} required className="sm:col-span-2">
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="off"
              placeholder="e.g. iPhone 13 screen"
              className={inputClass}
            />
          </Field>

          <Field id="sku" label="SKU" icon={Barcode} required>
            <input
              id="sku"
              name="sku"
              type="text"
              required
              autoComplete="off"
              placeholder="e.g. SCR-IP13-001"
              className={inputClass}
            />
          </Field>

          <Field id="category" label="Category" icon={Tags} required>
            <input
              id="category"
              name="category"
              type="text"
              required
              autoComplete="off"
              placeholder="e.g. Screens, Batteries..."
              className={inputClass}
            />
          </Field>

          <Field id="quantityAvailable" label="Quantity available" icon={Boxes} required>
            <input
              id="quantityAvailable"
              name="quantityAvailable"
              type="number"
              inputMode="numeric"
              min="0"
              required
              placeholder="0"
              className={numberClass}
            />
          </Field>

          <Field id="lowStockThreshold" label="Low stock threshold" icon={AlertTriangle} required>
            <input
              id="lowStockThreshold"
              name="lowStockThreshold"
              type="number"
              inputMode="numeric"
              min="0"
              defaultValue={5}
              required
              className={numberClass}
            />
          </Field>

          <Field id="unitCost" label="Unit cost" icon={Coins} required suffix="ETB">
            <input
              id="unitCost"
              name="unitCost"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              className={numberSuffixClass}
            />
          </Field>

          <Field id="unitPrice" label="Unit price" icon={CircleDollarSign} required suffix="ETB">
            <input
              id="unitPrice"
              name="unitPrice"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              className={numberSuffixClass}
            />
          </Field>
        </div>
      </section>

      {state.error && (
        <div
          ref={errorRef}
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-400/40 bg-red-500/[0.08] p-4 sm:p-5"
        >
          <CircleAlert size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-red-300" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-red-200">We couldn&apos;t add this part</p>
            <p className="mt-1 text-sm leading-6 text-red-100/80">{state.error}</p>
          </div>
        </div>
      )}

      <div className="ersms-gold-border rounded-2xl border bg-[#0c0c0c] p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="hidden sm:block">
            <p className="ersms-gold-bright text-sm font-extrabold">Ready to save</p>
            <p className="mt-0.5 text-xs text-white/45">Review the details before adding this part.</p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
            <Link
              href="/inventory"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-white/15 bg-[#161616] px-6 text-sm font-semibold text-white/80 transition-all duration-200 hover:border-[#D4AF37]/55 hover:bg-[#1c1c1c] hover:text-[#F5D76E] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/30 sm:w-auto"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isPending}
              aria-busy={isPending}
              className="ersms-gold-button inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-7 text-sm font-extrabold transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/40 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 size={17} aria-hidden="true" className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} aria-hidden="true" />
                  Add Part
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}