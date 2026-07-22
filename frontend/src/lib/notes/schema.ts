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

// Bounds for the text captured around a selection anchor. Long enough to
// re-locate a quote after small edits, short enough to keep the item compact.
export const ANCHOR_QUOTE_MAX = 300;
export const ANCHOR_CONTEXT_MAX = 64;

const headingIdSchema = z.string().min(1).max(256);

/**
 * Where a note is attached within a document.
 *
 * Absent (`undefined`) means the note belongs to the page as a whole — this is
 * what every note created before anchoring existed looks like, so the field is
 * optional on purpose and no migration is required.
 *
 * - `heading`: anchored to a heading id produced by lib/toc's slugger. Stable
 *   as long as the heading text is unchanged.
 * - `selection`: anchored to a quoted range. `prefix`/`suffix` are the
 *   surrounding text, used to re-locate the quote when the body has shifted;
 *   `headingId` narrows the search to the enclosing section.
 */
export const noteAnchorSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("heading"),
    headingId: headingIdSchema,
    headingText: z.string().min(1).max(512),
  }),
  z.object({
    kind: z.literal("selection"),
    headingId: headingIdSchema.optional(),
    quote: z.string().min(1).max(ANCHOR_QUOTE_MAX),
    prefix: z.string().max(ANCHOR_CONTEXT_MAX),
    suffix: z.string().max(ANCHOR_CONTEXT_MAX),
  }),
]);

// Payload for creating a note.
export const createNoteSchema = z.object({
  slug: slugSchema,
  body: bodySchema,
  anchor: noteAnchorSchema.optional(),
});

// Payload for updating a note (slug identifies the document partition of the
// sort key; the note id comes from the route param). The anchor is immutable
// once set — editing the body must never silently re-point a note.
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
  anchor: noteAnchorSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Note = z.infer<typeof noteSchema>;
export type NoteAnchor = z.infer<typeof noteAnchorSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
