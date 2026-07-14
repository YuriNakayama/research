"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft, FileText } from "lucide-react";
import type { SearchRecord } from "@/lib/search-index";

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
  search: (query: string) => SearchRecord[];
  totalCount: number;
};

export function CommandPalette({
  open,
  onClose,
  search,
  totalCount,
}: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];
    return search(trimmed);
  }, [query, search]);

  // Reset transient state whenever the palette is opened, and focus the input.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    // Focus after paint so the element exists.
    const id = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  // Keep the active index in range as results change.
  useEffect(() => {
    setActiveIndex((prev) => (prev >= results.length ? 0 : prev));
  }, [results.length]);

  // Scroll the active row into view.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector<HTMLElement>('[data-active="true"]');
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  const commit = (record: SearchRecord | undefined) => {
    if (!record) return;
    onClose();
    router.push(record.href);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (results.length ? (prev + 1) % results.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) =>
        results.length ? (prev - 1 + results.length) % results.length : 0,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      commit(results[activeIndex]);
    }
  };

  const showEmpty = query.trim().length >= 2 && results.length === 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="リサーチ横断検索"
    >
      {/* Scrim */}
      <button
        type="button"
        aria-label="検索を閉じる"
        className="absolute inset-0 bg-[var(--border-primary)]/50"
        onClick={onClose}
        tabIndex={-1}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-2xl brutal-border-strong border-[var(--border-primary)] brutal-shadow-lg bg-[var(--surface-primary)]"
        onKeyDown={onKeyDown}
      >
        {/* Search input row */}
        <div className="flex items-center gap-3 brutal-border-b border-[var(--border-primary)] px-4">
          <Search
            className="h-5 w-5 shrink-0 text-[var(--text-secondary)]"
            strokeWidth={2}
            aria-hidden
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`${totalCount} 件のレポートを検索…`}
            className="h-14 w-full bg-transparent text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none"
            aria-label="検索キーワード"
            aria-controls="search-results"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="brutal-label hidden shrink-0 brutal-border border-[var(--border-primary)] px-2 py-1 text-[var(--text-secondary)] sm:inline-block">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <ul
          ref={listRef}
          id="search-results"
          role="listbox"
          className="scroll-contain max-h-[50vh] overflow-y-auto"
        >
          {results.map((record, index) => {
            const active = index === activeIndex;
            return (
              <li key={record.href} role="option" aria-selected={active}>
                <button
                  type="button"
                  data-active={active}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => commit(record)}
                  className={`flex w-full items-center gap-3 border-b border-[var(--border-primary)]/30 px-4 py-3 text-left transition-colors ${
                    active
                      ? "bg-[var(--accent-bg)] text-[var(--accent-text)]"
                      : "text-[var(--text-primary)]"
                  }`}
                >
                  <FileText
                    className="h-4 w-4 shrink-0"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {record.title}
                    </span>
                    <span
                      className={`brutal-label block truncate ${
                        active
                          ? "text-[var(--accent-text)]"
                          : "text-[var(--text-secondary)]"
                      }`}
                    >
                      {[record.domain, record.type, record.year]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                  {active && (
                    <CornerDownLeft
                      className="h-4 w-4 shrink-0"
                      strokeWidth={2}
                      aria-hidden
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Empty / hint states */}
        {showEmpty && (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-[var(--text-primary)]">
              「{query.trim()}」に一致するレポートはありません
            </p>
            <p className="brutal-label mt-2 text-[var(--text-secondary)]">
              別のキーワードやドメイン名でお試しください
            </p>
          </div>
        )}
        {query.trim().length < 2 && (
          <div className="px-4 py-10 text-center">
            <p className="brutal-label text-[var(--text-secondary)]">
              タイトル・ドメイン・著者・見出しを横断検索
            </p>
          </div>
        )}

        {/* Live region for screen readers */}
        <span className="sr-only" aria-live="polite">
          {query.trim().length >= 2
            ? `${results.length} 件の結果`
            : ""}
        </span>
      </div>
    </div>
  );
}
