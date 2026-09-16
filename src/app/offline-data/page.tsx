"use client";

import { useEffect, useMemo, useState } from "react";
import { readSnapshot, type OfflineSnapshot } from "@/lib/offline-cache";

type Tab = "customers" | "repairs" | "inventory";

// Day 7a: read-only offline browsing. Renders entirely from the locally
// cached snapshot, so it works with no network. It shows only what the
// server already authorized for this user (private repairs and financial
// fields are filtered server-side before caching — see the snapshot API).
export default function OfflineDataPage() {
  const [snapshot, setSnapshot] = useState<OfflineSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("customers");
  const [query, setQuery] = useState("");

  useEffect(() => {
    readSnapshot().then((s) => {
      setSnapshot(s);
      setLoading(false);
    });
  }, []);

  const q = query.trim().toLowerCase();
  const qDigits = q.replace(/\D/g, "");

  const customers = useMemo(() => {
    if (!snapshot) return [];
    if (!q) return snapshot.customers;
    return snapshot.customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (qDigits !== "" && c.phone.replace(/\D/g, "").includes(qDigits))
    );
  }, [snapshot, q, qDigits]);

  const repairs = useMemo(() => {
    if (!snapshot) return [];
    if (!q) return snapshot.repairs;
    return snapshot.repairs.filter(
      (r) =>
        r.ticketNumber.toLowerCase().includes(q) ||
        r.customer.name.toLowerCase().includes(q) ||
        `${r.deviceBrand} ${r.deviceModel}`.toLowerCase().includes(q)
    );
  }, [snapshot, q]);

  const inventory = useMemo(() => {
    if (!snapshot) return [];
    if (!q) return snapshot.inventory;
    return snapshot.inventory.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [snapshot, q]);

  if (loading) {
    return <div className="p-4 md:p-8 text-sm text-slate-500">Loading saved data…</div>;
  }

  if (!snapshot) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="text-2xl font-semibold mb-2">Offline Data</h1>
        <p className="text-sm text-slate-600">
          No data has been saved to this device yet. Connect to the internet and open the app once — it will
          save a copy automatically for offline use.
        </p>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "customers", label: "Customers", count: snapshot.customers.length },
    { key: "repairs", label: "Repairs", count: snapshot.repairs.length },
    { key: "inventory", label: "Inventory", count: snapshot.inventory.length },
  ];

  return (
    <div className="p-4 md:p-8 min-h-screen bg-orange-50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
        <h1 className="text-2xl font-semibold">Offline Data</h1>
        <a href="/dashboard" className="text-sm text-orange-600 hover:underline">
          Back to app
        </a>
      </div>
      <p className="text-sm text-orange-500 mb-4">
        Saved copy from {new Date(snapshot.snapshotAt).toLocaleString()} — view and search only. Creating or
        editing records requires an internet connection.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map((tItem) => (
          <button
            key={tItem.key}
            type="button"
            onClick={() => setTab(tItem.key)}
            className={`px-3 py-1.5 rounded-md text-sm ${tab === tItem.key ? "bg-orange-600 text-white" : "bg-white border border-orange-300"}`}
          >
            {tItem.label} ({tItem.count})
          </button>
        ))}
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search saved data…"
        autoComplete="off"
        className="w-full max-w-sm rounded-md border border-orange-300 px-3 py-2 text-sm mb-4"
      />

      {tab === "customers" && (
        <div className="space-y-2">
          {customers.map((c) => (
            <div key={c.id} className="bg-white border border-orange-200 rounded-lg p-3">
              <p className="font-medium">{c.name}</p>
              <p className="text-sm text-slate-600">{c.phone}</p>
              {c.email && <p className="text-sm text-slate-500">{c.email}</p>}
            </div>
          ))}
          {customers.length === 0 && <p className="text-center text-slate-500 py-8">No matching customers.</p>}
        </div>
      )}

      {tab === "repairs" && (
        <div className="space-y-2">
          {repairs.map((r) => (
            <div key={r.id} className="bg-white border border-orange-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{r.ticketNumber}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {r.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-sm text-slate-600">{r.customer.name} — {r.customer.phone}</p>
              <p className="text-sm text-slate-500">
                {r.deviceType.replace(/_/g, " ")} · {r.deviceBrand} {r.deviceModel}
              </p>
              <p className="text-sm text-slate-500 mt-1">{r.reportedProblem}</p>
              <p className="text-xs text-slate-400 mt-1">
                Received {new Date(r.dateReceived).toLocaleDateString()}
              </p>
            </div>
          ))}
          {repairs.length === 0 && <p className="text-center text-slate-500 py-8">No matching repairs.</p>}
        </div>
      )}

      {tab === "inventory" && (
        <div className="space-y-2">
          {inventory.map((p) => {
            const low = p.quantityAvailable <= p.lowStockThreshold;
            return (
              <div
                key={p.id}
                className={`bg-white border border-orange-200 rounded-lg p-3 ${low ? "border-l-4 border-l-red-500" : ""}`}
              >
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-slate-600">
                  {p.sku} · {p.category} · {p.quantityAvailable} units
                </p>
              </div>
            );
          })}
          {inventory.length === 0 && <p className="text-center text-slate-500 py-8">No matching items.</p>}
        </div>
      )}
    </div>
  );
}
