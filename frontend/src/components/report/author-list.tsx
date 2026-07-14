"use client";

import { useState } from "react";

type AuthorListProps = {
  authors: string[];
  collapseThreshold?: number;
};

// Render authors as wrapping chips. Long lists (papers can have 20+ authors)
// collapse to the first N with a toggle, so the header stays scannable
// (progressive-disclosure) instead of becoming a wall of names.
export function AuthorList({
  authors,
  collapseThreshold = 8,
}: AuthorListProps) {
  const [expanded, setExpanded] = useState(false);

  const collapsible = authors.length > collapseThreshold;
  const visible =
    collapsible && !expanded ? authors.slice(0, collapseThreshold) : authors;
  const hiddenCount = authors.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((author) => (
        <span
          key={author}
          className="brutal-border border-[var(--border-primary)]/40 px-2 py-0.5 text-xs text-[var(--text-primary)]"
        >
          {author}
        </span>
      ))}
      {collapsible && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className="brutal-label brutal-border border-[var(--border-primary)] px-2 py-0.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)] cursor-pointer"
        >
          {expanded ? "− 折りたたむ" : `+ 他 ${hiddenCount} 名`}
        </button>
      )}
    </div>
  );
}
