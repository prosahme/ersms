"use client";
import { useActionState} from "react";
import { createCustomerAction, type CustomerFormState } from "../actions";
const initialState: CustomerFormState = {};
export default function NewCustomerPage(){
const [state, formAction , isPending] = useActionState(createCustomerAction, initialState);
return(
    <div className="p-8 max-w-md">
        <h1 className="text-2xl font-semibold mb-6">New Customer</h1>
        <form action = {formAction} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
            name="name"
            type="text"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
            </div>

            <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            name="phone"
            type="text"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email (optional)</label>
          <input
            name="email"
            type="email"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address (optional)</label>
          <input
            name="address"
            type="text"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Customer"}
        </button>
        </form>
    </div>
)
}