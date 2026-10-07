"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil, Loader2, Save, X } from "lucide-react";
import { updateEstimatedCostAction, type EstimatedCostFormState } from "./details-actions";
import { formatCurrency } from "@/lib/format-currency";

const initialState: EstimatedCostFormState = {};

export function EstimatedCostEditor({
  repairId,
  estimatedCost,
}: {
  repairId: string;
  estimatedCost: number;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [state, formAction, isPending] = useActionState(updateEstimatedCostAction, initialState);

  // Closes the editor automatically once a save succeeds (no error, no
  // longer pending), but stays open on failure so the message is visible.
  useEffect(() => {
    if (hasSubmitted && !isPending && !state.error) {
      setIsEditing(false);
      setHasSubmitted(false);
    }
  }, [hasSubmitted, isPending, state]);

  if (!isEditing) {
    return (
      <div className="ersms-gold-line rounded-xl border bg-[#0a0a0a] p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/50">
            Repair Price
          </p>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            aria-label="Edit estimated cost"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#D4AF37]/35 bg-[#D4AF37]/[0.06] text-[#F5D76E] transition-colors duration-200 hover:bg-[#D4AF37]/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/30"
          >
            <Pencil size={13} aria-hidden="true" />
          </button>
        </div>
        <p className="mt-1.5 text-xl font-extrabold text-white">{formatCurrency(estimatedCost)}</p>
      </div>
    );
  }

  return (
    <div className="ersms-gold-border rounded-xl border bg-[#0a0a0a] p-4">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#F5D76E]">
        Edit Repair Price
      </p>
      <form action={formAction} onSubmit={() => setHasSubmitted(true)} className="flex items-center gap-2">
        <input type="hidden" name="repairId" value={repairId} />
        <input
          name="estimatedCost"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          defaultValue={estimatedCost}
          required
          className="h-10 w-full min-w-0 rounded-lg border border-[#D4AF37]/40 bg-[#0d0c08] px-3 text-sm text-white outline-none transition-colors duration-200 focus:border-[#D4AF37] [color-scheme:dark]"
        />
        <button
          type="submit"
          disabled={isPending}
          aria-label="Save"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-400/40 bg-emerald-500/10 text-emerald-300 transition-colors duration-200 hover:bg-emerald-500/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 size={15} aria-hidden="true" className="animate-spin" />
          ) : (
            <Save size={15} aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          aria-label="Cancel"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] text-white/60 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
        >
          <X size={15} aria-hidden="true" />
        </button>
      </form>
      {state.error && <p className="mt-2 text-xs font-semibold text-red-300">{state.error}</p>}
    </div>
  );
}