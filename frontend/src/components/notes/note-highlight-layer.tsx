"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { StickyNote, X } from "lucide-react";
import { useNotesContext } from "@/components/notes/notes-provider";
import { useTextSelection } from "@/hooks/use-text-selection";
import { resolveSelectionAnchor, buildSelectionAnchor } from "@/lib/notes/anchor";
import {
  getDocumentText,
  rangeToOffsets,
  offsetsToRange,
  findEnclosingHeadingId,
} from "@/lib/notes/dom-range";
import type { Note } from "@/lib/notes/schema";
import { cn } from "@/lib/utils";

// The selection button is right-aligned to the selection end via
// -translate-x-full, so its left coordinate must stay at least its own width
// from the viewport edge to remain fully visible.
const BUTTON_MIN_LEFT = 120;
const BUTTON_MARGIN = 8;
const BUTTON_HEIGHT = 40;

type Marker = {
  note: Note;
  // Viewport-independent position, relative to the article container.
  top: number;
  left: number;
  width: number;
  height: number;
  exact: boolean;
};

/**
 * Renders selection-anchored notes over the article.
 *
 * Two responsibilities:
 * 1. Offer a "add a note" affordance when the reader selects text.
 * 2. Mark passages that already carry notes, with a thin underline rather than
 *    a filled highlight so the prose stays readable, and open a small popover
 *    on click.
 *
 * Anchors are resolved against the rendered text after paint. Notes whose
 * quote can no longer be found are reported to the provider as orphans so the
 * panel can still show them.
 */
