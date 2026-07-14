"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_PREFIX = "rt-cols";
const MIN_COLUMN_WIDTH = 48;

/**
 * Per-page persisted column widths for a resizable table.
 *
 * Widths are stored in localStorage under `rt-cols:<storageKey>` as an array of
 * pixel numbers (index = column). The storageKey is expected to be unique per
 * table per page (docs slug + table index) so two tables never collide.
 *
 * The hook is intentionally storage-lazy: until the user drags (or a stored
 * value exists) `widths` is `null`, and the table falls back to its natural
 * auto layout. Once a width array exists the caller switches to fixed layout.
 */
export type UseColumnWidthsResult = {
  widths: readonly number[] | null;
  setColumnWidth: (index: number, width: number) => void;
  initializeWidths: (initial: readonly number[]) => void;
};

function readStored(storageKey: string, columnCount: number): number[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}:${storageKey}`);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      Array.isArray(parsed) &&
      parsed.length === columnCount &&
      parsed.every((n): n is number => typeof n === "number" && Number.isFinite(n))
    ) {
      return parsed.map((n) => Math.max(MIN_COLUMN_WIDTH, n));
    }
  } catch {
    // Corrupt or unavailable storage — fall back to auto layout.
  }
  return null;
}

export function useColumnWidths(
  storageKey: string,
  columnCount: number,
): UseColumnWidthsResult {
  const [widths, setWidths] = useState<readonly number[] | null>(null);

  // Hydrate from storage on mount (client only) to avoid SSR mismatch.
  useEffect(() => {
    const stored = readStored(storageKey, columnCount);
    if (stored) setWidths(stored);
  }, [storageKey, columnCount]);

  const persist = useCallback(
    (next: readonly number[]) => {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(
          `${STORAGE_PREFIX}:${storageKey}`,
          JSON.stringify(next),
        );
      } catch {
        // Ignore quota / privacy-mode failures — resize still works in-session.
      }
    },
    [storageKey],
  );

  const initializeWidths = useCallback(
    (initial: readonly number[]) => {
      setWidths((current) => {
        if (current) return current; // storage or a prior drag already won
        return initial.map((n) => Math.max(MIN_COLUMN_WIDTH, n));
      });
    },
    [],
  );

  const setColumnWidth = useCallback(
    (index: number, width: number) => {
      setWidths((current) => {
        const base =
          current ?? Array.from({ length: columnCount }, () => MIN_COLUMN_WIDTH);
        const next = base.map((w, i) =>
          i === index ? Math.max(MIN_COLUMN_WIDTH, Math.round(width)) : w,
        );
        persist(next);
        return next;
      });
    },
    [columnCount, persist],
  );

  return useMemo(
    () => ({ widths, setColumnWidth, initializeWidths }),
    [widths, setColumnWidth, initializeWidths],
  );
}

export { MIN_COLUMN_WIDTH };
