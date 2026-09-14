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
      {state.success && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3 space-y-2">
          <p>Restore complete! Your data has been replaced.</p>
          {state.safetyBackupUrl && (
            <p>
              A safety backup of your data from just before this restore was created automatically.{" "}
              <a href={state.safetyBackupUrl} target="_blank" rel="noopener noreferrer" className="underline font-medium">
                Download the safety backup
              </a>
              . Keep this file somewhere safe in case you need to undo this restore later.
            </p>
          )}
        </div>
      )}
    </form>
  );
}