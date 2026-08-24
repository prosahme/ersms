"use client";

import { useActionState } from "react";
import { restoreBackupAction, type RestoreState } from "./backup-actions";

const initialState: RestoreState = {};

export function RestoreBackupForm() {
  const [state, formAction, isPending] = useActionState(restoreBackupAction, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm("This will permanently replace ALL current customers, repairs, inventory, and payments with the data in this backup file. This cannot be undone. Continue?")) {
          e.preventDefault();
        }
      }}
      className="space-y-3"
    >
      <input type="file" name="file" accept="application/json" required />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50"
      >
        {isPending ? "Restoring..." : "Restore from Backup"}
      </button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600">Restore complete! Your data has been replaced.</p>}
    </form>
  );
}