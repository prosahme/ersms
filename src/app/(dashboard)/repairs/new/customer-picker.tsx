"use client";

import { useMemo, useState } from "react";

type CustomerOption = { id: string; name: string; phone: string };

/**
 * Lets staff either search-select an existing customer (incremental,
 * filters as they type — by name prefix or phone digits) or switch to
 * entering a brand-new customer inline, all within the same repair form.
 * Filtering happens client-side over the already-fetched customer list
 * (no extra network round-trip), so results update on every keystroke.
 *
 * Emits hidden form fields that createRepairAction reads:
 *   - customerMode: "existing" | "new"
 *   - customerId (when existing)
 *   - newCustomerName / newCustomerPhone / newCustomerEmail / newCustomerAddress (when new)
 */
export function CustomerPicker({ customers }: { customers: CustomerOption[] }) {
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CustomerOption | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return customers
      .filter((c) => c.name.toLowerCase().includes(q) || c.phone.replace(/\D/g, "").startsWith(q.replace(/\D/g, "")))
      .slice(0, 8);
  }, [query, customers]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium">Customer</label>
        <button
          type="button"
          onClick={() => {
            setMode(mode === "existing" ? "new" : "existing");
            setSelected(null);
            setQuery("");
          }}
          className="text-sm font-medium text-orange-600 hover:underline"
        >
          {mode === "existing" ? "+ Add New Customer" : "‹ Back to Search"}
        </button>
      </div>

      <input type="hidden" name="customerMode" value={mode} />

      {mode === "existing" ? (
        <>
          {selected ? (
            <div className="flex items-center justify-between rounded-md border border-orange-300 bg-orange-50 px-3 py-2 text-sm">
              <span>
                <span className="font-medium">{selected.name}</span> — {selected.phone}
              </span>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-orange-600 hover:underline text-xs font-medium"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or phone..."
                autoComplete="off"
                className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm"
              />
              {query.trim() !== "" && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-orange-200 bg-white shadow-lg max-h-56 overflow-y-auto">
                  {results.length > 0 ? (
                    results.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelected(c);
                          setQuery("");
                        }}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-orange-50 border-b border-orange-50 last:border-0"
                      >
                        <span className="font-medium">{c.name}</span> — {c.phone}
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-slate-500">No matching customers.</p>
                  )}
                </div>
              )}
            </div>
          )}
          <input type="hidden" name="customerId" value={selected?.id ?? ""} />
        </>
      ) : (
        <div className="space-y-3 rounded-md border border-orange-200 bg-orange-50 p-3">
          <div>
            <label className="block text-xs font-medium mb-1">Name</label>
            <input name="newCustomerName" type="text" required={mode === "new"} className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Phone</label>
            <input name="newCustomerPhone" type="text" required={mode === "new"} className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Email (optional)</label>
            <input name="newCustomerEmail" type="email" className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Address (optional)</label>
            <input name="newCustomerAddress" type="text" className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
          </div>
        </div>
      )}
    </div>
  );
}
