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
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-[var(--radius-md)] p-2 text-[var(--header-text-secondary)] transition-colors duration-200 hover:text-[var(--header-text)] hover:bg-white/10 cursor-pointer"
        aria-label="カラーパレット切替"
      >
        <Palette className="h-[18px] w-[18px]" strokeWidth={1.5} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-[var(--radius-lg)] border border-[var(--border-primary)] bg-[var(--surface-elevated)] p-2 shadow-lg">
          {PALETTES.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setPalette(p.id);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm transition-colors duration-150 cursor-pointer ${
                palette === p.id
                  ? "bg-[var(--accent-subtle-bg)] font-medium text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)]"
              }`}
            >
              <div className="flex -space-x-1">
                {p.colors.map((color, i) => (
                  <span
                    key={i}
                    className="inline-block h-4 w-4 rounded-full border border-white/30"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
