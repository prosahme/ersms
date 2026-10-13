"use client";

import { useActionState, useState, useTransition } from "react";
import { Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { updatePaymentAction, deletePaymentAction, type UpdatePaymentState } from "./payment-actions";

const initialState: UpdatePaymentState = {};

const editFieldClass =
  "h-9 rounded-lg border border-[#D4AF37]/40 bg-[#0a0a0a] px-2.5 text-xs text-white outline-none transition-colors duration-200 focus:border-[#D4AF37] [color-scheme:dark]";

export function PaymentRowActions({
  repairId,
  paymentId,
  currentAmount,
  currentType,
  currentMethod,
}: {
  repairId: string;
  paymentId: string;
  currentAmount: number;
  currentType: "DEPOSIT" | "PARTIAL" | "FINAL";
  currentMethod: "CASH" | "TELEBIRR" | "BANK_TRANSFER";
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(updatePaymentAction, initialState);
  const [isDeleting, startDeleteTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this payment? It will no longer count toward Total Paid.")) return;
    const formData = new FormData();
    formData.append("repairId", repairId);
    formData.append("paymentId", paymentId);
    startDeleteTransition(() => {
      deletePaymentAction(formData);
    });
  }

  if (isEditing) {
    return (
      <form
        action={formAction}
        onSubmit={() => {
          // Keep the editor open on error so the message is visible;
          // closes itself once the action returns with no error.
          setTimeout(() => {
            if (!state.error) setIsEditing(false);
          }, 0);
        }}
        className="flex flex-wrap items-center gap-1.5"
      >
        <input type="hidden" name="repairId" value={repairId} />
        <input type="hidden" name="paymentId" value={paymentId} />

        <select name="paymentType" defaultValue={currentType} className={editFieldClass}>
          <option value="DEPOSIT">Deposit</option>
          <option value="PARTIAL">Partial</option>
          <option value="FINAL">Final</option>
        </select>

        <select name="paymentMethod" defaultValue={currentMethod} className={editFieldClass}>
          <option value="CASH">Cash</option>
          <option value="TELEBIRR">Telebirr</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
        </select>

        <input
          name="amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          defaultValue={currentAmount}
          required
          className={`${editFieldClass} w-24`}
        />

        <button
          type="submit"
          disabled={isPending}
          aria-label="Save payment"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-400/40 bg-emerald-500/10 text-emerald-300 transition-colors duration-200 hover:bg-emerald-500/20 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 size={14} aria-hidden="true" className="animate-spin" />
          ) : (
            <Check size={14} aria-hidden="true" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setIsEditing(false)}
          aria-label="Cancel"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] text-white/60 transition-colors duration-200 hover:text-white"
        >
          <X size={14} aria-hidden="true" />
        </button>

        {state.error && (
          <p className="w-full text-xs font-semibold text-red-300">{state.error}</p>
        )}
      </form>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        aria-label="Edit payment"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#D4AF37]/35 bg-[#D4AF37]/[0.06] text-[#F5D76E] transition-colors duration-200 hover:bg-[#D4AF37]/15"
      >
        <Pencil size={14} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        aria-label="Delete payment"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-400/35 bg-red-500/[0.06] text-red-300 transition-colors duration-200 hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isDeleting ? (
          <Loader2 size={14} aria-hidden="true" className="animate-spin" />
        ) : (
          <Trash2 size={14} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}