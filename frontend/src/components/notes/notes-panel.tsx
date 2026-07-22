"use client";

import { useEffect } from "react";
import { StickyNote, X } from "lucide-react";
import { useNotesContext } from "@/components/notes/notes-provider";
import { NotesContent } from "@/components/notes/notes-content";

/**
 * Floating personal-notes widget.
 *
 * - Collapsed to a single FAB so it stays out of the way while reading.
 * - Anchored to a fixed bottom-right slot, stacked ABOVE the existing mobile
 *   FABs (mobile-toc at bottom-5, mobile-nav at bottom-20) so nothing overlaps.
 *   The position is intentionally not user-movable: a draggable FAB drifted on
 *   viewport resize and could be left stranded off its anchor.
 * - Expands into a card pinned to the same corner, capped to the viewport so
 *   the header and actions are never clipped.
 *
 * Open state lives in the provider so in-body affordances (heading buttons,
 * selection popovers) can open the panel with an anchor already staged.
 */
export function NotesPanel() {
  const ctx = useNotesContext();
  const open = ctx?.open ?? false;
  const setOpen = ctx?.setOpen;

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!open || !setOpen) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!ctx) {
    return null;
  }

  const { notes } = ctx;

  return (
    <>
      {/* Collapsed FAB — acts as the reopen affordance. */}
      {!open && (
        <button
          type="button"
          onClick={() => ctx.setOpen(true)}
          aria-label={`個人メモを開く（${notes.length} 件）`}
          className="fixed bottom-36 right-5 z-40 flex h-14 w-14 items-center justify-center brutal-border-strong brutal-shadow bg-[var(--accent-bg)] text-[var(--accent-text)] transition-transform active:translate-x-[2px] active:translate-y-[2px] cursor-pointer"
        >
          <StickyNote className="h-6 w-6" strokeWidth={2.5} aria-hidden />
          {notes.length > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center brutal-border bg-[var(--surface-elevated)] px-1 text-[11px] font-bold text-[var(--text-primary)]">
              {notes.length}
            </span>
          )}
        </button>
      )}

      {/* Expanded card, pinned to the same corner. */}
      {open && (
        // The max height must account for the bottom offset, otherwise a tall
        // card grows past the top of the viewport and clips the header,
        // leaving no way to close it on touch devices.
        <div
          role="dialog"
          aria-label="個人メモ"
          className="fixed bottom-36 right-5 z-40 flex max-h-[min(460px,calc(100vh-9rem-1rem))] w-[min(340px,calc(100vw-2.5rem))] flex-col overflow-hidden brutal-border-strong brutal-shadow bg-[var(--surface-elevated)] lg:bottom-5 lg:max-h-[min(460px,calc(100vh-2.25rem))]"
        >
          <div className="flex items-stretch justify-between brutal-border-b border-[var(--border-primary)] bg-[var(--text-primary)]">
            <div className="flex min-w-0 flex-1 items-center gap-1.5 px-3 py-2">
              <span className="brutal-label flex items-center gap-1.5 text-[var(--text-inverse)]">
                <StickyNote className="h-3.5 w-3.5" aria-hidden />
                個人メモ
              </span>
            </div>
            <button
              type="button"
              onClick={() => ctx.setOpen(false)}
              aria-label="個人メモを閉じる"
              className="flex w-10 shrink-0 items-center justify-center text-[var(--text-inverse)] transition-colors hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)] cursor-pointer"
            >
              <X className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </button>
          </div>

          {/* Scrollable body. */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            <NotesContent />
          </div>
        </div>
      )}
    </>
  );
}
