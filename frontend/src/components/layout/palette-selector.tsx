"use client";

import { useState, useRef, useEffect } from "react";
import { Palette } from "lucide-react";
import { PALETTES } from "@/lib/palette";
import { usePalette } from "./palette-provider";

export function PaletteSelector() {
  const { palette, setPalette } = usePalette();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative h-14">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-14 w-14 items-center justify-center brutal-border-l border-[var(--border-primary)] text-[var(--header-text)] transition-colors hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)] cursor-pointer"
        aria-label="カラーパレット切替"
        aria-expanded={open}
      >
        <Palette className="h-[18px] w-[18px]" strokeWidth={2} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 w-60 brutal-border-strong brutal-shadow bg-[var(--surface-elevated)]">
          <div className="brutal-label brutal-border-b border-[var(--border-primary)] bg-[var(--text-primary)] px-3 py-2 text-[var(--text-inverse)]">
            SELECT PALETTE
          </div>
          {PALETTES.map((p) => {
            const isActive = palette === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setPalette(p.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 brutal-border-b border-[var(--border-primary)] px-3 py-3 text-left text-sm transition-colors cursor-pointer last:border-b-0 ${
                  isActive
                    ? "bg-[var(--accent-bg)] text-[var(--accent-text)]"
                    : "text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"
                }`}
              >
                <div className="flex shrink-0">
                  {p.colors.map((color, i) => (
                    <span
                      key={i}
                      className="inline-block h-5 w-5 border border-[var(--border-primary)]"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="brutal-label flex-1 truncate">{p.name}</span>
                {isActive && <span className="brutal-label">◆</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
