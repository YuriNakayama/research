"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  useColumnWidths,
  MIN_COLUMN_WIDTH,
} from "@/hooks/use-column-widths";

type ResizableTableProps = ComponentPropsWithoutRef<"table"> & {
  /** Unique key per table per page (docs slug + table index). */
  storageKey: string;
};

const KEYBOARD_STEP = 16;

/**
 * A Markdown-rendered table with user-resizable columns.
 *
 * Column widths are measured from the natural (auto) layout on mount, then the
 * table switches to `table-layout: fixed` with a `<colgroup>` so each column
 * width is authoritative. Drag handles sit on every internal column boundary
 * (pointer + touch), and each handle is keyboard-operable (←/→). Widths persist
 * per page via `useColumnWidths`.
 *
 * Mobile keeps horizontal scroll: the container is `overflow-x: auto`, and when
 * columns are widened the table simply overflows and scrolls.
 */
export function ResizableTable({
  storageKey,
  children,
  ...props
}: ResizableTableProps) {
  const tableRef = useRef<HTMLTableElement>(null);
  const [columnCount, setColumnCount] = useState(0);
  const { widths, setColumnWidth, initializeWidths } = useColumnWidths(
    storageKey,
    columnCount,
  );

  // Track the drag in a ref so pointer handlers stay stable across renders.
  const dragRef = useRef<{ index: number; startX: number; startWidth: number } | null>(
    null,
  );

  const measureColumns = useCallback((): number[] => {
    const table = tableRef.current;
    if (!table) return [];
    const headerRow = table.tHead?.rows[0] ?? table.rows[0];
    if (!headerRow) return [];
    return Array.from(headerRow.cells).map((cell) =>
      Math.max(MIN_COLUMN_WIDTH, Math.round(cell.getBoundingClientRect().width)),
    );
  }, []);

  // On mount capture the natural column widths, then switch to fixed layout.
  // useEffect (not useLayoutEffect) to avoid the SSR warning; the brief
  // auto→fixed transition is imperceptible and matches the storage-lazy model.
  useEffect(() => {
    const initial = measureColumns();
    if (initial.length === 0) return;
    setColumnCount(initial.length);
    initializeWidths(initial);
  }, [measureColumns, initializeWidths]);

  const applyDrag = useCallback(
    (clientX: number) => {
      const drag = dragRef.current;
      if (!drag) return;
      const delta = clientX - drag.startX;
      setColumnWidth(drag.index, drag.startWidth + delta);
    },
    [setColumnWidth],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleMove = (e: PointerEvent) => {
      if (!dragRef.current) return;
      e.preventDefault();
      applyDrag(e.clientX);
    };
    const handleUp = () => {
      dragRef.current = null;
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
    window.addEventListener("pointermove", handleMove, { passive: false });
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [applyDrag]);

  const startDrag = useCallback(
    (index: number, e: ReactPointerEvent<HTMLSpanElement>) => {
      const current = widths?.[index];
      if (current === undefined) return;
      e.preventDefault();
      dragRef.current = { index, startX: e.clientX, startWidth: current };
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    },
    [widths],
  );

  const handleKey = useCallback(
    (index: number, e: ReactKeyboardEvent<HTMLSpanElement>) => {
      const current = widths?.[index];
      if (current === undefined) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setColumnWidth(index, current - KEYBOARD_STEP);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setColumnWidth(index, current + KEYBOARD_STEP);
      }
    },
    [widths, setColumnWidth],
  );

  const hasWidths = widths !== null && widths.length === columnCount && columnCount > 0;

  return (
    <div className="resizable-table-scroll overflow-x-auto" data-resizable-table="">
      <table
        ref={tableRef}
        {...props}
        style={{
          ...props.style,
          tableLayout: hasWidths ? "fixed" : "auto",
          width: hasWidths ? "max-content" : props.style?.width,
        }}
      >
        {hasWidths && (
          <colgroup>
            {widths.map((w, i) => (
              <col key={i} style={{ width: `${w}px` }} />
            ))}
          </colgroup>
        )}
        {children}
      </table>

      {hasWidths && (
        <div className="resizable-table-handles" aria-hidden={false}>
          {widths.map((_w, i) => {
            // A handle sits on the RIGHT edge of every column except the last.
            if (i === widths.length - 1) return null;
            const left = widths
              .slice(0, i + 1)
              .reduce((sum, w) => sum + w, 0);
            return (
              <span
                key={i}
                role="separator"
                aria-orientation="vertical"
                aria-label={`列 ${i + 1} の幅を変更`}
                tabIndex={0}
                className="resizable-table-handle"
                style={{ left: `${left}px` }}
                onPointerDown={(e) => startDrag(i, e)}
                onKeyDown={(e) => handleKey(i, e)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
