"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";
import type { Note, NoteAnchor } from "@/lib/notes/schema";
import { NOTE_BODY_MAX } from "@/lib/notes/schema";
import { useNotesContext } from "@/components/notes/notes-provider";
import { cn } from "@/lib/utils";

type Filter = "all" | "page" | "anchored";

// Set by the highlight layer on each rendered marker; lets a panel entry
// scroll to the passage it annotates.
const HIGHLIGHT_SELECTOR = "data-note-id";

// Human-readable description of where a note is attached.
function anchorLabel(anchor: NoteAnchor | undefined): string {
  if (!anchor) return "ページ全体";
  if (anchor.kind === "heading") return anchor.headingText;
  return "選択箇所";
}

function matchesFilter(note: Note, filter: Filter): boolean {
  if (filter === "all") return true;
  if (filter === "page") return note.anchor === undefined;
  return note.anchor !== undefined;
}

/**
 * Body of the notes widget: the add form and the grouped note list.
 *
 * Grouping mirrors the document's structure so the panel alone tells the
 * reader what each note refers to, without needing to jump into the text.
 */
export function NotesContent() {
  const ctx = useNotesContext();
  const [draft, setDraft] = useState<string>("");
  const [filter, setFilter] = useState<Filter>("all");
  const focusedRef = useRef<HTMLLIElement | null>(null);

  // Scroll a focused note into view when the panel is opened from the body.
  useEffect(() => {
    if (ctx?.focusedNoteId && focusedRef.current) {
      focusedRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [ctx?.focusedNoteId]);

  const groups = useMemo(() => {
    if (!ctx) return [];
    const visible = ctx.notes.filter((note) => matchesFilter(note, filter));
    // Preserve document order for anchored groups by keying off the heading
    // order the provider produced, with page-level notes first.
    const byLabel = new Map<string, Note[]>();
    for (const note of visible) {
      const label = anchorLabel(note.anchor);
      const bucket = byLabel.get(label);
      if (bucket) bucket.push(note);
      else byLabel.set(label, [note]);
    }
    return Array.from(byLabel.entries());
  }, [ctx, filter]);

  if (!ctx) return null;

  const { notes, loading, error, submitting, addNote, removeNote, draftAnchor } =
    ctx;

  const trimmed = draft.trim();
  const canSubmit = trimmed.length > 0 && !submitting;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    const succeeded = await addNote(trimmed, draftAnchor ?? undefined);
    if (succeeded) {
      setDraft("");
      ctx?.setDraftAnchor(null);
    }
  }

  const orphanCount = notes.filter((n) => ctx.orphanIds.has(n.noteId)).length;

  return (
    <div className="px-4 py-4">
      {/* Kept above the form: below it the message can fall outside the
          card's scroll viewport, so a failed save looks like silence. */}
      {error && (
        <p
          role="alert"
          className="mb-3 brutal-border border-[var(--accent-bg)] px-3 py-2 text-xs text-[var(--text-primary)]"
        >
          {error}
        </p>
      )}

      {/* What the note about to be written will attach to. */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[11px] text-[var(--text-secondary)]">
          {draftAnchor ? (
            <>
              添付先:{" "}
              <span className="font-bold text-[var(--text-primary)]">
                {anchorLabel(draftAnchor)}
              </span>
            </>
          ) : (
            "添付先: ページ全体"
          )}
        </span>
        {draftAnchor && (
          <button
            type="button"
            onClick={() => ctx.setDraftAnchor(null)}
            className="flex items-center gap-0.5 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X className="h-3 w-3" aria-hidden />
            解除
          </button>
        )}
      </div>

      {draftAnchor?.kind === "selection" && (
        <p className="mb-2 border-l-2 border-[var(--accent-bg)] pl-2 text-[11px] italic text-[var(--text-secondary)]">
          「{draftAnchor.quote.slice(0, 80)}
          {draftAnchor.quote.length > 80 ? "…" : ""}」
        </p>
      )}

      <form onSubmit={handleSubmit} className="mb-4">
        <label htmlFor="note-input" className="sr-only">
          メモを追加
        </label>
        <textarea
          id="note-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={NOTE_BODY_MAX}
          rows={3}
          placeholder="このドキュメントへのメモを書く…"
          className="w-full resize-y brutal-border bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] text-[var(--text-secondary)]">
            {draft.length} / {NOTE_BODY_MAX}
          </span>
          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              "brutal-border px-4 py-1.5 text-sm font-bold transition-colors",
              canSubmit
                ? "bg-[var(--text-primary)] text-[var(--text-inverse)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)] cursor-pointer"
                : "cursor-not-allowed bg-[var(--surface-primary)] text-[var(--text-secondary)]",
            )}
          >
            {submitting ? "追加中…" : "追加"}
          </button>
        </div>
      </form>

      {notes.length > 0 && (
        <div className="mb-3 flex gap-1">
          {(
            [
              ["all", "すべて"],
              ["page", "ページ"],
              ["anchored", "文中"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                "brutal-border px-2 py-0.5 text-[11px] font-bold cursor-pointer",
                filter === key
                  ? "bg-[var(--text-primary)] text-[var(--text-inverse)]"
                  : "bg-[var(--surface-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {orphanCount > 0 && (
        <p className="mb-3 flex items-start gap-1.5 brutal-border border-[var(--text-secondary)] px-2 py-1.5 text-[11px] text-[var(--text-secondary)]">
          <AlertTriangle className="mt-px h-3 w-3 shrink-0" aria-hidden />
          <span>
            {orphanCount} 件のメモは本文が変わったため位置を特定できません。内容は保持されています。
          </span>
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[var(--text-secondary)]">読み込み中…</p>
      ) : groups.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">
          {notes.length === 0
            ? "まだメモはありません。"
            : "この条件に合うメモはありません。"}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map(([label, groupNotes]) => (
            <section key={label}>
              <h3 className="brutal-label mb-1 text-[11px] text-[var(--text-secondary)]">
                {label}
              </h3>
              <ul className="flex flex-col gap-2">
                {groupNotes.map((note) => {
                  const isOrphan = ctx.orphanIds.has(note.noteId);
                  const isFocused = ctx.focusedNoteId === note.noteId;
                  return (
                    <li
                      key={note.noteId}
                      ref={isFocused ? focusedRef : null}
                      className={cn(
                        "brutal-border bg-[var(--surface-primary)] px-3 py-2",
                        isFocused && "border-[var(--accent-bg)]",
                      )}
                    >
                      {note.anchor?.kind === "selection" && (
                        <p className="mb-1 border-l-2 border-[var(--border-primary)] pl-2 text-[11px] italic text-[var(--text-secondary)]">
                          「{note.anchor.quote.slice(0, 60)}
                          {note.anchor.quote.length > 60 ? "…" : ""}」
                          {isOrphan && " (未検出)"}
                        </p>
                      )}
                      <div className="flex items-start justify-between gap-3">
                        <p className="whitespace-pre-wrap break-words text-sm text-[var(--text-primary)]">
                          {note.body}
                        </p>
                        <button
                          type="button"
                          onClick={() => void removeNote(note.noteId)}
                          aria-label="メモを削除"
                          className="shrink-0 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <time className="block text-[11px] text-[var(--text-secondary)]">
                          {formatTimestamp(note.createdAt)}
                        </time>
                        {note.anchor && !isOrphan && (
                          <button
                            type="button"
                            onClick={() => jumpToNote(note)}
                            className="text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                          >
                            該当箇所へ →
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Scroll to a note's anchor in the body.
 *
 * Heading anchors have a real element id to target. Selection anchors rely on
 * the highlight layer having drawn a marker, which carries the note id.
 */
function jumpToNote(note: Note): void {
  if (!note.anchor) return;
  const target =
    note.anchor.kind === "heading"
      ? document.getElementById(note.anchor.headingId)
      : document.querySelector(
          `[${HIGHLIGHT_SELECTOR}="${CSS.escape(note.noteId)}"]`,
        );
  target?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
