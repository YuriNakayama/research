import { z } from "zod";
import { noteSchema, type Note } from "@/lib/notes/schema";

// Client-side API for the notes endpoints. Every response is validated with
// Zod at the boundary (see .claude/rules/frontend.md "API Communication").

const notesResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(noteSchema),
});

const noteResponseSchema = z.object({
  success: z.literal(true),
  data: noteSchema,
});

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

export async function fetchNotes(slug: string): Promise<Note[]> {
  const response = await fetch(
    `/api/notes?slug=${encodeURIComponent(slug)}`,
    { method: "GET" },
  );
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  return notesResponseSchema.parse(await response.json()).data;
}

export async function createNote(slug: string, body: string): Promise<Note> {
  const response = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, body }),
  });
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  return noteResponseSchema.parse(await response.json()).data;
}

export async function deleteNote(slug: string, noteId: string): Promise<void> {
  const response = await fetch(
    `/api/notes/${encodeURIComponent(noteId)}?slug=${encodeURIComponent(slug)}`,
    { method: "DELETE" },
  );
  if (!response.ok) {
    throw new Error(await readError(response));
  }
}
