"use client";

import { useActionState } from "react";
import { updatePartAction, type PartFormState } from "../../actions";

const initialState: PartFormState = {};

export function EditPartForm({
  part,
}: {
  part: {
    id: string;
    name: string;
    sku: string;
    category: string;
    quantityAvailable: number;
    lowStockThreshold: number;
    unitCost: number;
    unitPrice: number;
  };
}) {
  const [state, formAction, isPending] = useActionState(updatePartAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={part.id} />

      <div>
        <label className="block text-sm font-medium mb-1">Part Name</label>
        <input name="name" type="text" defaultValue={part.name} required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">SKU</label>
        <input name="sku" type="text" defaultValue={part.sku} required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <input name="category" type="text" defaultValue={part.category} required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Quantity Available</label>
          <input name="quantityAvailable" type="number" defaultValue={part.quantityAvailable} required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Low Stock Threshold</label>
          <input name="lowStockThreshold" type="number" defaultValue={part.lowStockThreshold} required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Unit Cost</label>
          <input name="unitCost" type="number" step="0.01" defaultValue={part.unitCost} required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Unit Price</label>
          <input name="unitPrice" type="number" step="0.01" defaultValue={part.unitPrice} required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button type="submit" disabled={isPending} className="rounded-md bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:bg-orange-700 disabled:opacity-50">
        {isPending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
