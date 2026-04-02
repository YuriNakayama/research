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
      <aside className="hidden w-60 shrink-0 overflow-y-auto border-r border-[var(--border-primary)] bg-[var(--sidebar-bg)] px-3 py-6 lg:block">
        <DirectoryTree nodes={tree} currentPath={currentPath} />
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1">
        <main className="min-w-0 flex-1 px-6 py-10 md:px-12 lg:px-16">
          {children}
        </main>

        {/* ToC - desktop */}
        {toc && (
          <aside className="hidden w-52 shrink-0 overflow-y-auto py-10 pr-4 xl:block">
            {toc}
          </aside>
        )}
      </div>

      {/* Mobile navigation */}
      <MobileNav tree={tree} currentPath={currentPath} />
      {mobileToc ? <div>{mobileToc}</div> : null}
    </div>
  );
}
