import Image from "next/image";
import { LoginForm } from "./login-form";
import { getLanguage } from "@/lib/language";
import { t } from "@/lib/translations";

export default async function LoginPage() {
  const lang = await getLanguage();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      {/* Ambient gold glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#D4AF37]/10 blur-[120px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#C9972B]/10 blur-[120px]"
      />

      {/* Very subtle technical grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(212,175,55,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.35) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Decorative circuit lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-[8%] top-[18%] h-px w-40 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent animate-[pulse_4s_ease-in-out_infinite]" />
        <div className="absolute right-[8%] top-[28%] h-px w-56 bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent animate-[pulse_5s_ease-in-out_infinite]" />
        <div className="absolute bottom-[24%] left-[5%] h-px w-52 bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute bottom-[14%] right-[10%] h-px w-36 bg-gradient-to-r from-transparent via-[#D4AF37]/25 to-transparent animate-[pulse_4.5s_ease-in-out_infinite]" />

        <div className="absolute left-[12%] top-[18%] h-2 w-2 rounded-full bg-[#D4AF37]/50 shadow-[0_0_16px_rgba(212,175,55,0.6)] animate-pulse" />
        <div className="absolute right-[12%] top-[28%] h-2 w-2 rounded-full bg-[#F5D76E]/40 shadow-[0_0_16px_rgba(245,215,110,0.5)] animate-pulse" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A]/90 shadow-[0_30px_100px_rgba(0,0,0,0.7)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
          {/* Brand / visual side */}
          <section className="relative hidden min-h-[680px] overflow-hidden border-r border-white/10 bg-[#080808] p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
            {/* Local ambient glow */}
            <div
              aria-hidden="true"
              className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-[100px]"
            />

            <div
              aria-hidden="true"
              className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#C9972B]/5 blur-[110px]"
            />

            {/* Brand */}
            <div className="relative">
              <div className="flex items-center gap-4">
                <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 shadow-[0_0_35px_rgba(212,175,55,0.12)]">
                  <Image
                    src="/logo-full.png"
                    alt="Family Electronics Maintenance"
                    width={56}
                    height={56}
                    className="h-14 w-14 object-cover"
                    priority
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
                    ERSMS
                  </p>
                  <p className="mt-1 text-sm text-white/50">
                    Electronics Repair Management
                  </p>
                </div>
              </div>
            </div>

            {/* Main visual */}
            <div className="relative">
              <div className="mb-8">
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-px w-10 bg-[#D4AF37]" />
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
                    Maintenance Control
                  </span>
                </div>

                <h2 className="max-w-lg text-4xl font-extrabold leading-[1.08] tracking-tight text-white xl:text-5xl">
                  Precision repairs.
                  <span className="block bg-gradient-to-r from-[#F5D76E] via-[#D4AF37] to-[#C9972B] bg-clip-text text-transparent">
                    Smarter management.
                  </span>
                </h2>

                <p className="mt-6 max-w-md text-sm leading-7 text-white/45">
                  A centralized workspace for managing customers, repairs,
                  inventory and maintenance operations.
                </p>
              </div>

              {/* Technical status panel */}
              <div className="relative max-w-md rounded-2xl border border-white/10 bg-white/[0.025] p-5 shadow-2xl">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#D4AF37]/[0.05] to-transparent" />

                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/35">
                      System Status
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white/80">
                      Maintenance network ready
                    </p>
                  </div>

                  <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300/80">
                      Ready
                    </span>
                  </div>
                </div>

                <div className="relative mt-5 grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-white/5 bg-black/20 px-3 py-3">
                    <p className="text-[9px] uppercase tracking-wider text-white/30">
                      Repairs
                    </p>
                    <div className="mt-2 h-1 rounded-full bg-white/5">
                      <div className="h-1 w-4/5 rounded-full bg-gradient-to-r from-[#C9972B] to-[#F5D76E]" />
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-black/20 px-3 py-3">
                    <p className="text-[9px] uppercase tracking-wider text-white/30">
                      Inventory
                    </p>
                    <div className="mt-2 h-1 rounded-full bg-white/5">
                      <div className="h-1 w-3/5 rounded-full bg-gradient-to-r from-[#C9972B] to-[#F5D76E]" />
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-black/20 px-3 py-3">
                    <p className="text-[9px] uppercase tracking-wider text-white/30">
                      Service
                      </p>
                    <div className="mt-2 h-1 rounded-full bg-white/5">
                      <div className="h-1 w-[90%] rounded-full bg-gradient-to-r from-[#C9972B] to-[#F5D76E]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="relative text-xs text-white/25">
              Family Electronics Maintenance
            </p>
          </section>

          {/* Login side */}
          <section className="flex min-h-[680px] items-center justify-center bg-[#0B0B0B] px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
            <div className="w-full max-w-md">
              {/* Mobile brand */}
              <div className="mb-10 flex items-center gap-3 lg:hidden">
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10">
                  <Image
                    src="/logo-full.png"
                    alt="Family Electronics Maintenance"
                    width={44}
                    height={44}
                    className="h-11 w-11 object-cover"
                    priority
                  />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                    ERSMS
                  </p>
                  <p className="text-xs text-white/40">
                    Electronics Repair Management
                  </p>
                </div>
              </div>

              <div className="mb-9">
                <div className="mb-4 flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-[#F5D76E] shadow-[0_0_8px_rgba(245,215,110,0.8)]" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D4AF37]/80">
                    Secure Access
                  </span>
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  {t("welcomeBack", lang)}
                </h1>

                <p className="mt-3 max-w-sm text-sm leading-6 text-white/40">
                  {t("signInSubtitle", lang)}
                </p>
              </div>

              <LoginForm lang={lang} />

              <p className="mt-8 text-center text-[11px] leading-5 text-white/20">
                © 2026 Electronics Repair Shop Management System.
                <span className="block">Internal use only.</span>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}