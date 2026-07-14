"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Fuse, { type IFuseOptions } from "fuse.js";
import type { SearchRecord } from "@/lib/search-index";
import { CommandPalette } from "./command-palette";

type SearchContextValue = {
  open: boolean;
  openPalette: () => void;
  closePalette: () => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

// Fuzzy match across the most identifying fields. Weights favor the title, then
// domain/headings, with authors/venue as weaker signals.
const FUSE_OPTIONS: IFuseOptions<SearchRecord> = {
  keys: [
    { name: "title", weight: 0.5 },
    { name: "domain", weight: 0.2 },
    { name: "headings", weight: 0.15 },
    { name: "authors", weight: 0.1 },
    { name: "venue", weight: 0.05 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  minMatchCharLength: 2,
};

type SearchProviderProps = {
  records: SearchRecord[];
  children: ReactNode;
};

export function SearchProvider({ records, children }: SearchProviderProps) {
  const [open, setOpen] = useState(false);

  const openPalette = useCallback(() => setOpen(true), []);
  const closePalette = useCallback(() => setOpen(false), []);

  // Build the Fuse index once per record set.
  const fuse = useMemo(() => new Fuse(records, FUSE_OPTIONS), [records]);

  // Global ⌘K / Ctrl+K shortcut. `/` also opens when not typing in a field.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isCmdK =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isCmdK) {
        event.preventDefault();
        setOpen((prev) => !prev);
        return;
      }

      if (event.key === "/" && !isEditableTarget(event.target)) {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = useMemo<SearchContextValue>(
    () => ({ open, openPalette, closePalette }),
    [open, openPalette, closePalette],
  );

  return (
    <SearchContext.Provider value={value}>
      {children}
      <CommandPalette
        open={open}
        onClose={closePalette}
        search={(query) => fuse.search(query, { limit: 20 }).map((r) => r.item)}
        totalCount={records.length}
      />
    </SearchContext.Provider>
  );
}

export function useSearch(): SearchContextValue {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}

// True when focus is in an input/textarea/contenteditable, so `/` doesn't
// hijack real typing.
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}
