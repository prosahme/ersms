"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Wrench,
  Package,
  Wallet,
  Receipt,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Calendar1,
  X,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { logoutAction } from "@/app/(dashboard)/logout-action";
import { useSidebar } from "./sidebar-context";
import { t } from "@/lib/translations";
import { clearSnapshot } from "@/lib/offline-cache";

// Kept as a small local list rather than importing from auth-guard.ts —
// this is a client component, and auth-guard.ts pulls in server-only
// session code that can't be bundled client-side. This list is UI-only;
// the actual access control is enforced server-side on every financial
// page/action regardless of what the sidebar shows.
const FINANCIAL_ROLES_CLIENT = ["ADMINISTRATOR", "MANAGER", "CASHIER"];

const navItems = [
  { href: "/dashboard", key: "dashboard" as const, icon: LayoutDashboard },
  { href: "/customers", key: "customers" as const, icon: Users },
  { href: "/repairs", key: "repairTickets" as const, icon: Wrench },
  { href: "/inventory", key: "inventory" as const, icon: Package },
  { href: "/payments", key: "payments" as const, icon: Wallet, financialOnly: true },
  { href: "/expenses", key: "shopExpenses" as const, icon: Receipt, financialOnly: true },
  { href: "/reminders", key: "reminders" as const, icon: Calendar1, adminOnly: true },
  { href: "/reports", key: "reports" as const, icon: BarChart3, financialOnly: true },
  { href: "/notifications", key: "notifications" as const, icon: Bell },
];

function NavLink({
  href,
  icon: Icon,
  label,
  isActive,
  index,
  onNavigate,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  index: number;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      style={{ animationDelay: `${60 + index * 40}ms` }}
      className={`ersms-fade-in group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/70 ${
        isActive
          ? "bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/[0.04] text-[#F5D76E] shadow-[inset_0_0_0_1px_rgba(212,175,55,0.18)]"
          : "text-white/60 hover:bg-white/[0.05] hover:text-white"
      }`}
    >
      {/* Active marker */}
      <span
        aria-hidden="true"
        className={`absolute left-0 top-1/2 h-6 -translate-y-1/2 rounded-r-full bg-[#D4AF37] transition-all duration-300 ${
          isActive ? "w-1 opacity-100" : "w-0 opacity-0"
        }`}
      />

      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all duration-200 ${
          isActive
            ? "border-[#D4AF37]/45 bg-[#D4AF37]/15 text-[#F5D76E]"
            : "border-white/10 bg-white/[0.03] text-white/55 group-hover:border-[#D4AF37]/35 group-hover:bg-[#D4AF37]/10 group-hover:text-[#F5D76E]"
        }`}
      >
        <Icon size={18} aria-hidden="true" />
      </span>

      <span className="min-w-0 flex-1 truncate">{label}</span>
    </Link>
  );
}

export function Sidebar({ role, lang }: { role?: string; lang: "en" | "am" }) {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const visibleItems = navItems.filter((item) => {
    if (item.adminOnly && role !== "ADMINISTRATOR") return false;
    if (item.financialOnly && !FINANCIAL_ROLES_CLIENT.includes(role ?? "")) return false;
    return true;
  });

  // Phones: Escape closes the drawer, and the page behind it doesn't scroll.
  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeyDown);

    const isPhone = window.matchMedia("(max-width: 767px)").matches;
    const previousOverflow = document.body.style.overflow;
    if (isPhone) document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, close]);

  const roleLabel = role
    ? role.charAt(0) + role.slice(1).toLowerCase().replace(/_/g, " ")
    : null;

  return (
    <>
      {/* Backdrop (phones only) */}
      <div
        onClick={close}
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-black/70 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] transform flex-col overflow-hidden border-r border-[#D4AF37]/15 bg-gradient-to-b from-[#0d0d0d] to-[#070707] shadow-[8px_0_40px_rgba(0,0,0,0.6)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:static md:w-64 md:max-w-none md:translate-x-0 md:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Soft ambient light at the top */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.13),transparent_70%)]"
        />

        {/* Brand */}
        <div className="relative flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[#D4AF37]/15 px-5">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src="/logo-full.png"
              alt="ERSMS"
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded-lg object-cover ring-1 ring-[#D4AF37]/40"
            />
            <div className="min-w-0 leading-tight">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#B87333]">
                ERSMS
              </p>
              <p className="ersms-gold-bright truncate text-base font-extrabold tracking-tight">
                Management
              </p>
            </div>
          </div>

          {/* Close button (phones only) */}
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/70 transition-all duration-200 hover:border-[#D4AF37]/50 hover:text-[#F5D76E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/70 md:hidden"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Navigation */}
        <nav
          aria-label="Main navigation"
          className="relative min-h-0 flex-1 overflow-y-auto px-3 py-5"
        >
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
            Menu
          </p>

          <div className="space-y-1">
            {visibleItems.map((item, index) => (
              <NavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={t(item.key, lang)}
                isActive={pathname.startsWith(item.href)}
                index={index}
                onNavigate={close}
              />
            ))}
          </div>
        </nav>

        {/* Bottom: settings, role, logout */}
        <div className="relative shrink-0 space-y-1 border-t border-[#D4AF37]/15 px-3 py-4">
          {role === "ADMINISTRATOR" && (
            <NavLink
              href="/settings"
              icon={Settings}
              label={t("settings", lang)}
              isActive={pathname.startsWith("/settings")}
              index={visibleItems.length}
              onNavigate={close}
            />
          )}

          <form
            action={logoutAction}
            onSubmit={() => {
              // Clear this user's cached offline data on sign-out so it
              // isn't left on a shared shop computer for whoever logs in
              // next. Fire-and-forget: never block or fail the logout.
              void clearSnapshot();
            }}
          >
            <button
              type="submit"
              className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-300 transition-all duration-200 hover:bg-red-500/10 hover:text-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-400/25 bg-red-500/[0.06] transition-all duration-200 group-hover:border-red-400/50 group-hover:bg-red-500/15">
                <LogOut size={18} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 truncate text-left">{t("logout", lang)}</span>
            </button>
          </form>

          {roleLabel && (
            <p className="mt-2 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] font-semibold text-white/45">
              <ShieldCheck size={13} aria-hidden="true" className="shrink-0 text-[#D4AF37]/70" />
              <span className="truncate">Signed in as {roleLabel}</span>
            </p>
          )}
        </div>
      </aside>
    </>
  );
}