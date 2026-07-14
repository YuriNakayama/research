"use client";

import { useCallback, useEffect, useState } from "react";
import type { Note } from "@/lib/notes/schema";
import {
  fetchNotes,
  createNote as createNoteRequest,
  deleteNote as deleteNoteRequest,
} from "@/lib/notes/client";

type UseNotesResult = {
  notes: Note[];
  loading: boolean;
  error: string | null;
  submitting: boolean;
  addNote: (body: string) => Promise<boolean>;
  removeNote: (noteId: string) => Promise<void>;
};

/**
 * Load and mutate the current user's personal notes for one document.
 *
 * State updates stay immutable and the list is re-synced from the server after
 * a mutation rather than optimistically patched — simplest correct behavior.
 */
export function useNotes(slug: string): UseNotesResult {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetched = await fetchNotes(slug);
      setNotes(fetched);
    } catch (err) {
      setError(err instanceof Error ? err.message : "メモの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const addNote = useCallback(
    async (body: string): Promise<boolean> => {
      setSubmitting(true);
      setError(null);
      try {
        const created = await createNoteRequest(slug, body);
        setNotes((prev) => [created, ...prev]);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "メモの追加に失敗しました");
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [slug],
  );

  const removeNote = useCallback(
    async (noteId: string): Promise<void> => {
      setError(null);
      try {
        await deleteNoteRequest(slug, noteId);
        setNotes((prev) => prev.filter((note) => note.noteId !== noteId));
      } catch (err) {
        setError(err instanceof Error ? err.message : "メモの削除に失敗しました");
      }
    },
    [slug],
  );

  return { notes, loading, error, submitting, addNote, removeNote };
}
