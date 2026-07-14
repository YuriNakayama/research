"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { Note } from "@/lib/notes/schema";
import { NOTE_BODY_MAX } from "@/lib/notes/schema";
import { cn } from "@/lib/utils";

type NotesContentProps = {
  notes: Note[];
  loading: boolean;
  error: string | null;
  submitting: boolean;
  onAdd: (body: string) => Promise<boolean>;
  onRemove: (noteId: string) => Promise<void>;
};

// Presentational body of the notes widget: the add form and the note list.
// Kept free of layout/positioning concerns so the floating shell can size and
// place it however it needs to.
export function NotesContent({
  notes,
  loading,
  error,
  submitting,
  onAdd,
  onRemove,
}: NotesContentProps) {
  const [draft, setDraft] = useState<string>("");

  const trimmed = draft.trim();
  const canSubmit = trimmed.length > 0 && !submitting;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    const succeeded = await onAdd(trimmed);
    if (succeeded) {
      setDraft("");
    }
  }

  return (
    <div className="px-4 py-4">
      <p className="mb-3 text-xs text-[var(--text-secondary)]">
        このメモはあなただけに表示されます。
      </p>

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
                ? "bg-[var(--text-primary)] text-[var(--text-inverse)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)]"
                : "cursor-not-allowed bg-[var(--surface-primary)] text-[var(--text-secondary)]",
            )}
          >
            {submitting ? "追加中…" : "追加"}
          </button>
        </div>
      </form>

      {error && (
        <p
          role="alert"
          className="mb-3 brutal-border border-[var(--accent-bg)] px-3 py-2 text-xs text-[var(--text-primary)]"
        >
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[var(--text-secondary)]">読み込み中…</p>
      ) : notes.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">
          まだメモはありません。
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {notes.map((note) => (
            <li
              key={note.noteId}
              className="brutal-border bg-[var(--surface-primary)] px-3 py-2"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="whitespace-pre-wrap break-words text-sm text-[var(--text-primary)]">
                  {note.body}
                </p>
                <button
                  type="button"
                  onClick={() => void onRemove(note.noteId)}
                  aria-label="メモを削除"
                  className="shrink-0 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <time className="mt-1 block text-[11px] text-[var(--text-secondary)]">
                {formatTimestamp(note.createdAt)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
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
