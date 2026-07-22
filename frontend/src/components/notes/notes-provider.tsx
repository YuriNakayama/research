"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Note, NoteAnchor } from "@/lib/notes/schema";
import { useNotes } from "@/hooks/use-notes";

type NotesContextValue = {
  notes: Note[];
  loading: boolean;
  error: string | null;
  submitting: boolean;
  addNote: (body: string, anchor?: NoteAnchor) => Promise<boolean>;
  removeNote: (noteId: string) => Promise<void>;
  // Notes grouped by the heading they are anchored to. Page-level notes live
  // under `null`.
  notesByHeading: Map<string | null, Note[]>;
  // Note ids whose selection anchor could not be located in the current text.
  orphanIds: Set<string>;
  setOrphanIds: (ids: Set<string>) => void;
  // The note the UI should scroll to / flash, if any.
  focusedNoteId: string | null;
  focusNote: (noteId: string | null) => void;
  // Panel open state, shared so inline affordances can open it.
  open: boolean;
  setOpen: (open: boolean) => void;
  // A pending anchor captured from a selection or heading, awaiting a body.
  draftAnchor: NoteAnchor | null;
  setDraftAnchor: (anchor: NoteAnchor | null) => void;
};

const NotesContext = createContext<NotesContextValue | null>(null);

/**
 * Shared notes state for one document.
 *
 * The floating panel and the in-body affordances both need the same list and
 * must stay in sync after a create/delete, so the data lives here rather than
 * in either component.
 */
export function NotesProvider({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const { notes, loading, error, submitting, addNote, removeNote } =
    useNotes(slug);
  const [open, setOpen] = useState<boolean>(false);
  const [draftAnchor, setDraftAnchor] = useState<NoteAnchor | null>(null);
  const [focusedNoteId, setFocusedNoteId] = useState<string | null>(null);
  const [orphanIds, setOrphanIdsState] = useState<Set<string>>(() => new Set());

  // The highlight layer recomputes on every resize and produces a fresh Set
  // each time. Replacing state with an equal Set would invalidate this
  // provider's memo and re-render every consumer, so only commit real changes.
  const setOrphanIds = useCallback((next: Set<string>) => {
    setOrphanIdsState((prev) => {
      if (prev.size === next.size && [...next].every((id) => prev.has(id))) {
        return prev;
      }
      return next;
    });
  }, []);

  const notesByHeading = useMemo(() => {
    const grouped = new Map<string | null, Note[]>();
    for (const note of notes) {
      const key = note.anchor?.kind === "heading"
        ? note.anchor.headingId
        : note.anchor?.kind === "selection"
          ? (note.anchor.headingId ?? null)
          : null;
      const bucket = grouped.get(key);
      if (bucket) {
        bucket.push(note);
      } else {
        grouped.set(key, [note]);
      }
    }
    return grouped;
  }, [notes]);

  const focusNote = useCallback((noteId: string | null) => {
    setFocusedNoteId(noteId);
  }, []);

  const value = useMemo<NotesContextValue>(
    () => ({
      notes,
      loading,
      error,
      submitting,
      addNote,
      removeNote,
      notesByHeading,
      orphanIds,
      setOrphanIds,
      focusedNoteId,
      focusNote,
      open,
      setOpen,
      draftAnchor,
      setDraftAnchor,
    }),
    [
      notes,
      loading,
      error,
      submitting,
      addNote,
      removeNote,
      notesByHeading,
      orphanIds,
      setOrphanIds,
      focusedNoteId,
      focusNote,
      open,
      draftAnchor,
    ],
  );

  return (
    <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
  );
}

/**
 * Access the document's notes.
 *
 * Returns null outside a provider so in-body affordances can render on pages
 * that have no notes widget (directory listings) without crashing.
 */
export function useNotesContext(): NotesContextValue | null {
  return useContext(NotesContext);
}
