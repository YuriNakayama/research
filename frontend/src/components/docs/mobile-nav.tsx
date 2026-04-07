"use client";

import { useState, useEffect } from "react";
import { DirectoryTree } from "./directory-tree";
import { Menu, X } from "lucide-react";
import type { TreeNode } from "@/lib/docs-content";

type MobileNavProps = {
  tree: TreeNode[];
  currentPath: string;
};

export function MobileNav({ tree, currentPath }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center brutal-border-strong brutal-shadow bg-[var(--accent-bg)] text-[var(--accent-text)] transition-transform active:translate-x-[2px] active:translate-y-[2px] lg:hidden cursor-pointer"
        aria-label="ナビゲーションを開く"
      >
        <Menu className="h-6 w-6" strokeWidth={2.5} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-[var(--surface-overlay)] lg:hidden"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[75vh] overflow-y-auto brutal-border-t border-[var(--border-primary)] bg-[var(--sidebar-bg)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between brutal-border-b border-[var(--border-primary)] bg-[var(--text-primary)] px-4 py-3">
              <p className="brutal-label text-[var(--text-inverse)]">
                [NAV] / INDEX
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="ナビゲーションを閉じる"
                className="flex h-7 w-7 items-center justify-center text-[var(--text-inverse)] transition-colors hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)] cursor-pointer"
              >
                <X className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
            <div className="px-3 py-4">
              <DirectoryTree nodes={tree} currentPath={currentPath} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
