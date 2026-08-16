"use client";

import { useActionState } from "react";
import { createPartAction, type PartFormState } from "../actions";

const initialState: PartFormState = {};

export function NewPartForm() {
  const [state, formAction, isPending] = useActionState(createPartAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Part Name</label>
        <input name="name" type="text" required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">SKU</label>
        <input name="sku" type="text" required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <input name="category" type="text" required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Quantity Available</label>
          <input name="quantityAvailable" type="number" required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Low Stock Threshold</label>
          <input name="lowStockThreshold" type="number" defaultValue={5} required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Unit Cost</label>
          <input name="unitCost" type="number" step="0.01" required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Unit Price</label>
          <input name="unitPrice" type="number" step="0.01" required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button type="submit" disabled={isPending} className="rounded-md bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:bg-orange-700 disabled:opacity-50">
        {isPending ? "Saving..." : "Add Part"}
      </button>
    </form>
  );
}
