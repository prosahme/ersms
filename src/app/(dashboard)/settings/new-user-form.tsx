"use client";

import { useActionState } from "react";
import { User, Mail, Shield, ChevronDown, Loader2, UserPlus, CircleCheck } from "lucide-react";
import { createUserAction, type UserFormState } from "./actions";

const initialState: UserFormState = {};

const controlBase =
  "block h-12 w-full rounded-xl border border-[#D4AF37]/35 bg-[#0a0a0a] pl-11 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/30 hover:border-[#D4AF37]/60 focus:border-[#D4AF37] focus:bg-[#0d0c08] focus:ring-4 focus:ring-[#D4AF37]/15 [color-scheme:dark]";

const selectClass = `${controlBase} cursor-pointer appearance-none pr-11 [&>option]:bg-[#111111] [&>option]:text-white`;

const labelClass =
  "mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#F5D76E]";

export function NewUserForm() {
  const [state, formAction, isPending] = useActionState(createUserAction, initialState);

  return (
    <div>
      <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,180px)_auto] lg:items-end">
        <div className="min-w-0">
          <label htmlFor="fullName" className={labelClass}>Full Name</label>
          <div className="relative">
            <input id="fullName" name="fullName" type="text" required autoComplete="off" className={controlBase} />
            <User size={16} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/65" />
          </div>
        </div>

        <div className="min-w-0">
          <label htmlFor="email" className={labelClass}>Email</label>
          <div className="relative">
            <input id="email" name="email" type="email" required autoComplete="off" className={controlBase} />
            <Mail size={16} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/65" />
          </div>
        </div>

        <div className="min-w-0">
          <label htmlFor="role" className={labelClass}>Role</label>
          <div className="relative">
            <select id="role" name="role" required className={selectClass}>
              <option value="TECHNICIAN">Technician</option>
              <option value="CASHIER">Cashier</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMINISTRATOR">Owner/Administrator</option>
            </select>
            <Shield size={16} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/65" />
            <ChevronDown size={16} aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/75" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          aria-busy={isPending}
          className="ersms-gold-button inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-extrabold transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/40 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 lg:w-auto"
        >
          {isPending ? (
            <>
              <Loader2 size={16} aria-hidden="true" className="animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <UserPlus size={16} aria-hidden="true" />
              Add User
            </>
          )}
        </button>
      </form>

      {state.error && (
        <p className="mt-3 text-sm font-semibold text-red-300">{state.error}</p>
      )}

      {state.tempPassword && (
        <div className="ersms-fade-in mt-4 flex items-start gap-3 rounded-2xl border border-emerald-400/40 bg-emerald-500/[0.08] p-4">
          <CircleCheck size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-emerald-300" />
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-emerald-200">User created!</p>
            <p className="mt-1 text-sm text-emerald-100/85">Email: {state.createdEmail}</p>
            <p className="mt-1 text-sm text-emerald-100/85">
              Temporary password:{" "}
              <span className="rounded bg-black/30 px-1.5 py-0.5 font-mono font-bold text-[#F5D76E]">
                {state.tempPassword}
              </span>
            </p>
            <p className="mt-2 text-xs text-emerald-200/60">Save this now — it won&apos;t be shown again.</p>
          </div>
        </div>
      )}
    </div>
  );
}