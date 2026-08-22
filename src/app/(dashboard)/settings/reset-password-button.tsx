"use client";

import { useActionState } from "react";
import { resetPasswordAction, type ResetPasswordState } from "./actions";

const initialState: ResetPasswordState = {};

export function ResetPasswordButton({ userId }: { userId: string }) {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, initialState);

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="id" value={userId} />
        <button type="submit" disabled={isPending} className="text-slate-600 hover:underline text-sm">
          {isPending ? "Resetting..." : "Reset Password"}
        </button>
      </form>
      {state.tempPassword && (
        <div className="mt-2 bg-green-50 border border-green-200 rounded-md p-2 text-xs">
          <p className="text-green-800 font-medium">New password for {state.email}:</p>
          <p className="font-mono font-bold text-green-700">{state.tempPassword}</p>
        </div>
      )}
    </div>
  );
}