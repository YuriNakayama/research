import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { getCurrentUserSub } from "@/lib/notes/auth";
import { createNoteSchema, slugQuerySchema } from "@/lib/notes/schema";
import { listNotes, createNote } from "@/lib/notes/dynamo";
import { ok, fail } from "@/lib/notes/http";

// DynamoDB access requires the Node.js runtime (AWS SDK), not the Edge runtime.
export const runtime = "nodejs";
// Notes are per-user mutable data; never cache.
export const dynamic = "force-dynamic";

/** GET /api/notes?slug=<slug> — list the caller's notes for one document. */
export async function GET(request: NextRequest) {
  const sub = await getCurrentUserSub();
  if (!sub) {
    return fail("Unauthorized", 401);
  }

  const parsed = slugQuerySchema.safeParse({
    slug: request.nextUrl.searchParams.get("slug") ?? "",
  });
  if (!parsed.success) {
    return fail("Invalid slug", 400);
  }

  try {
    const notes = await listNotes(sub, parsed.data.slug);
    return ok(notes);
  } catch (error) {
    console.error("Failed to list notes:", error);
    return fail("Failed to list notes", 500);
  }
}

/** POST /api/notes — create a note for the caller. */
export async function POST(request: NextRequest) {
  const sub = await getCurrentUserSub();
  if (!sub) {
    return fail("Unauthorized", 401);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return fail("Invalid JSON body", 400);
  }

  const parsed = createNoteSchema.safeParse(payload);
  if (!parsed.success) {
    return fail("Invalid request body", 400);
  }

  try {
    const now = new Date().toISOString();
    const note = await createNote(sub, {
      noteId: randomUUID(),
      slug: parsed.data.slug,
      body: parsed.data.body,
      now,
    });
    return ok(note, 201);
  } catch (error) {
    console.error("Failed to create note:", error);
    return fail("Failed to create note", 500);
  }
}
