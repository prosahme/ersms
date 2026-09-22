import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, KeyRound, ShieldCheck, MessageCircle } from "lucide-react";

// Day 6: administrator-assisted password reset. No email input on this
// page at all — deliberately, since asking for an email and then always
// showing the same message is still worth doing right, and the simplest,
// safest option is to not collect anything here. There is nothing for
// this page to look up, so there is nothing that could leak whether a
// given account exists. The actual reset is performed by an
// Administrator from Settings -> User Management (existing
// Administrator-only resetPasswordAction), unchanged by this page.
export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-4 py-10 text-white">
      {/* Soft ambient light (very subtle, no grid) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.12),transparent_65%)]"
      />

      <div
        className="ersms-fade-up ersms-gold-border relative w-full max-w-sm overflow-hidden rounded-2xl border bg-gradient-to-b from-[#131313] to-[#0b0b0b] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.55)] sm:p-8"
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
        />

        <div className="mb-5 flex justify-center">
          <Image
            src="/logo-full.png"
            alt="Family Electronics Maintenance"
            width={60}
            height={60}
            className="h-[60px] w-[60px] rounded-xl object-cover ring-1 ring-[#D4AF37]/40"
          />
        </div>

        <div className="mb-2 flex justify-center">
          <span className="ersms-gold-border flex h-11 w-11 items-center justify-center rounded-xl border bg-[#D4AF37]/10">
            <KeyRound size={20} aria-hidden="true" className="text-[#F5D76E]" />
          </span>
        </div>

        <h1 className="ersms-gold-bright text-center text-xl font-extrabold tracking-tight sm:text-2xl">
          Forgot Your Password?
        </h1>
        <p className="mt-2 text-center text-sm leading-6 text-white/55">
          For security, password resets are handled by your shop Administrator
          — this system doesn&apos;t send reset emails.
        </p>

        <div className="ersms-gold-line mt-6 space-y-3 rounded-xl border bg-[#0a0a0a] p-4 text-sm leading-6 text-white/70">
          <p className="flex items-start gap-2.5">
            <MessageCircle size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-[#D4AF37]/70" />
            Please contact your Administrator directly (in person, by phone,
            or your usual work channel) and ask them to reset your password.
          </p>
          <p className="flex items-start gap-2.5">
            <ShieldCheck size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-[#D4AF37]/70" />
            <span>
              They can do this from{" "}
              <span className="font-bold text-[#F5D76E]">Settings → User Management</span>.
              You&apos;ll be given a temporary password and asked to set a new
              one the next time you log in.
            </span>
          </p>
        </div>

        <Link
          href="/login"
          className="ersms-gold-button mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-extrabold transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/40 active:translate-y-0"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Login
        </Link>
      </div>
    </div>
  );
}