"use client";

import Link from "next/link";
import { useState } from "react";
import type { TagIndex } from "@/lib/home-feed";

type TagBrowserProps = {
  index: TagIndex;
};

// Browse domains by tag. Research starts from arbitrary angles, so domains are
// not arranged in a category tree; tags (maintained by the housekeeping skill)
// are the cross-cutting way in. Selecting a tag narrows the list to the domains
// carrying it; selecting it again clears the filter.
export function TagBrowser({ index }: TagBrowserProps) {
  const [selected, setSelected] = useState<string | null>(null);
  if (index.tags.length === 0) return null;

  const domains = selected
    ? index.domains.filter((d) => d.tags.some((t) => t.id === selected))
    : index.domains;

  return (
    <section className="mt-10" data-testid="tag-browser">
      <h2 className="brutal-label mb-3 text-[var(--text-tertiary)]">{"// TAGS"}</h2>

      <div className="flex flex-wrap gap-2" role="group" aria-label="タグで絞り込む">
        {index.tags.map((tag) => {
          const active = tag.id === selected;
          return (
            <button
              key={tag.id}
              type="button"
              aria-pressed={active}
              data-tag={tag.id}
              onClick={() => setSelected(active ? null : tag.id)}
              className={`brutal-border brutal-label px-2 py-1 tabular-nums transition-colors ${
                active
                  ? "bg-[var(--text-primary)] text-[var(--text-inverse)]"
                  : "bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              #{tag.label} <span className="text-[var(--text-tertiary)]">{tag.count}</span>
            </button>
          );
        })}
      </div>

      <ul className="mt-4 flex flex-col gap-2" data-testid="tag-browser-domains">
        {domains.map((d) => (
          <li key={d.domain} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <Link
              href={d.href}
              className="brutal-display text-sm text-[var(--text-primary)] hover:text-[var(--accent-text)]"
            >
              {d.displayName}
            </Link>
            <span className="brutal-label text-[var(--text-tertiary)]">
              {d.tags.map((t) => `#${t.label}`).join(" ")}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
