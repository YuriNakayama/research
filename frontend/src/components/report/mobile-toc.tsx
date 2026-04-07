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
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center brutal-border-strong brutal-shadow bg-[var(--surface-elevated)] text-[var(--text-primary)] transition-transform active:translate-x-[2px] active:translate-y-[2px] lg:hidden cursor-pointer"
        aria-label="目次を開く"
      >
        <List className="h-6 w-6" strokeWidth={2.5} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-[var(--surface-overlay)] lg:hidden"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[75vh] overflow-y-auto brutal-border-t border-[var(--border-primary)] bg-[var(--surface-elevated)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between brutal-border-b border-[var(--border-primary)] bg-[var(--text-primary)] px-4 py-3">
              <p className="brutal-label text-[var(--text-inverse)]">
                [TOC] / CONTENTS
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="目次を閉じる"
                className="flex h-7 w-7 items-center justify-center text-[var(--text-inverse)] transition-colors hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)] cursor-pointer"
              >
                <X className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
            <div className="px-4 py-4">
              <Toc items={items} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
