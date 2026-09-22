"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "./sidebar-context";

export function SidebarMenuButton() {
  const { toggle, isOpen } = useSidebar();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle menu"
      aria-expanded={isOpen}
      className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/[0.07] text-[#F5D76E] transition-all duration-200 hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/70 active:scale-95 md:hidden"
    >
      <Menu
        size={20}
        aria-hidden="true"
        className="transition-transform duration-200 group-hover:scale-110"
      />
    </button>
  );
}