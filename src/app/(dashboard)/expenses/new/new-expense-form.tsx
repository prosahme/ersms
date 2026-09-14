"use client";

import { useActionState } from "react";
import { createExpenseAction, type ExpenseFormState } from "../actions";
import { EXPENSE_CATEGORIES } from "@/lib/expense-categories";

const categoryLabels: Record<string, string> = {
  TEA_COFFEE: "Tea & Coffee",
  FOOD: "Food",
  TRANSPORT: "Transport",
  UTILITIES: "Utilities",
  USED_DEVICE_PURCHASE: "Used Device Purchase (for parts)",
  PARTS_PURCHASE: "Parts Purchase",
  OTHER: "Other",
};

const initialState: ExpenseFormState = {};
const today = new Date().toISOString().split("T")[0];

export function NewExpenseForm() {
  const [state, formAction, isPending] = useActionState(createExpenseAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select name="category" required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm">
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{categoryLabels[c]}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <input
          name="description"
          type="text"
          required
          placeholder="e.g. Tea and coffee for the shop, or 'Old Samsung TV, for parts'"
          className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Amount</label>
          <input name="amount" type="number" step="0.01" required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input name="date" type="date" required defaultValue={today} className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button type="submit" disabled={isPending} className="rounded-md bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:bg-orange-700 disabled:opacity-50">
        {isPending ? "Saving..." : "Save Expense"}
      </button>
    </form>
  );
}
