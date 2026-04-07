"use client";

import type { ReactNode } from "react";
import { DirectoryTree } from "./directory-tree";
import { MobileNav } from "./mobile-nav";
import type { TreeNode } from "@/lib/docs-content";

type DocsLayoutProps = {
  tree: TreeNode[];
  currentPath: string;
  children: ReactNode;
  toc?: ReactNode;
  mobileToc?: ReactNode;
};

export function DocsLayout({
  tree,
  currentPath,
  children,
  toc,
  mobileToc,
}: DocsLayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      {/* Sidebar - desktop */}
      <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto brutal-border-r border-[var(--border-primary)] bg-[var(--sidebar-bg)] lg:block">
        <div className="brutal-border-b border-[var(--border-primary)] bg-[var(--text-primary)] px-4 py-3">
          <p className="brutal-label text-[var(--text-inverse)]">
            [002] / INDEX
          </p>
        </div>
        <div className="px-3 py-4">
          <DirectoryTree nodes={tree} currentPath={currentPath} />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1">
        <main className="min-w-0 flex-1 px-6 py-10 md:px-10 lg:px-14">
          {children}
        </main>

        {/* ToC - desktop */}
        {toc && (
          <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto brutal-border-l border-[var(--border-primary)] bg-[var(--surface-primary)] xl:block">
            <div className="brutal-border-b border-[var(--border-primary)] bg-[var(--text-primary)] px-4 py-3">
              <p className="brutal-label text-[var(--text-inverse)]">
                [003] / TOC
              </p>
            </div>
            <div className="px-4 py-4">{toc}</div>
          </aside>
        )}
      </div>

      {/* Mobile navigation */}
      <MobileNav tree={tree} currentPath={currentPath} />
      {mobileToc ? <div>{mobileToc}</div> : null}
    </div>
  );
}
