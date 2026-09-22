"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { loginAction, type LoginState } from "./actions";
import { t, type Lang } from "@/lib/translations";

const initialState: LoginState = {};

export function LoginForm({ lang }: { lang: Lang }) {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      {/* Email */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-xs font-semibold uppercase tracking-[0.16em] text-white/55"
        >
          {t("emailAddress", lang)}
        </label>

        <div className="group relative">
          <Mail
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white/25 transition-colors duration-200 group-focus-within:text-[#D4AF37]"
          />

          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="name@company.com"
            className="h-13 w-full rounded-xl border border-white/10 bg-white/[0.045] pl-12 pr-4 text-sm text-white outline-none placeholder:text-white/20 transition-all duration-200 hover:border-white/20 focus:border-[#D4AF37]/70 focus:bg-white/[0.06] focus:ring-4 focus:ring-[#D4AF37]/10"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <label
            htmlFor="password"
            className="block text-xs font-semibold uppercase tracking-[0.16em] text-white/55"
          >
            {t("password", lang)}
          </label>

          <Link
            href="/forgot-password"
            className="text-xs font-medium text-[#D4AF37] transition-colors duration-200 hover:text-[#F5D76E] hover:underline focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:ring-offset-2 focus:ring-offset-[#0B0B0B]"
          >
            {t("forgotPassword", lang)}
          </Link>
        </div>

        <div className="group relative">
          <LockKeyhole
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white/25 transition-colors duration-200 group-focus-within:text-[#D4AF37]"
          />

          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className="h-13 w-full rounded-xl border border-white/10 bg-white/[0.045] pl-12 pr-12 text-sm text-white outline-none transition-all duration-200 hover:border-white/20 focus:border-[#D4AF37]/70 focus:bg-white/[0.06] focus:ring-4 focus:ring-[#D4AF37]/10"
          />

          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-white/30 transition-all duration-200 hover:bg-white/10 hover:text-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40"
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" size={18} />
            ) : (
              <Eye aria-hidden="true" size={18} />
            )}
          </button>
        </div>
      </div>

      {/* Remember me */}
      <label className="flex cursor-pointer items-center gap-3 select-none">

        <input
          type="checkbox"
          name="rememberMe"
          className="h-4 w-4 cursor-pointer appearance-none rounded border border-white/20 bg-white/[0.04] transition-all duration-200 checked:border-[#D4AF37] checked:bg-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
        />

        <span className="text-sm text-white/45 transition-colors duration-200 hover:text-white/65">
          {t("rememberMe", lang)}
        </span>
      </label>

      {/* Error */}
      {state.error && (
        <div
          role="alert"
          className="rounded-xl border border-red-400/20 bg-red-500/[0.08] px-4 py-3 text-sm leading-5 text-red-300"
        >
          {state.error}
        </div>
      )}

      {/* Sign in button */}
      <button
        type="submit"
        disabled={isPending}
        className="group relative flex h-13 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-[#C9972B] via-[#D4AF37] to-[#F5D76E] px-5 text-sm font-bold text-[#171006] shadow-[0_12px_35px_rgba(212,175,55,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(212,175,55,0.28)] active:translate-y-0 active:scale-[0.99] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/20 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        {/* Animated shine */}
        <span
          aria-hidden="true"
          className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/25 transition-transform duration-700 group-hover:translate-x-[420%] motion-reduce:transition-none"
        />

        {isPending ? (
          <span className="relative flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#171006]/30 border-t-[#171006] motion-reduce:animate-none" />
            {t("loggingIn", lang)}
          </span>
        ) : (
          <span className="relative flex items-center gap-2">
            {t("logIn", lang)}
            <span
              aria-hidden="true"
              className="text-base transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
            >
              →
            </span>
          </span>
        )}
      </button>
    </form>
  );
}