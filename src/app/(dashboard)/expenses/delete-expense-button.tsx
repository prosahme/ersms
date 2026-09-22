"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteExpenseAction } from "./actions";

export function DeleteExpenseButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this expense?")) return;
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      deleteExpenseAction(formData);
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={isPending}
        aria-label="Delete expense"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-400/35 bg-red-500/[0.06] text-red-300 transition-all duration-200 hover:border-red-400/70 hover:bg-red-600 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-400/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 size={16} aria-hidden="true" className="animate-spin" />
        ) : (
          <Trash2 size={16} aria-hidden="true" />
        )}
      </button>
    </form>
  );
}