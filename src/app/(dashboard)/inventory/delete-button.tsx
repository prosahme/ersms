"use client";

import { deletePartAction } from "./actions";

export function DeletePartButton({ id }: { id: string }) {
  return (
    <form
      action={deletePartAction}
      className="inline"
      onSubmit={(e) => {
        if (!confirm("Are you sure you want to delete this part?")) {
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
