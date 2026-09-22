"use client";

import { useTransition } from "react";
import { X, Loader2, Video } from "lucide-react";
import { deleteMediaAction } from "./media-actions";

type MediaItem = { id: string; fileUrl: string; fileType: string };

export function MediaGridItem({
  media,
  repairId,
  canDelete,
}: {
  media: MediaItem;
  repairId: string;
  canDelete: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this file? This cannot be undone.")) return;
    const formData = new FormData();
    formData.append("repairId", repairId);
    formData.append("mediaId", media.id);
    startTransition(() => {
      deleteMediaAction(formData);
    });
  }

  const isImage = media.fileType === "IMAGE";

  return (
    <div
      className={`ersms-fade-in ersms-gold-line group relative overflow-hidden rounded-xl border bg-[#0a0a0a] transition-all duration-200 hover:border-[#D4AF37]/70 hover:shadow-[0_10px_30px_rgba(212,175,55,0.10)] ${
        isPending ? "opacity-50" : ""
      }`}
    >
      {isImage ? (
        <img
          src={media.fileUrl}
          alt="Repair documentation"
          loading="lazy"
          className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <>
          <video
            src={media.fileUrl}
            controls
            preload="metadata"
            className="aspect-square w-full bg-black object-cover"
          />
          <span className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full border border-[#D4AF37]/40 bg-black/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#F5D76E]">
            <Video size={11} aria-hidden="true" />
            Video
          </span>
        </>
      )}

      {canDelete && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          aria-label="Delete file"
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-red-400/50 bg-black/75 text-red-300 transition-all duration-200 hover:border-red-400 hover:bg-red-600 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-400/40 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 size={15} aria-hidden="true" className="animate-spin" />
          ) : (
            <X size={16} aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
}