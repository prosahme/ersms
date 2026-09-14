"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number; fileName: string }
  | { status: "success"; fileName: string }
  | { status: "error"; message: string };

export function MediaUploader({ repairId }: { repairId: string }) {
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setState({ status: "uploading", progress: 0, fileName: file.name });

    const formData = new FormData();
    formData.append("repairId", repairId);
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/media/upload");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setState({ status: "uploading", progress, fileName: file.name });
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setState({ status: "success", fileName: file.name });
        // Refresh the server-rendered ticket data so the new attachment
        // shows up without a full page reload.
        router.refresh();
        setTimeout(() => setState({ status: "idle" }), 2000);
      } else {
        let message = "Upload failed. Please try again.";
        try {
          const parsed = JSON.parse(xhr.responseText);
          if (parsed?.error) message = parsed.error;
        } catch {
          // keep default message
        }
        setState({ status: "error", message });
      }
      if (inputRef.current) inputRef.current.value = "";
    };

    xhr.onerror = () => {
      setState({ status: "error", message: "Network error during upload. Please check your connection and try again." });
      if (inputRef.current) inputRef.current.value = "";
    };

    xhr.send(formData);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          disabled={state.status === "uploading"}
          className="text-sm"
        />
      </div>

      {state.status === "uploading" && (
        <div className="max-w-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="truncate">{state.fileName}</span>
            <span>{state.progress}%</span>
          </div>
          <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
            <div className="h-full bg-orange-600 rounded-full transition-all" style={{ width: `${state.progress}%` }} />
          </div>
        </div>
      )}

      {state.status === "success" && (
        <p className="text-sm text-green-600">✓ {state.fileName} uploaded.</p>
      )}

      {state.status === "error" && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}
    </div>
  );
}
