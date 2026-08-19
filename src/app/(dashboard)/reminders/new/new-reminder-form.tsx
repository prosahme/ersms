"use client";

import { useActionState } from "react";
import { createReminderAction, type ReminderFormState } from "../actions";

const initialState: ReminderFormState = {};

export function NewReminderForm() {
  const [state, formAction, isPending] = useActionState(createReminderAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input name="title" type="text" required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select name="category" required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm">
          <option value="SALARY">Salary</option>
          <option value="RENT">Rent</option>
          <option value="EKUB">Ekub</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Amount (optional)</label>
        <input name="amount" type="number" step="0.01" className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Due Date</label>
        <input name="dueDate" type="date" required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Repeats every (days, optional)</label>
        <input name="recurrenceDays" type="number" placeholder="e.g. 30 for monthly, 180 for every 6 months" className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Notes (optional)</label>
        <input name="notes" type="text" className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button type="submit" disabled={isPending} className="rounded-md bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:bg-orange-700 disabled:opacity-50">
        {isPending ? "Saving..." : "Add Reminder"}
      </button>
    </form>
  );
}