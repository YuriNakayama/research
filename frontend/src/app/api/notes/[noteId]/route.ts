import type { NextRequest } from "next/server";
import { getCurrentUserSub } from "@/lib/notes/auth";
import { updateNoteSchema, slugQuerySchema } from "@/lib/notes/schema";
import { updateNote, deleteNote } from "@/lib/notes/dynamo";
import { ok, fail } from "@/lib/notes/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ noteId: string }> };

/** PUT /api/notes/<noteId> — update the body of the caller's note. */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  const sub = await getCurrentUserSub();
  if (!sub) {
    return fail("Unauthorized", 401);
  }

  const { noteId } = await params;
  if (!noteId) {
    return fail("Missing note id", 400);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return fail("Invalid JSON body", 400);
  }

  const parsed = updateNoteSchema.safeParse(payload);
  if (!parsed.success) {
    return fail("Invalid request body", 400);
  }

  try {
    const note = await updateNote(sub, {
      noteId,
      slug: parsed.data.slug,
      body: parsed.data.body,
      now: new Date().toISOString(),
    });
    if (!note) {
      return fail("Note not found", 404);
    }
    return ok(note);
  } catch (error) {
    console.error("Failed to update note:", error);
    return fail("Failed to update note", 500);
  }
}

/** DELETE /api/notes/<noteId>?slug=<slug> — delete the caller's note. */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const sub = await getCurrentUserSub();
  if (!sub) {
    return fail("Unauthorized", 401);
  }

  const { noteId } = await params;
  if (!noteId) {
    return fail("Missing note id", 400);
  }

  const parsed = slugQuerySchema.safeParse({
    slug: request.nextUrl.searchParams.get("slug") ?? "",
  });
  if (!parsed.success) {
    return fail("Invalid slug", 400);
  }

  try {
    const deleted = await deleteNote(sub, { noteId, slug: parsed.data.slug });
    if (!deleted) {
      return fail("Note not found", 404);
    }
    return ok({ noteId });
  } catch (error) {
    console.error("Failed to delete note:", error);
    return fail("Failed to delete note", 500);
  }
}
