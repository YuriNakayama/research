"use client";

import { useState } from "react";
import { Trash2, StickyNote } from "lucide-react";
import { useNotes } from "@/hooks/use-notes";
import { NOTE_BODY_MAX } from "@/lib/notes/schema";
import { cn } from "@/lib/utils";

type NotesPanelProps = {
  // Document slug the notes are attached to (e.g. "runs/foo/gather/...").
  slug: string;
};

// Personal, private notes for the current document. Only the author can see
// them; ownership is enforced server-side by the Cognito session.
export function NotesPanel({ slug }: NotesPanelProps) {
  const { notes, loading, error, submitting, addNote, removeNote } =
    useNotes(slug);
  const [draft, setDraft] = useState<string>("");

  const trimmed = draft.trim();
  const canSubmit = trimmed.length > 0 && !submitting;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    const succeeded = await addNote(trimmed);
    if (succeeded) {
      setDraft("");
    }
  }

  return (
    <section
      aria-label="個人メモ"
      className="mt-12 brutal-border-strong brutal-shadow bg-[var(--surface-elevated)]"
    >
      <div className="flex items-center justify-between brutal-border-b border-[var(--border-primary)] bg-[var(--text-primary)] px-4 py-2">
        <span className="brutal-label flex items-center gap-2 text-[var(--text-inverse)]">
          <StickyNote className="h-3.5 w-3.5" aria-hidden />
          個人メモ
        </span>
        <span className="brutal-label text-[var(--text-inverse)]">
          {notes.length} 件
        </span>
      </div>

      <div className="px-5 py-5">
        <p className="mb-4 text-xs text-[var(--text-secondary)]">
          このメモはあなただけに表示されます。
        </p>

        <form onSubmit={handleSubmit} className="mb-5">
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
                  ? "bg-[var(--text-primary)] text-[var(--text-inverse)] hover:bg-[var(--accent-primary)]"
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
            className="mb-4 brutal-border border-[var(--accent-primary)] px-3 py-2 text-xs text-[var(--accent-primary)]"
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
          <ul className="flex flex-col gap-3">
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
                    onClick={() => void removeNote(note.noteId)}
                    aria-label="メモを削除"
                    className="shrink-0 text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-primary)]"
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
    </section>
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
