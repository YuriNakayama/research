import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import type { Note, NoteAnchor } from "@/lib/notes/schema";
import { noteAnchorSchema } from "@/lib/notes/schema";

// Table + region are injected by the Amplify runtime (see infra/modules/*).
const TABLE_NAME = process.env.NOTES_TABLE_NAME ?? "";
const REGION = process.env.NEXT_PUBLIC_AWS_REGION ?? "ap-northeast-1";

// Reuse a single client across warm invocations. The SDK resolves credentials
// from the Amplify compute role at runtime.
let docClient: DynamoDBDocumentClient | null = null;

function getClient(): DynamoDBDocumentClient {
  if (!TABLE_NAME) {
    throw new Error("NOTES_TABLE_NAME is not configured");
  }
  if (!docClient) {
    docClient = DynamoDBDocumentClient.from(
      new DynamoDBClient({ region: REGION }),
      { marshallOptions: { removeUndefinedValues: true } },
    );
  }
  return docClient;
}

const userPk = (sub: string): string => `USER#${sub}`;
const docSkPrefix = (slug: string): string => `DOC#${slug}#`;
const noteSk = (slug: string, noteId: string): string =>
  `${docSkPrefix(slug)}${noteId}`;

// Raw item shape stored in DynamoDB.
type NoteItem = {
  pk: string;
  sk: string;
  noteId: string;
  slug: string;
  body: string;
  // Absent on notes created before anchoring existed — those are page-level.
  anchor?: unknown;
  createdAt: string;
  updatedAt: string;
};

/**
 * Re-validate a stored anchor on the way out.
 *
 * Items written by an older or newer revision of this code may carry an anchor
 * shape this build does not understand. Dropping it degrades the note to
 * page-level rather than failing the whole list request.
 */
function parseAnchor(raw: unknown): NoteAnchor | undefined {
  if (raw === undefined || raw === null) {
    return undefined;
  }
  const parsed = noteAnchorSchema.safeParse(raw);
  return parsed.success ? parsed.data : undefined;
}

function toNote(item: NoteItem): Note {
  const anchor = parseAnchor(item.anchor);
  return {
    noteId: item.noteId,
    slug: item.slug,
    body: item.body,
    ...(anchor ? { anchor } : {}),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

/** List one user's notes for a single document, newest first. */
export async function listNotes(sub: string, slug: string): Promise<Note[]> {
  const result = await getClient().send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :skPrefix)",
      ExpressionAttributeValues: {
        ":pk": userPk(sub),
        ":skPrefix": docSkPrefix(slug),
      },
    }),
  );
  const items = (result.Items ?? []) as NoteItem[];
  return items
    .map(toNote)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Create a note owned by `sub`. `noteId`/timestamps are caller-supplied to keep this layer deterministic. */
export async function createNote(
  sub: string,
  input: {
    noteId: string;
    slug: string;
    body: string;
    anchor?: NoteAnchor;
    now: string;
  },
): Promise<Note> {
  const item: NoteItem = {
    pk: userPk(sub),
    sk: noteSk(input.slug, input.noteId),
    noteId: input.noteId,
    slug: input.slug,
    body: input.body,
    // Omitted entirely when absent — page-level notes carry no anchor
    // attribute, matching what pre-anchoring items look like.
    ...(input.anchor ? { anchor: input.anchor } : {}),
    createdAt: input.now,
    updatedAt: input.now,
  };
  await getClient().send(
    new PutCommand({ TableName: TABLE_NAME, Item: item }),
  );
  return toNote(item);
}

/**
 * Update a note's body. The condition ensures the item already exists under the
 * caller's partition — a user can never touch another user's note because the
 * pk is derived from their own `sub`. Returns null if no such note exists.
 */
export async function updateNote(
  sub: string,
  input: { noteId: string; slug: string; body: string; now: string },
): Promise<Note | null> {
  try {
    const result = await getClient().send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { pk: userPk(sub), sk: noteSk(input.slug, input.noteId) },
        ConditionExpression: "attribute_exists(pk)",
        UpdateExpression: "SET body = :body, updatedAt = :now",
        ExpressionAttributeValues: {
          ":body": input.body,
          ":now": input.now,
        },
        ReturnValues: "ALL_NEW",
      }),
    );
    return result.Attributes ? toNote(result.Attributes as NoteItem) : null;
  } catch (error) {
    if (isConditionalCheckFailed(error)) {
      return null;
    }
    throw error;
  }
}

/** Delete a note. Returns false when the note did not exist. */
export async function deleteNote(
  sub: string,
  input: { noteId: string; slug: string },
): Promise<boolean> {
  try {
    await getClient().send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { pk: userPk(sub), sk: noteSk(input.slug, input.noteId) },
        ConditionExpression: "attribute_exists(pk)",
      }),
    );
    return true;
  } catch (error) {
    if (isConditionalCheckFailed(error)) {
      return false;
    }
    throw error;
  }
}

function isConditionalCheckFailed(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name: string }).name === "ConditionalCheckFailedException"
  );
}
