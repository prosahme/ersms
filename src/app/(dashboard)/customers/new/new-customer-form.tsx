"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Wrench,
  Smartphone,
  Building2,
  Hash,
  FileText,
  CircleDollarSign,
  WalletCards,
  Shield,
  LockKeyhole,
  ChevronDown,
  Loader2,
  Save,
  CircleAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createCustomerWithRepairAction, type CustomerRepairFormState } from "../actions";

const initialState: CustomerRepairFormState = {};

const controlBase =
  "block w-full rounded-xl border border-[#D4AF37]/35 bg-[#0a0a0a] pl-11 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/30 hover:border-[#D4AF37]/60 focus:border-[#D4AF37] focus:bg-[#0d0c08] focus:ring-4 focus:ring-[#D4AF37]/15 [color-scheme:dark]";

const inputClass = `${controlBase} h-12`;
const numberClass = `${controlBase} h-12 pr-16 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`;
const selectClass = `${controlBase} h-12 cursor-pointer appearance-none pr-11 [&>option]:bg-[#111111] [&>option]:text-white`;
const textareaClass = `${controlBase} min-h-[120px] resize-y py-3.5 leading-6`;

function Field({
  id,
  label,
  icon: Icon,
  optional = false,
  required = false,
  className = "",
  suffix,
  chevron = false,
  alignTop = false,
  children,
}: {
  id: string;
  label: string;
  icon: LucideIcon;
  optional?: boolean;
  required?: boolean;
  className?: string;
  suffix?: string;
  chevron?: boolean;
  alignTop?: boolean;
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
        {optional && (
          <span className="rounded-full border border-white/15 px-2 py-px text-[10px] font-medium normal-case tracking-normal text-white/50">
            Optional
          </span>
        )}
      </label>

      <div className="group relative">
        {children}
        <Icon
          aria-hidden="true"
          size={16}
          className={`pointer-events-none absolute left-4 text-[#D4AF37]/65 transition-colors duration-200 group-focus-within:text-[#F5D76E] ${
            alignTop ? "top-4" : "top-1/2 -translate-y-1/2"
          }`}
        />
        {chevron && (
          <ChevronDown
            aria-hidden="true"
            size={16}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/75"
          />
        )}
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold tracking-wide text-[#D4AF37]">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function Section({
  number,
  icon: Icon,
  title,
  description,
  delay = 0,
  children,
}: {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <section
      className="ersms-fade-up ersms-gold-line relative rounded-2xl border bg-[#101010] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.45)] sm:p-7"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-transparent"
      />

      <div className="mb-6 flex items-start gap-4 border-b border-[#D4AF37]/15 pb-5">
        <div className="ersms-gold-border relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br from-[#D4AF37]/20 to-[#B87333]/10">
          <Icon size={20} aria-hidden="true" className="text-[#F5D76E]" />
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#D4AF37] text-[10px] font-extrabold text-black">
            {number}
          </span>
        </div>

        <div className="min-w-0">
          <h2 className="ersms-gold-bright text-lg font-extrabold tracking-tight">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-white/50 sm:text-[13px]">{description}</p>
        </div>
      </div>

      {children}
    </section>
  );
}

export function NewCustomerForm({
  technicians,
  isAdmin,
}: {
  technicians: { id: string; fullName: string }[];
  isAdmin: boolean;
}) {
  const [state, formAction, isPending] = useActionState(createCustomerWithRepairAction, initialState);
  // On by default — the primary workflow is customer + repair together.
  // Turning it off falls back to the plain "customer only" save.
  const [includeRepair, setIncludeRepair] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);

  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.error) {
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-5 sm:space-y-6">
      <input type="hidden" name="includeRepair" value={includeRepair ? "1" : "0"} />

      {/* Customer information */}
      <Section
        number="1"
        icon={User}
        title="Customer Information"
        description="Create the customer's basic profile and contact details."
        delay={0}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="name" label="Full name" icon={User} required className="sm:col-span-2">
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Enter customer's full name"
              className={inputClass}
            />
          </Field>

          <Field id="phone" label="Phone number" icon={Phone} required>
            <input
              id="phone"
              name="phone"
              type="text"
              inputMode="tel"
              required
              autoComplete="tel"
              placeholder="09XXXXXXXX"
              className={inputClass}
            />
          </Field>

          <Field id="email" label="Email address" icon={Mail} optional>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="customer@example.com"
              className={inputClass}
            />
          </Field>

          <Field id="address" label="Address" icon={MapPin} optional className="sm:col-span-2">
            <input
              id="address"
              name="address"
              type="text"
              autoComplete="street-address"
              placeholder="Customer address"
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      {/* Repair toggle */}
      <section
        className="ersms-fade-up ersms-gold-line relative rounded-2xl border bg-[#101010] p-5 sm:p-6"
        style={{ animationDelay: "60ms" }}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300 ${
                includeRepair
                  ? "border-[#D4AF37]/50 bg-[#D4AF37]/15"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <Wrench
                size={20}
                aria-hidden="true"
                className={`transition-colors duration-300 ${
                  includeRepair ? "text-[#F5D76E]" : "text-white/30"
                }`}
              />
            </div>
            <div>
              <p id="repair-toggle-label" className="text-sm font-bold text-[#F5D76E]">
                Create a repair ticket now
              </p>
              <p className="mt-1 max-w-lg text-xs leading-5 text-white/45 sm:text-[13px]">
                Register the customer&apos;s device and repair details together
                with this customer profile.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={includeRepair}
            aria-labelledby="repair-toggle-label"
            onClick={() => setIncludeRepair((v) => !v)}
            className={`relative h-8 w-14 shrink-0 self-start rounded-full border transition-colors duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/40 sm:self-center ${
              includeRepair ? "border-[#D4AF37] bg-[#D4AF37]" : "border-white/15 bg-[#181818]"
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute left-1 top-1 h-6 w-6 rounded-full transition-all duration-300 ${
                includeRepair ? "translate-x-6 bg-black" : "translate-x-0 bg-white/40"
              }`}
            />
          </button>
        </div>
      </section>

      {/* Repair information */}
      {includeRepair && (
        <Section
          number="2"
          icon={Wrench}
          title="Repair Information"
          description="Tell us about the device and the problem reported by the customer."
          delay={100}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="assignedTechnicianId"
              label="Assign technician"
              icon={User}
              optional
              chevron
              className="sm:col-span-2"
            >
              <select id="assignedTechnicianId" name="assignedTechnicianId" className={selectClass}>
                <option value="">Unassigned</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.fullName}
                  </option>
                ))}
              </select>
            </Field>

            <Field id="deviceType" label="Device type" icon={Smartphone} required chevron className="sm:col-span-2">
              <select id="deviceType" name="deviceType" required={includeRepair} className={selectClass}>
                <option value="PHONE">Phone</option>
                <option value="TABLET">Tablet</option>
                <option value="LAPTOP">Laptop</option>
                <option value="DESKTOP">Desktop</option>
                <option value="TV">TV</option>
                <option value="RECEIVER">Receiver</option>
                <option value="AMPLIFIER">Amplifier</option>
                <option value="MOSQUE_MICROPHONE">Mosque Microphone</option>
                <option value="SPEAKER">Speaker</option>
                <option value="OTHER">Other</option>
              </select>
            </Field>

            <Field id="deviceBrand" label="Device brand" icon={Building2} required>
              <input
                id="deviceBrand"
                name="deviceBrand"
                type="text"
                required={includeRepair}
                placeholder="Samsung, Apple, Sony..."
                className={inputClass}
              />
            </Field>

            <Field id="deviceModel" label="Device model" icon={Smartphone} required>
              <input
                id="deviceModel"
                name="deviceModel"
                type="text"
                required={includeRepair}
                placeholder="Galaxy S24, iPhone 15..."
                className={inputClass}
              />
            </Field>

            <Field id="serialNumberImei" label="Serial number / IMEI" icon={Hash} optional className="sm:col-span-2">
              <input
                id="serialNumberImei"
                name="serialNumberImei"
                type="text"
                placeholder="Serial or IMEI number"
                className={inputClass}
              />
            </Field>

            <Field id="reportedProblem" label="Reported problem" icon={FileText} required alignTop className="sm:col-span-2">
              <textarea
                id="reportedProblem"
                name="reportedProblem"
                required={includeRepair}
                rows={4}
                placeholder="Describe the customer's reported problem..."
                className={textareaClass}
              />
            </Field>
          </div>
        </Section>
      )}

      {/* Payment information */}
      {includeRepair && (
        <Section
          number="3"
          icon={CircleDollarSign}
          title="Payment Information"
          description="Record the estimated repair cost and initial deposit."
          delay={140}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="estimatedCost" label="Estimated cost" icon={CircleDollarSign} required suffix="ETB">
              <input
                id="estimatedCost"
                name="estimatedCost"
                type="number"
                inputMode="decimal"
                step="0.01"
                required={includeRepair}
                placeholder="0.00"
                className={numberClass}
              />
            </Field>

            <Field id="depositAmount" label="Deposit amount" icon={WalletCards} required suffix="ETB">
              <input
                id="depositAmount"
                name="depositAmount"
                type="number"
                inputMode="decimal"
                step="0.01"
                required={includeRepair}
                placeholder="0.00"
                className={numberClass}
              />
            </Field>

            <Field
              id="paymentMethod"
              label="Deposit payment method"
              icon={WalletCards}
              required
              chevron
              className="sm:col-span-2"
            >
              <select id="paymentMethod" name="paymentMethod" required={includeRepair} className={selectClass}>
                <option value="CASH">Cash</option>
                <option value="TELEBIRR">Telebirr</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </Field>
          </div>
        </Section>
      )}

      {/* Admin only: private repair */}
      {includeRepair && isAdmin && (
        <section
          className="ersms-fade-up relative rounded-2xl border border-[#B87333]/40 bg-[#120f0a] p-5 sm:p-6"
          style={{ animationDelay: "180ms" }}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#B87333]/45 bg-[#B87333]/10">
                <LockKeyhole size={18} aria-hidden="true" className="text-[#E0A36B]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Shield size={14} aria-hidden="true" className="text-[#E0A36B]" />
                  <h3 className="ersms-gold-bright text-sm font-extrabold">Private repair</h3>
                </div>
                <p className="mt-1 max-w-xl text-xs leading-5 text-white/50 sm:text-[13px]">
                  Owner-only. A private repair is hidden from Technicians.
                </p>
              </div>
            </div>

            <label htmlFor="visibility-private" className="flex cursor-pointer items-center gap-3 self-start sm:self-center">
              <span className="text-sm font-semibold text-white/70">Keep private</span>
              <input
                id="visibility-private"
                name="visibility"
                type="checkbox"
                value="PRIVATE"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={`relative h-[30px] w-[54px] shrink-0 rounded-full border transition-colors duration-300 peer-focus-visible:ring-4 peer-focus-visible:ring-[#D4AF37]/40 ${
                  isPrivate ? "border-[#D4AF37] bg-[#D4AF37]" : "border-white/20 bg-[#191919]"
                }`}
              >
                <span
                  className={`absolute left-[3px] top-[3px] h-[22px] w-[22px] rounded-full transition-all duration-300 ${
                    isPrivate ? "translate-x-6 bg-black" : "translate-x-0 bg-white/55"
                  }`}
                />
              </span>
            </label>
          </div>
        </section>
      )}

      {/* Error */}
      {state.error && (
        <div
          ref={errorRef}
          role="alert"
          className="ersms-fade-up flex items-start gap-3 rounded-2xl border border-red-400/40 bg-red-500/[0.08] p-4 sm:p-5"
        >
          <CircleAlert size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-red-300" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-red-200">We couldn&apos;t save this customer</p>
            <p className="mt-1 text-sm leading-6 text-red-100/80">{state.error}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div
        className="ersms-fade-up ersms-gold-border rounded-2xl border bg-[#0c0c0c] p-4 shadow-[0_-12px_40px_rgba(0,0,0,0.55)] sm:sticky sm:bottom-4 sm:z-20 sm:p-5"
        style={{ animationDelay: "220ms" }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="hidden sm:block">
            <p className="ersms-gold-bright text-sm font-extrabold">Ready to save</p>
            <p className="mt-0.5 text-xs text-white/45">Review the information before submitting.</p>
          </div>

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
                {includeRepair ? "Save Customer & Create Repair" : "Save Customer"}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}