"use client";

import { deleteCustomerAction } from "./actions";

export function DeleteCustomerButton({ id }: { id: string }) {
  return (
    <form
      action={deleteCustomerAction}
      className="inline"
      onSubmit={(e) => {
        if (!confirm("Are you sure you want to delete this customer?")) {
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
