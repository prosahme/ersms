"use client";

import { useActionState, useEffect, useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteUserAction, type DeleteUserState } from "./actions";

const initialState: DeleteUserState = {};

export function DeleteUserButton({ userId, fullName }: { userId: string; fullName: string }) {
  const [state, formAction, isPending] = useActionState(deleteUserAction, initialState);
  const [confirmed, setConfirmed] = useState(false);

  // Resets the "are you sure" step if the server came back with an error,
  // so the person sees the error message rather than a silently reset button.
  useEffect(() => {
    if (state.error) setConfirmed(false);
  }, [state.error]);

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (!confirmed) {
      e.preventDefault();
      setConfirmed(true);
      return;
    }
  }

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="id" value={userId} />
        <button
          type="submit"
          onClick={handleClick}
          disabled={isPending}
          className={`inline-flex items-center gap-1.5 text-sm font-bold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
            confirmed ? "text-red-300 hover:text-red-200" : "text-white/60 hover:text-red-300"
          }`}
        >
          {isPending ? (
            <Loader2 size={14} aria-hidden="true" className="animate-spin" />
          ) : (
            <Trash2 size={14} aria-hidden="true" />
          )}
          {isPending ? "Deleting..." : confirmed ? `Confirm delete ${fullName}?` : "Delete"}
        </button>
      </form>
      {state.error && (
        <p className="mt-1.5 max-w-xs text-xs font-semibold text-red-300">{state.error}</p>
      )}
    </div>
  );
}