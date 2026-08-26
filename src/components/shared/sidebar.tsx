"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Wrench, Package, Wallet, BarChart3, Bell, Settings, LogOut, Calendar1 } from "lucide-react";
import Image from "next/image";
import { logoutAction } from "@/app/(dashboard)/logout-action";
import { useSidebar } from "./sidebar-context";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/repairs", label: "Repair Tickets", icon: Wrench },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/payments", label: "Payments", icon: Wallet },
  { href: "/reminders", label: "Reminders", icon: Calendar1, adminOnly: true },
  { href: "/reports", label: "Reports", icon: BarChart3, adminOnly: true },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

export function Sidebar({ role }: { role?: string }) {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const visibleItems = navItems.filter((item) => !item.adminOnly || role === "ADMINISTRATOR");

  return (
    <>
      {isOpen && (
        <div onClick={close} className="fixed inset-0 bg-black/30 z-30 md:hidden" />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-orange-50 border-r border-orange-200 flex flex-col transform transition-transform duration-200 md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 px-6 h-16 border-b border-orange-200">
          <Image src="/logo-full.png" alt="ERSMS" width={28} height={28} />
          <span className="font-semibold text-slate-900">Management</span>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? "bg-orange-50 text-orange-600" : "text-slate-600 hover:bg-orange-50"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-2 py-4 border-t border-orange-200 space-y-1">
          {role === "ADMINISTRATOR" && (
            <Link
              href="/settings"
              onClick={close}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
                pathname.startsWith("/settings") ? "bg-orange-50 text-orange-600" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Settings size={18} />
              Settings
            </Link>
          )}

          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} />
              Logout
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}