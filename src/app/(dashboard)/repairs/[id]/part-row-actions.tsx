"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { removePartFromRepairAction, updatePartQuantityAction } from "./parts-actions";

export function PartRowActions({
  repairId,
  repairPartId,
  currentQuantity,
}: {
  repairId: string;
  repairPartId: string;
  currentQuantity: number;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState(currentQuantity);
  const [isPending, startTransition] = useTransition();

  function handleSaveEdit() {
    if (quantity < 1) return;
    const formData = new FormData();
    formData.append("repairId", repairId);
    formData.append("repairPartId", repairPartId);
    formData.append("quantityUsed", String(quantity));
    startTransition(() => {
      updatePartQuantityAction(formData);
    });
    setIsEditing(false);
  }

  function handleDelete() {
    if (!confirm("Remove this part from the repair? The quantity will be returned to stock.")) return;
    const formData = new FormData();
    formData.append("repairId", repairId);
    formData.append("repairPartId", repairPartId);
    startTransition(() => {
      removePartFromRepairAction(formData);
    });
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          aria-label="New quantity"
          className="h-8 w-16 rounded-lg border border-[#D4AF37]/40 bg-[#0a0a0a] px-2 text-center text-sm text-white outline-none transition-colors duration-200 focus:border-[#D4AF37] [color-scheme:dark]"
        />
        <button
          type="button"
          onClick={handleSaveEdit}
          disabled={isPending}
          aria-label="Save quantity"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-400/40 bg-emerald-500/10 text-emerald-300 transition-colors duration-200 hover:bg-emerald-500/20 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 size={14} aria-hidden="true" className="animate-spin" />
          ) : (
            <Check size={14} aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setQuantity(currentQuantity);
            setIsEditing(false);
          }}
          aria-label="Cancel"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] text-white/60 transition-colors duration-200 hover:text-white"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        aria-label="Edit quantity"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#D4AF37]/35 bg-[#D4AF37]/[0.06] text-[#F5D76E] transition-colors duration-200 hover:bg-[#D4AF37]/15"
      >
        <Pencil size={14} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        aria-label="Remove part"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-400/35 bg-red-500/[0.06] text-red-300 transition-colors duration-200 hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 size={14} aria-hidden="true" className="animate-spin" />
        ) : (
          <Trash2 size={14} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}