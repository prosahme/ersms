"use client";

import { useActionState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { resetPasswordAction, type ResetPasswordState } from "./actions";

const initialState: ResetPasswordState = {};

export function ResetPasswordButton({ userId }: { userId: string }) {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, initialState);

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="id" value={userId} />
        <button
          type="submit"
          disabled={isPending}
          aria-busy={isPending}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-white/60 transition-colors duration-200 hover:text-[#F5D76E] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 size={14} aria-hidden="true" className="animate-spin" />
          ) : (
            <KeyRound size={14} aria-hidden="true" />
          )}
          {isPending ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      {state.tempPassword && (
        <div className="ersms-fade-in mt-2 rounded-xl border border-emerald-400/40 bg-emerald-500/[0.08] p-3 text-xs">
          <p className="font-bold text-emerald-200">New password for {state.email}:</p>
          <p className="mt-1 rounded bg-black/30 px-1.5 py-0.5 font-mono font-bold text-[#F5D76E]">
            {state.tempPassword}
          </p>
        </div>
      )}
    </div>
  );
}