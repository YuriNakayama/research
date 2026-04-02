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
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-bg)] text-[var(--accent-text)] shadow-lg lg:hidden cursor-pointer"
        aria-label="ナビゲーションを開く"
      >
        <Menu className="h-5 w-5" strokeWidth={1.5} />
      </button>

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
                ナビゲーション
              </p>
              <button
                onClick={() => setOpen(false)}
                aria-label="ナビゲーションを閉じる"
                className="rounded-[var(--radius-sm)] p-1 text-[var(--text-tertiary)] transition-colors duration-200 hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
            <DirectoryTree nodes={tree} currentPath={currentPath} />
          </div>
        </div>
      )}
    </>
  );
}
