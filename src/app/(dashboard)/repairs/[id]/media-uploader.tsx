"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Check, CircleAlert, Loader2 } from "lucide-react";

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number; fileName: string }
  | { status: "success"; fileName: string }
  | { status: "error"; message: string };

export function MediaUploader({ repairId }: { repairId: string }) {
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const inputId = useId();

  const isUploading = state.status === "uploading";

  function uploadFile(file: File) {
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    // Same rule as the file picker: photos and videos only.
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setState({ status: "error", message: "Only photos and videos can be uploaded." });
      return;
    }

    uploadFile(file);
  }

  return (
    <div className="flex flex-col gap-3">
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          if (!isUploading) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`group flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-5 py-7 text-center transition-all duration-200 focus-within:ring-4 focus-within:ring-[#D4AF37]/30 sm:flex-row sm:gap-5 sm:px-6 sm:text-left ${
          isUploading
            ? "cursor-not-allowed border-[#D4AF37]/25 bg-[#0a0a0a] opacity-60"
            : isDragging
              ? "cursor-copy border-[#D4AF37] bg-[#D4AF37]/[0.10]"
              : "cursor-pointer border-[#D4AF37]/35 bg-[#0a0a0a] hover:border-[#D4AF37]/70 hover:bg-[#D4AF37]/[0.05]"
        }`}
      >
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="sr-only"
        />

        <span className="ersms-gold-border flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br from-[#D4AF37]/20 to-[#B87333]/10 transition-transform duration-200 group-hover:-translate-y-0.5">
          <Upload size={20} aria-hidden="true" className="text-[#F5D76E]" />
        </span>

        <span className="min-w-0">
          <span className="ersms-gold-bright block text-sm font-extrabold">
            {isDragging ? "Drop the file to upload" : "Add a photo or video"}
          </span>
          <span className="mt-0.5 block text-xs leading-5 text-white/50">
            Tap to choose a file, or drag and drop it here.
          </span>
        </span>
      </label>

      {state.status === "uploading" && (
        <div
          className="ersms-fade-in ersms-gold-line rounded-xl border bg-[#0a0a0a] p-4"
          role="status"
          aria-live="polite"
        >
          <div className="mb-2.5 flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 font-semibold text-white/80">
              <Loader2
                size={15}
                aria-hidden="true"
                className="shrink-0 animate-spin text-[#D4AF37]"
              />
              <span className="truncate">{state.fileName}</span>
            </span>
            <span className="shrink-0 font-extrabold text-[#F5D76E]">{state.progress}%</span>
          </div>

          <div
            role="progressbar"
            aria-label="Upload progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={state.progress}
            className="h-2 overflow-hidden rounded-full bg-white/10"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] transition-all duration-200"
              style={{ width: `${state.progress}%` }}
            />
          </div>
        </div>
      )}

      {state.status === "success" && (
        <div
          role="status"
          className="ersms-fade-in flex items-center gap-3 rounded-xl border border-emerald-400/40 bg-emerald-500/[0.08] px-4 py-3"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/20">
            <Check size={14} aria-hidden="true" className="text-emerald-300" />
          </span>
          <p className="min-w-0 break-words text-sm font-semibold text-emerald-200">
            {state.fileName} uploaded.
          </p>
        </div>
      )}

      {state.status === "error" && (
        <div
          role="alert"
          className="ersms-fade-in flex items-start gap-3 rounded-xl border border-red-400/40 bg-red-500/[0.08] px-4 py-3"
        >
          <CircleAlert
            size={18}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-red-300"
          />
          <p className="min-w-0 break-words text-sm font-semibold leading-6 text-red-200">
            {state.message}
          </p>
        </div>
      )}
    </div>
  );
}