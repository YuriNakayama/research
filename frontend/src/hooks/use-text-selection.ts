"use client";

import { useCallback, useEffect, useState } from "react";

export type SelectionState = {
  range: Range;
  // Viewport coordinates of the selection's end, for positioning the button.
  x: number;
  y: number;
};

/**
 * Track a non-empty text selection inside `rootRef`.
 *
 * Only selections fully contained in the root count, so selecting UI chrome
 * elsewhere on the page never offers to create a note. The state clears as
 * soon as the selection collapses.
 */
export function useTextSelection(
  rootRef: React.RefObject<HTMLElement | null>,
): { selection: SelectionState | null; clear: () => void } {
  const [selection, setSelection] = useState<SelectionState | null>(null);

  const clear = useCallback(() => {
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  useEffect(() => {
    const onSelectionChange = () => {
      const root = rootRef.current;
      const sel = window.getSelection();
      if (!root || !sel || sel.isCollapsed || sel.rangeCount === 0) {
        setSelection(null);
        return;
      }
      const range = sel.getRangeAt(0);
      if (
        !root.contains(range.startContainer) ||
        !root.contains(range.endContainer) ||
        range.toString().trim().length === 0
      ) {
        setSelection(null);
        return;
      }
      // The last client rect is where the selection visually ends, which is
      // where a reader expects the affordance to appear.
      const rects = range.getClientRects();
      const rect = rects.length > 0 ? rects[rects.length - 1] : null;
      if (!rect) {
        setSelection(null);
        return;
      }
      // The live Range mutates as the selection changes; store a snapshot so
      // state stays immutable and the captured anchor matches what was seen.
      setSelection({ range: range.cloneRange(), x: rect.right, y: rect.bottom });
    };

    document.addEventListener("selectionchange", onSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", onSelectionChange);
  }, [rootRef]);

  return { selection, clear };
}
