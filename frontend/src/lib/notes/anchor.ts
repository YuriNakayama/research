import type { NoteAnchor } from "@/lib/notes/schema";
import { ANCHOR_CONTEXT_MAX, ANCHOR_QUOTE_MAX } from "@/lib/notes/schema";

/**
 * Locating a quoted range inside rendered document text.
 *
 * A selection anchor stores the quote plus the text immediately around it.
 * `research/**` is append-only, but bodies are not strictly immutable, so the
 * quote may have moved or changed by the time a note is read back. Resolution
 * degrades in stages rather than failing outright:
 *
 *   1. exact quote match (unique)             → high confidence
 *   2. exact match disambiguated by context   → high confidence
 *   3. context-guided fuzzy match             → low confidence
 *   4. nothing found                          → orphan; the note is kept and
 *                                               surfaced in the panel instead
 *
 * Everything here is pure string math over the document's text content, which
 * keeps it testable without a DOM.
 */

export type ResolvedRange = {
  start: number;
  end: number;
  // False when the match came from fuzzy search, so the UI can mark it.
  exact: boolean;
};

/**
 * Build the anchor payload for a selection.
 *
 * `start`/`end` index into `documentText`. The captured context is bounded by
 * ANCHOR_CONTEXT_MAX on each side and the quote by ANCHOR_QUOTE_MAX.
 */
export function buildSelectionAnchor(input: {
  documentText: string;
  start: number;
  end: number;
  headingId?: string;
}): Extract<NoteAnchor, { kind: "selection" }> | null {
  const { documentText, start, end, headingId } = input;
  if (start < 0 || end > documentText.length || start >= end) {
    return null;
  }
  const quote = documentText.slice(start, end).slice(0, ANCHOR_QUOTE_MAX);
  if (quote.trim().length === 0) {
    return null;
  }
  // The quote may have been truncated, so the suffix must start where the
  // stored quote actually ends — not at the original selection end, which
  // would capture text that never follows the quote and can never re-match.
  const quoteEnd = start + quote.length;
  return {
    kind: "selection",
    ...(headingId ? { headingId } : {}),
    quote,
    prefix: documentText.slice(Math.max(0, start - ANCHOR_CONTEXT_MAX), start),
    suffix: documentText.slice(quoteEnd, quoteEnd + ANCHOR_CONTEXT_MAX),
  };
}

function allIndexesOf(haystack: string, needle: string): number[] {
  if (needle.length === 0) return [];
  const found: number[] = [];
  let from = 0;
  for (;;) {
    const at = haystack.indexOf(needle, from);
    if (at === -1) break;
    found.push(at);
    // Overlapping occurrences are irrelevant here; step past this one.
    from = at + needle.length;
  }
  return found;
}

/**
 * Score a candidate by how much of the stored context it reproduces. Comparing
 * from the inside out means text nearest the quote counts first, which is what
 * survives an edit further away.
 */
function contextScore(
  documentText: string,
  candidate: number,
  quoteLength: number,
  prefix: string,
  suffix: string,
): number {
  const before = documentText.slice(
    Math.max(0, candidate - prefix.length),
    candidate,
  );
  const after = documentText.slice(
    candidate + quoteLength,
    candidate + quoteLength + suffix.length,
  );

  let score = 0;
  for (let i = 1; i <= Math.min(before.length, prefix.length); i += 1) {
    if (before[before.length - i] !== prefix[prefix.length - i]) break;
    score += 1;
  }
  for (let i = 0; i < Math.min(after.length, suffix.length); i += 1) {
    if (after[i] !== suffix[i]) break;
    score += 1;
  }
  return score;
}

/**
 * Find the longest prefix of `quote` that still occurs in the document.
 *
 * Used when the quote no longer matches in full — the head of a sentence is
 * usually still intact when the tail was edited. Returns null below a floor so
 * a couple of incidental characters never count as a match.
 */
function fuzzyMatch(
  documentText: string,
  quote: string,
  prefix: string,
  suffix: string,
): ResolvedRange | null {
  // Proportional only: a fixed character floor is too permissive for CJK text,
  // where a dozen characters can be a whole meaningful phrase and would match
  // unrelated passages. A wrong underline is more confusing than an orphan.
  const MIN_MATCH = Math.max(
    MIN_FUZZY_CHARS,
    Math.ceil(quote.length * FUZZY_RATIO),
  );
  for (let length = quote.length - 1; length >= MIN_MATCH; length -= 1) {
    const candidates = allIndexesOf(documentText, quote.slice(0, length));
    if (candidates.length === 0) continue;
    const best = pickByContext(
      documentText,
      candidates,
      length,
      prefix,
      suffix,
    );
    return { start: best.at, end: best.at + length, exact: false };
  }
  return null;
}

// Shortest partial quote accepted, and the fraction of the quote that must
// survive. Both guard against matching an unrelated passage.
const MIN_FUZZY_CHARS = 8;
const FUZZY_RATIO = 0.6;

/**
 * Choose the candidate whose surroundings best reproduce the stored context.
 * Scores are computed once per candidate rather than re-derived per comparison.
 */
function pickByContext(
  documentText: string,
  candidates: number[],
  quoteLength: number,
  prefix: string,
  suffix: string,
): { at: number; score: number } {
  let best = { at: candidates[0], score: -1 };
  for (const at of candidates) {
    const score = contextScore(
      documentText,
      at,
      quoteLength,
      prefix,
      suffix,
    );
    if (score > best.score) {
      best = { at, score };
    }
  }
  return best;
}

/**
 * Locate a selection anchor within the document's text.
 *
 * Returns null when the quote can no longer be found, which the caller treats
 * as an orphaned note.
 */
export function resolveSelectionAnchor(
  documentText: string,
  anchor: Extract<NoteAnchor, { kind: "selection" }>,
): ResolvedRange | null {
  const quote = anchor.quote;
  if (quote.length === 0) return null;

  const exact = allIndexesOf(documentText, quote);
  if (exact.length === 1) {
    return { start: exact[0], end: exact[0] + quote.length, exact: true };
  }
  if (exact.length > 1) {
    // Ambiguous: the same sentence appears more than once. Context decides.
    const best = pickByContext(
      documentText,
      exact,
      quote.length,
      anchor.prefix,
      anchor.suffix,
    );
    return {
      start: best.at,
      end: best.at + quote.length,
      // With no surrounding context reproduced, the occurrence was picked
      // arbitrarily — report it as inexact so the UI marks it provisional.
      exact: best.score > 0,
    };
  }

  return fuzzyMatch(documentText, quote, anchor.prefix, anchor.suffix);
}
