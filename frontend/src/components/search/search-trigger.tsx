"use client";

import { Search } from "lucide-react";
import { useSearch } from "./search-provider";

// Header entry point for the command palette. Always reachable (search-accessible),
// with a visible ⌘K affordance on wider screens and an icon-only tap target on mobile.
export function SearchTrigger() {
  const { openPalette } = useSearch();

  return (
    <button
      type="button"
      onClick={openPalette}
      aria-label="リサーチを検索"
      aria-keyshortcuts="Meta+K Control+K"
      className="flex h-14 w-14 items-center justify-center gap-2 brutal-border-l border-[var(--border-primary)] text-[var(--header-text)] transition-colors hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)] cursor-pointer lg:w-auto lg:px-4"
    >
      <Search className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
      <span className="brutal-label hidden lg:inline">検索</span>
      <kbd className="brutal-label hidden shrink-0 brutal-border border-[var(--header-text)] px-1.5 py-0.5 lg:inline-block">
        ⌘K
      </kbd>
    </button>
  );
}
