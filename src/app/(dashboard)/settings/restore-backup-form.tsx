"use client";

import { useActionState, useRef, useState } from "react";
import {
  UploadCloud,
  RotateCcw,
  Loader2,
  CircleAlert,
  CircleCheck,
  FileJson,
} from "lucide-react";
import {
  restoreBackupAction,
  type RestoreState,
} from "./backup-actions";

const initialState: RestoreState = {};

const CONFIRM_MESSAGE =
  "This will permanently replace ALL current customers, repairs, inventory, and payments with the data in this backup file. This cannot be undone. Continue?";

const SAFETY_NOTE =
  "A safety backup of your data from just before this restore was created automatically. Keep this file somewhere safe in case you need to undo this restore later.";

export function RestoreBackupForm() {
  const [state, formAction, isPending] = useActionState(
    restoreBackupAction,
    initialState
  );

  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const chosen = event.target.files?.[0];
    setFileName(chosen ? chosen.name : null);
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    if (!confirm(CONFIRM_MESSAGE)) {
      event.preventDefault();
    }
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <label
        htmlFor="restore-file"
        className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-red-400/35 bg-[#0a0a0a] px-5 py-6 text-center transition-all duration-200 hover:border-red-400/60 hover:bg-red-500/[0.05] focus-within:ring-4 focus-within:ring-red-400/30 sm:text-left"
      >
        <input
          ref={inputRef}
          id="restore-file"
          type="file"
          name="file"
          accept="application/json"
          required
          onChange={handleFileChange}
          className="sr-only"
        />

        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-400/40 bg-red-500/15">
          {fileName ? (
            <FileJson
              size={20}
              aria-hidden="true"
              className="text-red-300"
            />
          ) : (
            <UploadCloud
              size={20}
              aria-hidden="true"
              className="text-red-300"
            />
          )}
        </span>

        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-red-200">
            {fileName || "Choose a backup file (.json)"}
          </span>

          <span className="mt-0.5 block text-xs text-red-200/60">
            Tap to browse your device
          </span>
        </span>
      </label>

      <button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-extrabold text-white transition-all duration-200 hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-400/40 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isPending ? (
          <>
            <Loader2
              size={17}
              aria-hidden="true"
              className="animate-spin"
            />
            Restoring...
          </>
        ) : (
          <>
            <RotateCcw
              size={17}
              aria-hidden="true"
            />
            Restore from Backup
          </>
        )}
      </button>

      {state.error ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-400/40 bg-red-500/10 p-4"
        >
          <CircleAlert
            size={18}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-red-300"
          />

          <p className="text-sm font-semibold text-red-200">
            {state.error}
          </p>
        </div>
      ) : null}
      {state.success ? (
        <div className="ersms-fade-in space-y-2 rounded-xl border border-emerald-400/40 bg-emerald-500/[0.08] p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-emerald-200">
            <CircleCheck
              size={17}
              aria-hidden="true"
            />
            Restore complete. Your data has been replaced.
          </p>

          {state.safetyBackupUrl ? (
            <div className="text-sm leading-6 text-emerald-100/85">
              <p>{SAFETY_NOTE}</p>

              <a
                href={state.safetyBackupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block font-bold text-[#F5D76E] underline"
              >
                Download the safety backup
              </a>
            </div>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}