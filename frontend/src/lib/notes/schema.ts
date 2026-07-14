import { z } from "zod";

// Maximum note body length. Keeps a single DynamoDB item well within limits
// and bounds the payload a client can submit.
export const NOTE_BODY_MAX = 4000;

// A document slug as used by the viewer routing (`/research/<slug>`). Restrict
// to the character set that real slugs use so it can be safely embedded in the
// DynamoDB sort key without delimiter collisions.
const slugSchema = z
  .string()
  .min(1)
  .max(512)
  .regex(/^[A-Za-z0-9/_.-]+$/, "invalid slug");

const bodySchema = z.string().trim().min(1).max(NOTE_BODY_MAX);

// Payload for creating a note.
export const createNoteSchema = z.object({
  slug: slugSchema,
  body: bodySchema,
});

// Payload for updating a note (slug identifies the document partition of the
// sort key; the note id comes from the route param).
export const updateNoteSchema = z.object({
  slug: slugSchema,
  body: bodySchema,
});

// Query params for listing / deleting.
export const slugQuerySchema = z.object({
  slug: slugSchema,
});

// A note as returned to the client. Ownership (`sub`) is intentionally not
// exposed — it is always the caller.
export const noteSchema = z.object({
  noteId: z.string(),
  slug: z.string(),
  body: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Note = z.infer<typeof noteSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
