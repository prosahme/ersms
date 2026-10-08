"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteRepairAction } from "./details-actions";

export function DeleteRepairButton({
  repairId,
  ticketNumber,
}: {
  repairId: string;
  ticketNumber: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (
      !confirm(
        `Delete repair ticket ${ticketNumber}? This will remove it from the repairs list. This cannot be undone from here.`
      )
    ) {
      return;
    }
    const formData = new FormData();
    formData.append("repairId", repairId);
    startTransition(() => {
      deleteRepairAction(formData);
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-red-400/35 bg-red-500/[0.06] px-3.5 text-sm font-bold text-red-300 transition-all duration-200 hover:border-red-400/70 hover:bg-red-600 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-400/40 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? (
        <Loader2 size={15} aria-hidden="true" className="animate-spin" />
      ) : (
        <Trash2 size={15} aria-hidden="true" />
      )}
      Delete Ticket
    </button>
  );
}