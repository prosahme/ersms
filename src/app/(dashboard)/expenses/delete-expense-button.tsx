"use client";

import { deleteExpenseAction } from "./actions";

export function DeleteExpenseButton({ id }: { id: string }) {
  return (
    <form
      action={deleteExpenseAction}
      className="inline"
      onSubmit={(e) => {
        if (!confirm("Are you sure you want to delete this expense?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-red-600 hover:underline text-sm">
        Delete
      </button>
    </form>
  );
}
