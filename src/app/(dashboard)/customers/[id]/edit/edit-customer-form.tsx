"use client";

import { useActionState } from "react";
import { updateCustomerAction, type CustomerFormState } from "../../actions";

const initialState: CustomerFormState = {};

export function EditCustomerForm({
  customer,
}: {
  customer: { id: string; name: string; phone: string; email: string | null; address: string | null };
}) {
  const [state, formAction, isPending] = useActionState(updateCustomerAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={customer.id} />

      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          name="name"
          type="text"
          required
          defaultValue={customer.name}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Phone</label>
        <input
          name="phone"
          type="text"
          required
          defaultValue={customer.phone}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email (optional)</label>
        <input
          name="email"
          type="email"
          defaultValue={customer.email ?? ""}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Address (optional)</label>
        <input
          name="address"
          type="text"
          defaultValue={customer.address ?? ""}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}