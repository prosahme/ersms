"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  Search,
  User,
  Phone,
  Mail,
  MapPin,
  UserPlus,
  Users,
  Check,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type CustomerOption = { id: string; name: string; phone: string };

const controlBase =
  "block w-full rounded-xl border border-[#D4AF37]/35 bg-[#0a0a0a] pl-11 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/30 hover:border-[#D4AF37]/60 focus:border-[#D4AF37] focus:bg-[#0d0c08] focus:ring-4 focus:ring-[#D4AF37]/15 [color-scheme:dark]";

const inputClass = `${controlBase} h-12`;

function Field({
  id,
  label,
  icon: Icon,
  optional = false,
  required = false,
  className = "",
  children,
}: {
  id: string;
  label: string;
  icon: LucideIcon;
  optional?: boolean;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <label
        htmlFor={id}
        className="mb-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#F5D76E]"
      >
        {label}

        {required && (
          <span aria-hidden="true" className="text-[#D4AF37]">
            *
          </span>
        )}

        {optional && (
          <span className="rounded-full border border-white/15 px-2 py-px text-[10px] font-medium normal-case tracking-normal text-white/50">
            Optional
          </span>
        )}
      </label>

      <div className="group relative">
        {children}

        <Icon
          aria-hidden="true"
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/65 transition-colors duration-200 group-focus-within:text-[#F5D76E]"
        />
      </div>
    </div>
  );
}

function initialOf(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

/**
 * Lets staff either search-select an existing customer (incremental,
 * filters as they type — by name or phone digits) or switch to
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
  const uid = useId();
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CustomerOption | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const qDigits = q.replace(/\D/g, "");
    return customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (qDigits !== "" && c.phone.replace(/\D/g, "").startsWith(qDigits))
      )
      .slice(0, 8);
  }, [query, customers]);

  // Keep the keyboard-highlighted result visible inside the list.
  useEffect(() => {
    if (results.length === 0) return;
    document
      .getElementById(`${uid}-opt-${activeIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, results.length, uid]);

  function switchMode(next: "existing" | "new") {
    if (next === mode) return;
    setMode(next);
    setSelected(null);
    setQuery("");
    setActiveIndex(0);
  }

  function choose(customer: CustomerOption) {
    setSelected(customer);
    setQuery("");
    setActiveIndex(0);
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && results.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp" && results.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && results.length > 0) {
      // Pick the highlighted customer instead of submitting the whole form.
      event.preventDefault();
      choose(results[Math.min(activeIndex, results.length - 1)]);
    } else if (event.key === "Escape" && query !== "") {
      event.preventDefault();
      setQuery("");
    }
  }

  const showResults = query.trim() !== "";

  return (
    <div>
      {/* Mode switch */}
      <div
        role="group"
        aria-label="Customer type"
        className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-[#D4AF37]/25 bg-[#0a0a0a] p-1"
      >
        <button
          type="button"
          onClick={() => switchMode("existing")}
          aria-pressed={mode === "existing"}
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/40 ${
            mode === "existing"
              ? "ersms-gold-button"
              : "text-white/60 hover:bg-[#D4AF37]/10 hover:text-[#F5D76E]"
          }`}
        >
          <Users size={16} aria-hidden="true" />
          <span className="truncate">Existing customer</span>
        </button>

        <button
          type="button"
          onClick={() => switchMode("new")}
          aria-pressed={mode === "new"}
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/40 ${
            mode === "new"
              ? "ersms-gold-button"
              : "text-white/60 hover:bg-[#D4AF37]/10 hover:text-[#F5D76E]"
          }`}
        >
          <UserPlus size={16} aria-hidden="true" />
          <span className="truncate">New customer</span>
        </button>
      </div>

      <input type="hidden" name="customerMode" value={mode} />

      {mode === "existing" ? (
        <>
          {selected ? (
            <div className="ersms-fade-in">
              <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#F5D76E]">
                Selected customer
              </p>

              <div className="ersms-gold-border flex items-center gap-3 rounded-xl border bg-[#D4AF37]/[0.07] p-3 sm:gap-4 sm:p-4">
                <div className="ersms-gold-button flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-extrabold">
                  {initialOf(selected.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-[15px] font-extrabold text-white">
                    <span className="truncate">{selected.name}</span>
                    <Check
                      size={15}
                      aria-hidden="true"
                      className="shrink-0 text-[#D4AF37]"
                    />
                  </p>
                  <p className="mt-0.5 truncate text-sm text-white/60">
                    {selected.phone}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="ersms-gold-border shrink-0 rounded-lg border px-3.5 py-2 text-xs font-bold text-[#F5D76E] transition-all duration-200 hover:bg-[#D4AF37]/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/30"
                >
                  Change
                </button>
              </div>
            </div>
          ) : (
            <div>
              <Field
                id={`${uid}-search`}
                label="Search customer"
                icon={Search}
                required
              >
                <input
                  id={`${uid}-search`}
                  type="text"
                  role="combobox"
                  aria-expanded={showResults}
                  aria-controls={`${uid}-list`}
                  aria-autocomplete="list"
                  aria-activedescendant={
                    showResults && results.length > 0
                      ? `${uid}-opt-${activeIndex}`
                      : undefined
                  }
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search by name or phone..."
                  autoComplete="off"
                  className={inputClass}
                />
              </Field>

              {!showResults && (
                <p className="mt-3 text-xs leading-5 text-white/45">
                  Start typing a name or phone number. Can&apos;t find them?
                  Switch to{" "}
                  <span className="font-semibold text-[#F5D76E]">
                    New customer
                  </span>{" "}
                  above.
                </p>
              )}

              {showResults && (
                <div
                  id={`${uid}-list`}
                  role="listbox"
                  aria-label="Matching customers"
                  className="ersms-fade-in ersms-gold-line mt-3 max-h-64 overflow-y-auto rounded-xl border bg-[#0a0a0a]"
                >
                  {results.length > 0 ? (
                    results.map((customer, index) => {
                      const isActive = index === activeIndex;
                      return (
                        <div
                          key={customer.id}
                          id={`${uid}-opt-${index}`}
                          role="option"
                          aria-selected={isActive}
                          onClick={() => choose(customer)}
                          onMouseEnter={() => setActiveIndex(index)}
                          className={`ersms-gold-line flex cursor-pointer items-center gap-3 border-b px-4 py-3 transition-colors duration-150 last:border-0 ${
                            isActive
                              ? "bg-[#D4AF37]/[0.12] shadow-[inset_3px_0_0_#D4AF37]"
                              : "hover:bg-[#D4AF37]/[0.06]"
                          }`}
                        >
                          <div className="ersms-gold-border flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-[#D4AF37]/10 text-sm font-extrabold text-[#F5D76E]">
                            {initialOf(customer.name)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-white">
                              {customer.name}
                            </p>
                            <p className="truncate text-xs text-white/55">
                              {customer.phone}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <p className="text-sm font-semibold text-white/70">
                        No matching customers.
                      </p>
                      <p className="mt-1 text-xs text-white/45">
                        Try a different spelling, or add them as a new customer.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <input type="hidden" name="customerId" value={selected?.id ?? ""} />
        </>
      ) : (
        <div className="ersms-fade-in ersms-gold-line rounded-xl border bg-[#0a0a0a] p-4 sm:p-5">
          <p className="mb-5 text-xs leading-5 text-white/50">
            This customer will be created together with the repair ticket.
          </p>

          <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2">
            <Field
              id={`${uid}-new-name`}
              label="Full name"
              icon={User}
              required
            >
              <input
                id={`${uid}-new-name`}
                name="newCustomerName"
                type="text"
                required={mode === "new"}
                autoComplete="off"
                placeholder="Customer's full name"
                className={inputClass}
              />
            </Field>

            <Field
              id={`${uid}-new-phone`}
              label="Phone number"
              icon={Phone}
              required
            >
              <input
                id={`${uid}-new-phone`}
                name="newCustomerPhone"
                type="text"
                inputMode="tel"
                required={mode === "new"}
                autoComplete="off"
                placeholder="09XXXXXXXX"
                className={inputClass}
              />
            </Field>

            <Field
              id={`${uid}-new-email`}
              label="Email address"
              icon={Mail}
              optional
            >
              <input
                id={`${uid}-new-email`}
                name="newCustomerEmail"
                type="email"
                autoComplete="off"
                placeholder="customer@example.com"
                className={inputClass}
              />
            </Field>

            <Field
              id={`${uid}-new-address`}
              label="Address"
              icon={MapPin}
              optional
            >
              <input
                id={`${uid}-new-address`}
                name="newCustomerAddress"
                type="text"
                autoComplete="off"
                placeholder="Customer address"
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}