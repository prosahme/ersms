"use client";

import { useActionState } from "react";
import { createUserAction, type UserFormState } from "./actions";

const initialState: UserFormState = {};

export function NewUserForm() {
  const [state, formAction, isPending] = useActionState(createUserAction, initialState);

  return (
    <div>
      <form action={formAction} className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium mb-1">Full Name</label>
          <input name="fullName" type="text" required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium mb-1">Email</label>
          <input name="email" type="email" required className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Role</label>
          <select name="role" required className="rounded-md border border-orange-300 px-3 py-2 text-sm">
            <option value="TECHNICIAN">Technician</option>
            <option value="ADMINISTRATOR">Administrator</option>
          </select>
        </div>
        <button type="submit" disabled={isPending} className="rounded-md bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:bg-orange-700 disabled:opacity-50">
          {isPending ? "Creating..." : "Add User"}
        </button>
      </form>

      {state.error && <p className="text-sm text-red-600 mt-2">{state.error}</p>}
      {state.tempPassword && (
        <div className="mt-3 bg-green-50 border border-green-200 rounded-md p-3 text-sm">
          <p className="font-medium text-green-800">User created!</p>
          <p className="text-green-700">Email: {state.createdEmail}</p>
          <p className="text-green-700">Temporary password: <span className="font-mono font-bold">{state.tempPassword}</span></p>
          <p className="text-xs text-green-600 mt-1">Save this now — it won't be shown again.</p>
        </div>
      )}
    </div>
  );
}