import { describe, it, expect } from "vitest";
import { buildSelectionAnchor, resolveSelectionAnchor } from "@/lib/notes/anchor";
import { ANCHOR_CONTEXT_MAX, ANCHOR_QUOTE_MAX } from "@/lib/notes/schema";

const DOC =
  "This method is effective for uplift modeling. " +
  "The prerequisite is a clean dataset. " +
  "This method is effective for other cases too.";

/** Build an anchor for the first occurrence of `quote` in `doc`. */
function anchorFor(doc: string, quote: string, occurrence = 0) {
  let start = -1;
  for (let i = 0; i <= occurrence; i += 1) {
    start = doc.indexOf(quote, start + 1);
  }
  const anchor = buildSelectionAnchor({
    documentText: doc,
    start,
    end: start + quote.length,
  });
  if (!anchor) throw new Error("failed to build anchor");
  return { anchor, start };
}

describe("buildSelectionAnchor", () => {
  it("captures the quote and its surrounding context", () => {
    const { anchor } = anchorFor(DOC, "The prerequisite is a clean dataset");
    expect(anchor.quote).toBe("The prerequisite is a clean dataset");
    expect(DOC).toContain(anchor.prefix + anchor.quote + anchor.suffix);
  });

  it("rejects empty, inverted, and out-of-bounds ranges", () => {
    expect(
      buildSelectionAnchor({ documentText: DOC, start: 5, end: 5 }),
    ).toBeNull();
    expect(
      buildSelectionAnchor({ documentText: DOC, start: 10, end: 4 }),
    ).toBeNull();
    expect(
      buildSelectionAnchor({ documentText: DOC, start: 0, end: 99999 }),
    ).toBeNull();
  });

  it("rejects a whitespace-only selection", () => {
    expect(
      buildSelectionAnchor({ documentText: "a    b", start: 1, end: 5 }),
    ).toBeNull();
  });

  // Regression: the suffix used to be read from the untruncated selection end,
  // so an over-long quote stored a suffix that never follows it and could
  // never contribute to re-matching.
  it("takes the suffix from the truncated quote's end", () => {
    const long = "A".repeat(ANCHOR_QUOTE_MAX + 100);
    const tail = "B".repeat(ANCHOR_CONTEXT_MAX);
    const doc = `intro ${long}${tail}`;
    const start = doc.indexOf(long);
    const anchor = buildSelectionAnchor({
      documentText: doc,
      start,
      end: start + long.length,
    });
    expect(anchor).not.toBeNull();
    expect(anchor!.quote.length).toBe(ANCHOR_QUOTE_MAX);
    // The suffix must be the text immediately after the STORED quote.
    expect(anchor!.suffix[0]).toBe("A");
    expect(doc).toContain(anchor!.quote + anchor!.suffix);
  });
});

describe("resolveSelectionAnchor", () => {
  it("finds an unchanged quote exactly", () => {
    const { anchor, start } = anchorFor(DOC, "The prerequisite is a clean dataset");
    const resolved = resolveSelectionAnchor(DOC, anchor);
    expect(resolved).toEqual({
      start,
      end: start + anchor.quote.length,
      exact: true,
    });
  });

  it("still matches after unrelated text is prepended", () => {
    const { anchor } = anchorFor(DOC, "The prerequisite is a clean dataset");
    const shifted = `A newly added introductory paragraph.\n\n${DOC}`;
    const resolved = resolveSelectionAnchor(shifted, anchor);
    expect(resolved?.exact).toBe(true);
    expect(shifted.slice(resolved!.start, resolved!.end)).toBe(anchor.quote);
  });

  it("uses context to pick the right one of several identical quotes", () => {
    const quote = "This method is effective";
    const { anchor, start } = anchorFor(DOC, quote, 1); // the SECOND occurrence
    const resolved = resolveSelectionAnchor(DOC, anchor);
    expect(resolved?.start).toBe(start);
  });

  it("reports an arbitrary pick among identical quotes as inexact", () => {
    // Same quote twice with identical surroundings: nothing can disambiguate.
    const doc = "xx same text yy xx same text yy";
    const anchor = {
      kind: "selection" as const,
      quote: "same text",
      prefix: "zzzz",
      suffix: "zzzz",
    };
    const resolved = resolveSelectionAnchor(doc, anchor);
    expect(resolved).not.toBeNull();
    expect(resolved!.exact).toBe(false);
  });

  it("recovers the passage when its tail was edited", () => {
    const { anchor } = anchorFor(DOC, "The prerequisite is a clean dataset");
    const edited = DOC.replace("a clean dataset", "a well-curated dataset");
    const resolved = resolveSelectionAnchor(edited, anchor);
    expect(resolved).not.toBeNull();
    expect(resolved!.exact).toBe(false);
    expect(edited.slice(resolved!.start, resolved!.end)).toContain(
      "The prerequisite is",
    );
  });

  it("returns null when the passage is gone entirely", () => {
    const { anchor } = anchorFor(DOC, "The prerequisite is a clean dataset");
    const rewritten = "Totally unrelated content with nothing in common here.";
    expect(resolveSelectionAnchor(rewritten, anchor)).toBeNull();
  });

  it("does not match a short fragment of an unrelated passage", () => {
    const anchor = {
      kind: "selection" as const,
      quote: "the quick brown fox jumps over the lazy dog",
      prefix: "",
      suffix: "",
    };
    // Shares only a few leading characters — must not be accepted.
    expect(resolveSelectionAnchor("the queen waved.", anchor)).toBeNull();
  });

  it("terminates on a large document", () => {
    const big = `${"filler sentence. ".repeat(20000)}needle passage here.`;
    const { anchor } = anchorFor(big, "needle passage here");
    const resolved = resolveSelectionAnchor(big, anchor);
    expect(resolved?.exact).toBe(true);
  });
});
