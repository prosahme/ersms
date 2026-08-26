"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { SidebarMenuButton } from "./sidebar-menu-button";

export function GlobalSearchForm() {
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem("q") as HTMLInputElement;
        const value = input.value.trim();
        if (!value) return;
        if (/^rep-/i.test(value)) {
          router.push(`/repairs?search=${encodeURIComponent(value)}`);
        } else {
          router.push(`/customers?search=${encodeURIComponent(value)}`);
        }
      }}
      className="flex items-center gap-2 flex-1 min-w-0 max-w-md"
    >
      <SidebarMenuButton />
      <Search size={18} className="text-slate-400 flex-shrink-0" />
      <input
        name="q"
        type="text"
        placeholder="Search customer or ticket #..."
        className="w-full text-sm outline-none placeholder:text-slate-400 min-w-0"
      />
    </form>
  );
}