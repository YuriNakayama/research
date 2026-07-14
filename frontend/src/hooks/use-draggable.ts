"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Position = { x: number; y: number };

type UseDraggableOptions = {
  // localStorage key to persist the position across sessions.
  storageKey: string;
  // Fallback position (px from the top-left) when nothing is stored yet.
  defaultPosition: Position;
  // Size of the draggable element, used to keep it within the viewport.
  size: { width: number; height: number };
};

type UseDraggableResult = {
  position: Position;
  dragging: boolean;
  // Spread onto the drag handle element.
  handleProps: {
    onPointerDown: (event: React.PointerEvent) => void;
  };
  // True once the position has been read from storage / defaulted, so the
  // consumer can avoid rendering at (0,0) on the first paint.
  ready: boolean;
};

function readStored(key: string): Position | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<Position>;
    if (typeof parsed.x === "number" && typeof parsed.y === "number") {
      return { x: parsed.x, y: parsed.y };
    }
  } catch {
    // Ignore malformed storage — fall back to the default.
  }
  return null;
}

// Clamp a position so the element stays fully within the viewport, leaving a
// small margin. Guards against off-screen positions after a resize / rotation.
function clampToViewport(
  pos: Position,
  size: { width: number; height: number },
): Position {
  const margin = 8;
  const maxX = Math.max(margin, window.innerWidth - size.width - margin);
  const maxY = Math.max(margin, window.innerHeight - size.height - margin);
  return {
    x: Math.min(Math.max(margin, pos.x), maxX),
    y: Math.min(Math.max(margin, pos.y), maxY),
  };
}

/**
 * Make an element draggable via pointer events (mouse + touch), persisting its
 * position to localStorage and keeping it inside the viewport.
 */
export function useDraggable({
  storageKey,
  defaultPosition,
  size,
}: UseDraggableOptions): UseDraggableResult {
  const [position, setPosition] = useState<Position>(defaultPosition);
  const [dragging, setDragging] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);

  // Offset between the pointer and the element's top-left at drag start.
  const grabOffset = useRef<Position>({ x: 0, y: 0 });
  const moved = useRef<boolean>(false);

  // Initialize from storage (or default), clamped to the current viewport.
  useEffect(() => {
    const initial = readStored(storageKey) ?? defaultPosition;
    setPosition(clampToViewport(initial, size));
    setReady(true);
    // Intentionally run once on mount; defaultPosition/size are stable enough
    // for this widget and re-clamping on every change is handled by the resize
    // listener below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Re-clamp when the viewport changes so the widget never drifts off-screen.
  useEffect(() => {
    const onResize = () => setPosition((prev) => clampToViewport(prev, size));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [size]);

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      moved.current = true;
      const next = clampToViewport(
        {
          x: event.clientX - grabOffset.current.x,
          y: event.clientY - grabOffset.current.y,
        },
        size,
      );
      setPosition(next);
    },
    [size],
  );

  const onPointerUp = useCallback(() => {
    setDragging(false);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    setPosition((prev) => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(prev));
      } catch {
        // Persistence is best-effort.
      }
      return prev;
    });
  }, [onPointerMove, storageKey]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      // Only start dragging on primary button / touch.
      if (event.button !== 0) {
        return;
      }
      moved.current = false;
      grabOffset.current = {
        x: event.clientX - position.x,
        y: event.clientY - position.y,
      };
      setDragging(true);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [position.x, position.y, onPointerMove, onPointerUp],
  );

  return {
    position,
    dragging,
    ready,
    handleProps: { onPointerDown },
  };
}
