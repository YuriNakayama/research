"use client";

import { StickyNote } from "lucide-react";
import { useNotesContext } from "@/components/notes/notes-provider";
import { cn } from "@/lib/utils";

type HeadingNoteButtonProps = {
  headingId: string;
  headingText: string;
};

/**
 * Per-heading note affordance.
 *
 * Deliberately quiet: with no notes attached it is invisible until the heading
 * is hovered or the button itself is focused, so reading is undisturbed. Once
 * notes exist it shows a persistent count, since that is information the
 * reader wants without having to hunt for it.
 *
 * Relies on `group`/`group-hover` from the enclosing heading element.
 */
export function HeadingNoteButton({
  headingId,
  headingText,
}: HeadingNoteButtonProps) {
  const ctx = useNotesContext();
  if (!ctx) {
    return null;
  }

  const count = ctx.notesByHeading.get(headingId)?.length ?? 0;
  const label =
    count > 0
      ? `「${headingText}」のメモ（${count} 件）`
      : `「${headingText}」にメモを追加`;

  return (
    <button
      type="button"
      onClick={() => {
        ctx.setDraftAnchor({ kind: "heading", headingId, headingText });
        ctx.setOpen(true);
        // Surface the first existing note for this heading, if any.
        const existing = ctx.notesByHeading.get(headingId)?.[0];
        ctx.focusNote(existing ? existing.noteId : null);
      }}
      aria-label={label}
      title={label}
      className={cn(
        "ml-2 inline-flex shrink-0 translate-y-[-2px] items-center gap-1 align-middle",
        "px-1.5 py-0.5 text-[11px] font-bold",
        "text-[var(--text-secondary)] hover:text-[var(--accent-text)] hover:bg-[var(--accent-bg)]",
        "cursor-pointer transition-opacity",
        count > 0
          ? "opacity-100 brutal-border"
          : "opacity-0 focus-visible:opacity-100 group-hover:opacity-60",
      )}
    >
      <StickyNote className="h-3 w-3" aria-hidden />
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
