"use client";

import { useTransition } from "react";
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

  return (
    <div className="relative group">
      {media.fileType === "IMAGE" ? (
        <img src={media.fileUrl} className="rounded-md aspect-square object-cover w-full" />
      ) : (
        <video src={media.fileUrl} controls className="rounded-md aspect-square object-cover w-full" />
      )}
      {canDelete && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="absolute top-1 right-1 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs opacity-90 hover:opacity-100 disabled:opacity-50"
          aria-label="Delete file"
        >
          {isPending ? "…" : "✕"}
        </button>
      )}
    </div>
  );
}
