import { z } from "zod";
import { noteSchema, type Note, type NoteAnchor } from "@/lib/notes/schema";

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

const UNAUTHORIZED_MESSAGE =
  "セッションの有効期限が切れました。再ログインしてください。";

async function readError(response: Response): Promise<string> {
  if (response.status === 401) {
    return UNAUTHORIZED_MESSAGE;
  }
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

/**
 * Parse a successful response as JSON, guarding against a non-JSON body.
 *
 * A 200 that is not JSON means we were served an HTML page (e.g. an auth
 * redirect landing on /login) rather than the API. Report that as an expired
 * session instead of letting `response.json()` throw a raw syntax error.
 */
async function readJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(UNAUTHORIZED_MESSAGE);
  }
  return response.json();
}

export async function fetchNotes(slug: string): Promise<Note[]> {
  const response = await fetch(
    `/api/notes?slug=${encodeURIComponent(slug)}`,
    { method: "GET" },
  );
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  return notesResponseSchema.parse(await readJson(response)).data;
}

export async function createNote(
  slug: string,
  body: string,
  anchor?: NoteAnchor,
): Promise<Note> {
  const response = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(anchor ? { slug, body, anchor } : { slug, body }),
  });
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  return noteResponseSchema.parse(await readJson(response)).data;
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
