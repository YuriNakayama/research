"use client";

import { useState } from "react";
import { List, X } from "lucide-react";
import { Toc, type TocItem } from "./toc";

type MobileTocProps = {
  items: TocItem[];
};

export function MobileToc({ items }: MobileTocProps) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-bg)] text-[var(--accent-text)] shadow-lg lg:hidden cursor-pointer"
        aria-label="目次を開く"
      >
        <List className="h-5 w-5" strokeWidth={1.5} />
      </button>

      {/* Drawer overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-[var(--surface-overlay)] lg:hidden"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-y-auto rounded-t-2xl bg-[var(--surface-elevated)] p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--border-primary)]" />
            <div className="mb-6 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                目次
              </p>
              <button
                onClick={() => setOpen(false)}
                aria-label="目次を閉じる"
                className="rounded-[var(--radius-sm)] p-1 text-[var(--text-tertiary)] transition-colors duration-200 hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
            <Toc items={items} />
          </div>
        </div>
      )}
    </>
  );
}
