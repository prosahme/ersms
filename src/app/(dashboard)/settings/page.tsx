import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Settings as SettingsIcon,
  Users,
  Building2,
  Languages,
  DatabaseBackup,
  UserCog,
  RotateCcw,
  MapPin,
  Phone,
  Loader2,
} from "lucide-react";
import { toggleUserActiveAction, updateBusinessInfoAction } from "./actions";
import { NewUserForm } from "./new-user-form";
import { ResetPasswordButton } from "./reset-password-button";
import { DeleteUserButton } from "./delete-user-button";
import { RestoreBackupForm } from "./restore-backup-form";
import { getLanguage } from "@/lib/language";
import { t } from "@/lib/translations";

const inputClass =
  "block h-12 w-full rounded-xl border border-[#D4AF37]/35 bg-[#0a0a0a] pl-11 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/30 hover:border-[#D4AF37]/60 focus:border-[#D4AF37] focus:bg-[#0d0c08] focus:ring-4 focus:ring-[#D4AF37]/15 [color-scheme:dark]";

const labelClass =
  "mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#F5D76E]";

const goldBtn =
  "ersms-gold-button inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-extrabold transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/40 active:translate-y-0";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const lang = await getLanguage();
  const { tab } = await searchParams;
  const activeTab = tab ?? "users";

  const [users, businessInfo] = await Promise.all([
    prisma.user.findMany({ orderBy: { fullName: "asc" } }),
    prisma.businessInfo.findFirst(),
  ]);

  const tabs = [
    { key: "users", label: "User Management", icon: Users },
    { key: "business", label: "Business Information", icon: Building2 },
    { key: "language", label: "Language", icon: Languages },
    { key: "backup", label: "Backup & Restore", icon: DatabaseBackup },
  ];

  return (
    <div className="relative min-h-full overflow-hidden bg-[#050505] px-4 py-6 text-white sm:px-6 md:px-8 lg:px-10 lg:py-10">
      {/* Soft ambient light (very subtle, no grid) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.10),transparent_65%)]"
      />

      <div className="relative mx-auto w-full max-w-5xl space-y-5 sm:space-y-6">
        {/* Header */}
        <header className="ersms-fade-up ersms-gold-border relative overflow-hidden rounded-2xl border bg-gradient-to-b from-[#131313] to-[#0b0b0b] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.5)] sm:p-7">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
          />
          <div className="flex items-center gap-4">
            <div className="ersms-gold-border flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br from-[#D4AF37]/25 to-[#B87333]/10 sm:h-14 sm:w-14">
              <SettingsIcon size={24} aria-hidden="true" className="text-[#F5D76E]" />
            </div>
            <h1 className="ersms-gold-bright text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("settings", lang)}
            </h1>
          </div>
        </header>

        {/* Tabs */}
        <div
          className="ersms-fade-up -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0"
          style={{ animationDelay: "60ms" }}
        >
          {tabs.map((tabItem) => {
            const Icon = tabItem.icon;
            return (
              <Link
                key={tabItem.key}
                href={`/settings?tab=${tabItem.key}`}
                className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/30 ${
                  activeTab === tabItem.key
                    ? "ersms-gold-button border-transparent"
                    : "border-[#D4AF37]/25 bg-[#0f0f0f] text-white/65 hover:border-[#D4AF37]/55 hover:bg-[#D4AF37]/10 hover:text-[#F5D76E]"
                }`}
              >
                <Icon size={15} aria-hidden="true" />
                {tabItem.label}
              </Link>
            );
          })}
        </div>

        {/* Users tab */}
        {activeTab === "users" && (
          <div className="ersms-fade-up space-y-5 sm:space-y-6" style={{ animationDelay: "100ms" }}>
            <section className="ersms-gold-line relative rounded-2xl border bg-[#101010] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.45)] sm:p-7">
              <span
                aria-hidden="true"
                className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-transparent"
              />
              <h2 className="ersms-gold-bright mb-5 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em]">
                <UserCog size={16} aria-hidden="true" className="text-[#D4AF37]/70" />
                {t("addUser", lang)}
              </h2>
              <NewUserForm />
            </section>

            {/* Cards: phones and tablets */}
            <div className="grid gap-3 sm:grid-cols-2 xl:hidden">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="ersms-gold-line rounded-2xl border bg-[#0f0f0f] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.4)] sm:p-5"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="truncate text-[15px] font-extrabold text-white">{u.fullName}</p>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        u.isActive
                          ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                          : "border-white/20 bg-white/10 text-white/55"
                      }`}
                    >
                      {u.isActive ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <p className="truncate text-sm text-white/60">{u.email}</p>
                  <p className="mt-0.5 text-sm capitalize text-white/45">{u.role.toLowerCase()}</p>

                  <div className="ersms-gold-line mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-3">
                    <form action={toggleUserActiveAction}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="isActive" value={String(u.isActive)} />
                      <button type="submit" className="text-sm font-bold text-[#F5D76E] hover:underline">
                        {u.isActive ? "Disable" : "Enable"}
                      </button>
                    </form>
                    <ResetPasswordButton userId={u.id} />
                    <DeleteUserButton userId={u.id} fullName={u.fullName} />
                  </div>
                </div>
              ))}
            </div>

            {/* Table: large desktop screens */}
            <div className="ersms-gold-border hidden overflow-x-auto rounded-2xl border bg-[#0d0d0d] shadow-[0_20px_60px_rgba(0,0,0,0.45)] xl:block">
              <table className="w-full text-sm">
                <thead className="ersms-gold-border border-b bg-[#D4AF37]/[0.07]">
                  <tr>
                    <th scope="col" className="ersms-gold-bright px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em]">{t("name", lang)}</th>
                    <th scope="col" className="ersms-gold-bright px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em]">{t("email", lang)}</th>
                    <th scope="col" className="ersms-gold-bright px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em]">{t("role", lang)}</th>
                    <th scope="col" className="ersms-gold-bright px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em]">{t("status", lang)}</th>
                    <th scope="col" className="ersms-gold-bright px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em]">{t("actions", lang)}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="ersms-gold-line border-b transition-colors duration-200 last:border-0 hover:bg-[#D4AF37]/[0.06]">
                      <td className="px-5 py-4 font-bold text-white">{u.fullName}</td>
                      <td className="px-5 py-4 text-white/60">{u.email}</td>
                      <td className="px-5 py-4 capitalize text-white/60">{u.role.toLowerCase()}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            u.isActive
                              ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                              : "border-white/20 bg-white/10 text-white/55"
                          }`}
                        >
                          {u.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <form action={toggleUserActiveAction}>
                            <input type="hidden" name="id" value={u.id} />
                            <input type="hidden" name="isActive" value={String(u.isActive)} />
                            <button type="submit" className="text-sm font-bold text-[#F5D76E] hover:underline">
                              {u.isActive ? "Disable" : "Enable"}
                            </button>
                          </form>
                          <ResetPasswordButton userId={u.id} />
                          <DeleteUserButton userId={u.id} fullName={u.fullName} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Business tab */}
        {activeTab === "business" && (
          <section
            className="ersms-fade-up ersms-gold-line relative max-w-xl rounded-2xl border bg-[#101010] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.45)] sm:p-7"
            style={{ animationDelay: "100ms" }}
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-transparent"
            />
            <h2 className="ersms-gold-bright mb-5 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em]">
              <Building2 size={16} aria-hidden="true" className="text-[#D4AF37]/70" />
              {t("businessInformation", lang)}
            </h2>

            <form action={updateBusinessInfoAction} className="space-y-5">
              <div>
                <label htmlFor="name" className={labelClass}>{t("businessName", lang)}</label>
                <div className="group relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    defaultValue={businessInfo?.name ?? ""}
                    className={inputClass}
                  />
                  <Building2
                    size={16}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/65 transition-colors duration-200 group-focus-within:text-[#F5D76E]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className={labelClass}>Address</label>
                <div className="group relative">
                  <input
                    id="address"
                    name="address"
                    type="text"
                    defaultValue={businessInfo?.address ?? ""}
                    className={inputClass}
                  />
                  <MapPin
                    size={16}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/65 transition-colors duration-200 group-focus-within:text-[#F5D76E]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className={labelClass}>Phone</label>
                <div className="group relative">
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    defaultValue={businessInfo?.phone ?? ""}
                    className={inputClass}
                  />
                  <Phone
                    size={16}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/65 transition-colors duration-200 group-focus-within:text-[#F5D76E]"
                  />
                </div>
              </div>

              <button type="submit" className={goldBtn}>
                {t("save", lang)}
              </button>
            </form>
          </section>
        )}

        {/* Language tab */}
        {activeTab === "language" && (
          <section
            className="ersms-fade-up ersms-gold-line relative max-w-xl rounded-2xl border bg-[#101010] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.45)] sm:p-7"
            style={{ animationDelay: "100ms" }}
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-transparent"
            />
            <h2 className="ersms-gold-bright mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em]">
              <Languages size={16} aria-hidden="true" className="text-[#D4AF37]/70" />
              {t("language", lang)}
            </h2>
            <p className="text-sm leading-6 text-white/55">
              English / Amharic switching is coming in a follow-up update.
            </p>
          </section>
        )}

        {/* Backup tab */}
        {activeTab === "backup" && (
          <div className="ersms-fade-up space-y-5 sm:space-y-6" style={{ animationDelay: "100ms" }}>
            <section className="ersms-gold-line relative max-w-xl rounded-2xl border bg-[#101010] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.45)] sm:p-7">
              <span
                aria-hidden="true"
                className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-transparent"
              />
              <h2 className="ersms-gold-bright mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em]">
                <DatabaseBackup size={16} aria-hidden="true" className="text-[#D4AF37]/70" />
                {t("backupRestore", lang)}
              </h2>
              <p className="mb-5 text-sm leading-6 text-white/55">
                Download a full copy of your customers, repairs, inventory, and payments.
              </p>
              <a href="/api/backup" className={goldBtn}>
                {t("downloadBackup", lang)}
              </a>
            </section>

            <section className="relative max-w-xl rounded-2xl border border-red-400/40 bg-red-500/[0.06] p-5 sm:p-7">
              <h2 className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-red-300">
                <RotateCcw size={16} aria-hidden="true" />
                Restore
              </h2>
              <p className="mb-5 text-sm font-semibold leading-6 text-red-200">
                {t("restoreWarning", lang)}
              </p>
              <RestoreBackupForm />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}