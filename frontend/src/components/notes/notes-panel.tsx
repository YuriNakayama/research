"use client";

import { useEffect, useRef, useState } from "react";
import { StickyNote, X, GripVertical } from "lucide-react";
import { useNotes } from "@/hooks/use-notes";
import { useDraggable } from "@/hooks/use-draggable";
import { NotesContent } from "@/components/notes/notes-content";
import { cn } from "@/lib/utils";

type NotesPanelProps = {
  // Document slug the notes are attached to (e.g. "runs/foo/gather/...").
  slug: string;
};

const FAB_SIZE = 56; // px, matches h-14/w-14
const PANEL_WIDTH = 340; // px, floating card width on larger screens
const PANEL_MAX_HEIGHT = 460; // px

// Default anchor: bottom-right, stacked ABOVE the existing mobile FABs
// (mobile-toc at bottom-5, mobile-nav at bottom-20) so nothing overlaps.
function defaultPosition(): { x: number; y: number } {
  if (typeof window === "undefined") {
    return { x: 0, y: 0 };
  }
  return {
    x: window.innerWidth - FAB_SIZE - 20,
    y: window.innerHeight - FAB_SIZE - 220,
  };
}

/**
 * Floating, draggable personal-notes widget.
 *
 * - Collapsed to a single FAB so it stays out of the way while reading.
 * - Freely repositionable via drag (pointer + touch); position persists.
 * - Expands into a floating card anchored at the FAB, sized to fit small
 *   screens without covering the whole viewport.
 */
export function NotesPanel({ slug }: NotesPanelProps) {
  const { notes, loading, error, submitting, addNote, removeNote } =
    useNotes(slug);
  const [open, setOpen] = useState<boolean>(false);

  // A single anchor position drives both the collapsed FAB and the expanded
  // card. Dragging either updates the same persisted point.
  const { position, dragging, handleProps, ready } = useDraggable({
    storageKey: "notes-widget-position",
    defaultPosition: defaultPosition(),
    size: { width: FAB_SIZE, height: FAB_SIZE },
  });

  // Distinguish a click (toggle) from a drag on the FAB: only toggle if the
  // pointer did not move meaningfully between down and up.
  const downPoint = useRef<{ x: number; y: number } | null>(null);

  function handleFabPointerDown(event: React.PointerEvent) {
    downPoint.current = { x: event.clientX, y: event.clientY };
    handleProps.onPointerDown(event);
  }

  function handleFabPointerUp(event: React.PointerEvent) {
    const start = downPoint.current;
    downPoint.current = null;
    if (!start) {
      return;
    }
    const moved =
      Math.abs(event.clientX - start.x) > 6 ||
      Math.abs(event.clientY - start.y) > 6;
    if (!moved) {
      setOpen((prev) => !prev);
    }
  }

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!ready) {
    return null;
  }

  // Anchor the expanded card at the FAB position, then keep the whole card on
  // screen: grow leftward when near the right edge and upward when near the
  // bottom, so the header and actions are never clipped by the viewport.
  const margin = 8;
  const vw = typeof window !== "undefined" ? window.innerWidth : PANEL_WIDTH;
  const vh = typeof window !== "undefined" ? window.innerHeight : PANEL_MAX_HEIGHT;
  const cardWidth = Math.min(PANEL_WIDTH, vw - margin * 2);
  const cardHeight = Math.min(PANEL_MAX_HEIGHT, vh - margin * 2);
  const panelLeft = Math.min(
    Math.max(margin, position.x),
    Math.max(margin, vw - cardWidth - margin),
  );
  const panelTop = Math.min(
    Math.max(margin, position.y),
    Math.max(margin, vh - cardHeight - margin),
  );

  return (
    <>
      {/* Collapsed FAB — always rendered; acts as the reopen affordance. */}
      {!open && (
        <button
          type="button"
          onPointerDown={handleFabPointerDown}
          onPointerUp={handleFabPointerUp}
          aria-label={`個人メモを開く（${notes.length} 件）`}
          style={{ left: position.x, top: position.y }}
          className={cn(
            "fixed z-40 flex h-14 w-14 touch-none items-center justify-center brutal-border-strong brutal-shadow bg-[var(--accent-bg)] text-[var(--accent-text)]",
            dragging
              ? "cursor-grabbing"
              : "cursor-grab transition-transform active:translate-x-[2px] active:translate-y-[2px]",
          )}
        >
          <StickyNote className="h-6 w-6" strokeWidth={2.5} aria-hidden />
          {notes.length > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center brutal-border bg-[var(--surface-elevated)] px-1 text-[11px] font-bold text-[var(--text-primary)]">
              {notes.length}
            </span>
          )}
        </button>
      )}

      {/* Expanded floating card. */}
      {open && (
        <div
          role="dialog"
          aria-label="個人メモ"
          style={{
            left: panelLeft,
            top: panelTop,
            width: cardWidth,
            maxHeight: cardHeight,
          }}
          className="fixed z-40 flex flex-col overflow-hidden brutal-border-strong brutal-shadow bg-[var(--surface-elevated)]"
        >
          {/* Header: the title area is the drag handle; the close button is a
              sibling OUTSIDE the drag zone so its pointer events are never
              swallowed by the drag-start handler. */}
          <div className="flex items-stretch justify-between brutal-border-b border-[var(--border-primary)] bg-[var(--text-primary)]">
            <div
              {...handleProps}
              className={cn(
                "flex min-w-0 flex-1 touch-none items-center gap-1.5 px-3 py-2",
                dragging ? "cursor-grabbing" : "cursor-grab",
              )}
            >
              <span className="brutal-label flex items-center gap-1.5 text-[var(--text-inverse)]">
                <GripVertical
                  className="h-3.5 w-3.5 opacity-70"
                  aria-hidden
                />
                <StickyNote className="h-3.5 w-3.5" aria-hidden />
                個人メモ
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="個人メモを閉じる"
              className="flex w-10 shrink-0 items-center justify-center text-[var(--text-inverse)] transition-colors hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)] cursor-pointer"
            >
              <X className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </button>
          </div>

          {/* Scrollable body. */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            <NotesContent
              notes={notes}
              loading={loading}
              error={error}
              submitting={submitting}
              onAdd={addNote}
              onRemove={removeNote}
            />
          </div>
        </div>
      )}
    </>
  );
}
