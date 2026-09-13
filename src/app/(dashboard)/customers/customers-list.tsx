"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DeleteCustomerButton } from "./delete-button";
import { t, type Lang } from "@/lib/translations";

type Customer = { id: string; name: string; phone: string; email: string | null };

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

  return (
    <>
      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchByNameOrPhone", lang)}
          autoComplete="off"
          className="w-full max-w-sm rounded-md border border-orange-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-3 md:hidden">
        {filtered.map((customer) => (
          <div key={customer.id} className="bg-white border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-semibold flex-shrink-0">
                {customer.name.charAt(0)}
              </div>
              <span className="font-medium">{customer.name}</span>
            </div>
            <p className="text-sm text-slate-600">{customer.phone}</p>
            <p className="text-sm text-slate-600 mb-3">{customer.email ?? "—"}</p>
            <div className="flex flex-wrap gap-3 pt-2 border-t border-orange-100">
              <Link href={`/customers/${customer.id}`} className="text-orange-600 hover:underline text-sm">{t("viewProfile", lang)}</Link>
              <Link href={`/customers/${customer.id}/edit`} className="text-slate-600 hover:underline text-sm">{t("edit", lang)}</Link>
              <DeleteCustomerButton id={customer.id} />
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-orange-500 py-8">{t("noResultsYet", lang)}</p>}
      </div>

      <div className="hidden md:block bg-white border border-orange-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-orange-50 border-b border-orange-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-orange-500">{t("customerName", lang)}</th>
              <th className="text-left px-4 py-3 font-medium text-orange-500">{t("phone", lang)}</th>
              <th className="text-left px-4 py-3 font-medium text-orange-500">{t("email", lang)}</th>
              <th className="text-left px-4 py-3 font-medium text-orange-500">{t("actions", lang)}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((customer) => (
              <tr key={customer.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-semibold">
                      {customer.name.charAt(0)}
                    </div>
                    <span>{customer.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{customer.phone}</td>
                <td className="px-4 py-3 text-slate-600">{customer.email ?? "—"}</td>
                <td className="px-4 py-3 space-x-3">
                  <Link href={`/customers/${customer.id}`} className="text-orange-600 hover:underline text-sm">{t("viewProfile", lang)}</Link>
                  <Link href={`/customers/${customer.id}/edit`} className="text-slate-600 hover:underline text-sm">{t("edit", lang)}</Link>
                  <DeleteCustomerButton id={customer.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-orange-500 py-8">{t("noResultsYet", lang)}</p>}
      </div>
    </>
  );
}
