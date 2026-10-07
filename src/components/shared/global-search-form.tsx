"use client";

import { useId } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { SidebarMenuButton } from "./sidebar-menu-button";

/**
 * Where a search goes, and what the placeholder says, depends on which
 * section of the app the user is currently in. A ticket-number-looking
 * query ("REP-..." style) still always jumps to Repairs, since that's
 * a distinct lookup regardless of the current page.
 */
function resolveDestination(pathname: string, value: string): string {
  if (/^rep-/i.test(value)) {
    return `/repairs?search=${encodeURIComponent(value)}`;
  }
  if (pathname.startsWith("/inventory")) {
    return `/inventory?search=${encodeURIComponent(value)}`;
  }
  if (pathname.startsWith("/payments")) {
    return `/payments?search=${encodeURIComponent(value)}`;
  }
  if (pathname.startsWith("/repairs")) {
    return `/repairs?search=${encodeURIComponent(value)}`;
  }
  // Default: customers, same as before.
  return `/customers?search=${encodeURIComponent(value)}`;
}

function placeholderFor(pathname: string): string {
  if (pathname.startsWith("/inventory")) return "Search spare parts by name or SKU...";
  if (pathname.startsWith("/payments")) return "Search payments by ticket # or customer...";
  if (pathname.startsWith("/repairs")) return "Search ticket # or customer...";
  return "Search customer or ticket #...";
}

export function GlobalSearchForm() {
  const router = useRouter();
  const pathname = usePathname();
  const inputId = useId();

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem("q") as HTMLInputElement;
        const value = input.value.trim();
        if (!value) return;
        router.push(resolveDestination(pathname, value));
      }}
      className="flex min-w-0 max-w-md flex-1 items-center gap-2 sm:gap-3 lg:max-w-lg"
    >
      <SidebarMenuButton />

      <div className="group relative min-w-0 flex-1">
        <label htmlFor={inputId} className="sr-only">
          {placeholderFor(pathname)}
        </label>

        <Search
          size={17}
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D4AF37]/60 transition-colors duration-200 group-focus-within:text-[#F5D76E]"
        />

        <input
          id={inputId}
          name="q"
          type="text"
          enterKeyHint="search"
          autoComplete="off"
          placeholder={placeholderFor(pathname)}
          className="block h-10 w-full min-w-0 truncate rounded-xl border border-[#D4AF37]/25 bg-[#0f0f0f] pl-10 pr-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/35 hover:border-[#D4AF37]/50 focus:border-[#D4AF37] focus:bg-[#12110b] focus:ring-4 focus:ring-[#D4AF37]/15 sm:pr-14 [color-scheme:dark]"
        />

        {/* Enter hint (tablet and up) */}
        <kbd
          aria-hidden="true"
          className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-white/15 bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-bold text-white/40 transition-opacity duration-200 group-focus-within:border-[#D4AF37]/40 group-focus-within:text-[#F5D76E] sm:block"
        >
          Enter
        </kbd>
      </div>
    </form>
  );
}