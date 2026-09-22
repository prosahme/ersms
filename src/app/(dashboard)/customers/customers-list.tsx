"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { Search, ChevronRight, Users, Mail, Phone } from "lucide-react";
import { DeleteCustomerButton } from "./delete-button";
import { t, type Lang } from "@/lib/translations";

type Customer = { id: string; name: string; phone: string; email: string | null };

function initialOf(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

/**
 * Renders the search box and the customer list together, filtering
 * in-memory as the user types — no Enter key, no Search button, no
 * network round-trip per keystroke. Matches the same incremental-search
 * approach already used on the New Repair page's customer picker.
 */
export function CustomersList({
  customers,
  lang,
  initialQuery = "",
}: {
  customers: Customer[];
  lang: Lang;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const inputId = useId();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    const qDigits = q.replace(/\D/g, "");
    return customers.filter((c) => {
      const nameMatch = c.name.toLowerCase().includes(q);
      const phoneMatch = qDigits !== "" && c.phone.replace(/\D/g, "").includes(qDigits);
      return nameMatch || phoneMatch;
    });
  }, [query, customers]);

  const thClass =
    "ersms-gold-bright px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em]";

  return (
    <>
      {/* Search */}
      <div className="ersms-gold-line mb-6 rounded-2xl border bg-[#0d0d0d] p-4 sm:p-5">
        <div className="group relative max-w-sm">
          <label htmlFor={inputId} className="sr-only">
            {t("searchByNameOrPhone", lang)}
          </label>

          <Search
            size={17}
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/60 transition-colors duration-200 group-focus-within:text-[#F5D76E]"
          />

          <input
            id={inputId}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchByNameOrPhone", lang)}
            autoComplete="off"
            className="h-12 w-full rounded-xl border border-[#D4AF37]/30 bg-[#0a0a0a] pl-11 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/30 hover:border-[#D4AF37]/55 focus:border-[#D4AF37] focus:bg-[#0d0c08] focus:ring-4 focus:ring-[#D4AF37]/15 [color-scheme:dark]"
          />
        </div>

        {query.trim() !== "" && (
          <p className="mt-3 text-xs font-semibold text-white/45">
            {filtered.length} of {customers.length} {customers.length === 1 ? "customer" : "customers"} shown
          </p>
        )}
      </div>

      {/* Cards: phones and tablets */}
      <div className="grid gap-3 sm:grid-cols-2 xl:hidden">
        {filtered.map((customer, i) => (
          <div
            key={customer.id}
            className="ersms-fade-up ersms-gold-line group rounded-2xl border bg-[#0f0f0f] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D4AF37]/55 hover:bg-[#14130e] sm:p-5"
            style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="ersms-gold-button flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-extrabold">
                {initialOf(customer.name)}
              </div>
              <span className="min-w-0 truncate text-[15px] font-extrabold text-white">
                {customer.name}
              </span>
            </div>

            <div className="space-y-1.5 text-sm">
              <p className="flex items-center gap-2 text-white/60">
                <Phone size={14} aria-hidden="true" className="shrink-0 text-[#D4AF37]/70" />
                <span className="truncate">{customer.phone}</span>
              </p>
              {customer.email && (
                <p className="flex items-center gap-2 text-white/60">
                  <Mail size={14} aria-hidden="true" className="shrink-0 text-[#D4AF37]/70" />
                  <span className="truncate">{customer.email}</span>
                </p>
              )}
            </div>

            <div className="ersms-gold-line mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-3">
              <Link
                href={`/customers/${customer.id}`}
                className="text-sm font-bold text-[#F5D76E] hover:underline"
              >
                {t("viewProfile", lang)}
              </Link>
              <Link
                href={`/customers/${customer.id}/edit`}
                className="text-sm font-semibold text-white/55 hover:text-white hover:underline"
              >
                {t("edit", lang)}
              </Link>
              <DeleteCustomerButton id={customer.id} />
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="ersms-gold-line flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-[#0d0d0d] px-6 py-14 text-center sm:col-span-2">
            <Users size={30} aria-hidden="true" className="text-[#D4AF37]/70" />
            <p className="text-sm font-semibold text-white/60">{t("noResultsYet", lang)}</p>
          </div>
        )}
      </div>

      {/* Table: large desktop screens */}
      <div className="ersms-gold-border hidden overflow-x-auto rounded-2xl border bg-[#0d0d0d] shadow-[0_20px_60px_rgba(0,0,0,0.45)] xl:block">
        <table className="w-full text-sm">
          <thead className="ersms-gold-border border-b bg-[#D4AF37]/[0.07]">
            <tr>
              <th scope="col" className={thClass}>{t("customerName", lang)}</th>
              <th scope="col" className={thClass}>{t("phone", lang)}</th>
              <th scope="col" className={thClass}>{t("email", lang)}</th>
              <th scope="col" className={thClass}>{t("actions", lang)}</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((customer) => (
              <tr
                key={customer.id}
                className="ersms-gold-line group border-b transition-colors duration-200 last:border-0 hover:bg-[#D4AF37]/[0.06]"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="ersms-gold-button flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-extrabold">
                      {initialOf(customer.name)}
                    </div>
                    <span className="font-bold text-white">{customer.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-white/60">{customer.phone}</td>
                <td className="px-5 py-4 text-white/60">{customer.email ?? "—"}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/customers/${customer.id}`}
                      className="ersms-gold-border inline-flex items-center gap-1 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-bold text-[#F5D76E] transition-all duration-200 hover:bg-[#D4AF37]/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/30"
                    >
                      {t("viewProfile", lang)}
                      <ChevronRight
                        size={14}
                        aria-hidden="true"
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </Link>
                    <Link
                      href={`/customers/${customer.id}/edit`}
                      className="text-xs font-semibold text-white/55 hover:text-white hover:underline"
                    >
                      {t("edit", lang)}
                    </Link>
                    <DeleteCustomerButton id={customer.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <Users size={30} aria-hidden="true" className="text-[#D4AF37]/70" />
            <p className="text-sm font-semibold text-white/60">{t("noResultsYet", lang)}</p>
          </div>
        )}
      </div>
    </>
  );
}