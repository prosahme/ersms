"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "./sidebar-context";

export function SidebarMenuButton() {
  const { toggle } = useSidebar();
  return (
    <button onClick={toggle} className="md:hidden text-slate-500" aria-label="Toggle menu">
      <Menu size={22} />
    </button>
  );
}