export function NoteHighlightLayer({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
}) {
  const ctx = useNotesContext();
  const { selection, clear } = useTextSelection(containerRef);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const notes = ctx?.notes;
  const setOrphanIds = ctx?.setOrphanIds;

  // Resolve every selection anchor to on-screen rectangles.
  const recompute = useCallback(() => {
    const root = containerRef.current;
    if (!root || !notes) {
      setMarkers([]);
      return;
    }
    const documentText = getDocumentText(root);
    const rootRect = root.getBoundingClientRect();
    const next: Marker[] = [];
    const orphans = new Set<string>();

    for (const note of notes) {
      if (note.anchor?.kind !== "selection") continue;
      const resolved = resolveSelectionAnchor(documentText, note.anchor);
      if (!resolved) {
        orphans.add(note.noteId);
        continue;
      }
      const range = offsetsToRange(root, resolved.start, resolved.end);
      if (!range) {
        orphans.add(note.noteId);
        continue;
      }
      // A range can wrap lines; one marker per client rect keeps the underline
      // aligned with the text instead of drawing one huge box.
      for (const rect of Array.from(range.getClientRects())) {
        if (rect.width === 0 || rect.height === 0) continue;
        next.push({
          note,
          top: rect.top - rootRect.top,
          left: rect.left - rootRect.left,
          width: rect.width,
          height: rect.height,
          exact: resolved.exact,
        });
      }
    }

    setMarkers(next);
    setOrphanIds?.(orphans);
  }, [containerRef, notes, setOrphanIds]);

  // Recompute after paint and whenever the layout can shift.
  useEffect(() => {
    const raf = requestAnimationFrame(recompute);
    window.addEventListener("resize", recompute);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", recompute);
    };
  }, [recompute]);

  // Images and fonts settle after first paint and move the text; observe the
  // container so the underlines follow instead of drifting.
  useEffect(() => {
    const root = containerRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => recompute());
    observer.observe(root);
    return () => observer.disconnect();
  }, [containerRef, recompute]);

  const handleAddFromSelection = useCallback(() => {
    const root = containerRef.current;
    if (!root || !selection || !ctx) return;
    const offsets = rangeToOffsets(root, selection.range);
    if (!offsets) return;
    const anchor = buildSelectionAnchor({
      documentText: getDocumentText(root),
      start: offsets.start,
      end: offsets.end,
      headingId: findEnclosingHeadingId(root, selection.range),
    });
    if (!anchor) return;
    ctx.setDraftAnchor(anchor);
    ctx.setOpen(true);
    ctx.focusNote(null);
    clear();
  }, [containerRef, selection, ctx, clear]);

  if (!ctx) {
    return null;
  }

  const activeNote =
    activeNoteId !== null
      ? (notes?.find((n) => n.noteId === activeNoteId) ?? null)
      : null;
  const activeMarker =
    activeNoteId !== null
      ? (markers.find((m) => m.note.noteId === activeNoteId) ?? null)
      : null;

  return (
    <>
      {/* Underlines + click targets, positioned over the article. */}
      <div
        ref={overlayRef}
        data-notes-ignore
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
      >
        {markers.map((marker, index) => (
          <button
            key={`${marker.note.noteId}-${index}`}
            type="button"
            tabIndex={-1}
            // Lets the panel's "jump to" find this passage.
            data-note-id={marker.note.noteId}
            onClick={() =>
              setActiveNoteId((prev) =>
                prev === marker.note.noteId ? null : marker.note.noteId,
              )
            }
            style={{
              top: marker.top,
              left: marker.left,
              width: marker.width,
              height: marker.height,
            }}
            className={cn(
              "pointer-events-auto absolute cursor-pointer",
              // A 2px bottom border reads as an annotation without washing out
              // the text the way a filled highlight does.
              "border-b-2",
              marker.exact
                ? "border-[var(--accent-bg)] hover:bg-[var(--accent-bg)]/15"
                : "border-dashed border-[var(--text-secondary)] hover:bg-[var(--text-secondary)]/10",
            )}
          />
        ))}
      </div>

      {/* "Add a note" affordance, shown only while text is selected. */}
      {selection && (
        <div
          data-notes-ignore
          // Anchored to the end of the selection, but kept inside the
          // viewport: near the left edge the button's own width would
          // otherwise push it off-screen and out of reach.
          style={{
            top: Math.min(selection.y + 8, window.innerHeight - BUTTON_HEIGHT),
            left: Math.min(
              Math.max(selection.x, BUTTON_MIN_LEFT),
              window.innerWidth - BUTTON_MARGIN,
            ),
          }}
          className="fixed z-50 -translate-x-full"
        >
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleAddFromSelection}
            className="flex items-center gap-1.5 brutal-border-strong brutal-shadow bg-[var(--accent-bg)] px-2.5 py-1.5 text-xs font-bold text-[var(--accent-text)] cursor-pointer"
          >
            <StickyNote className="h-3.5 w-3.5" aria-hidden />
            メモを追加
          </button>
        </div>
      )}

      {/* Inline popover for an existing note. */}
      {activeNote && activeMarker && (
        <div
          data-notes-ignore
          role="dialog"
          aria-label="メモ"
          style={{
            top: activeMarker.top + activeMarker.height + 6,
            left: activeMarker.left,
          }}
          className="absolute z-30 w-[min(320px,calc(100vw-3rem))] brutal-border-strong brutal-shadow bg-[var(--surface-elevated)]"
        >
          <div className="flex items-start justify-between gap-2 border-b border-[var(--border-primary)] px-3 py-1.5">
            <span className="brutal-label text-[11px] text-[var(--text-secondary)]">
              メモ
            </span>
            <button
              type="button"
              onClick={() => setActiveNoteId(null)}
              aria-label="メモを閉じる"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
          <p className="whitespace-pre-wrap break-words px-3 py-2 text-sm text-[var(--text-primary)]">
            {activeNote.body}
          </p>
          <div className="flex justify-end px-3 pb-2">
            <button
              type="button"
              onClick={() => {
                ctx.setOpen(true);
                ctx.focusNote(activeNote.noteId);
                setActiveNoteId(null);
              }}
              className="text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              パネルで開く →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
