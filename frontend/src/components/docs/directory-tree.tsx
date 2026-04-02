"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TreeNode } from "@/lib/docs-content";
import { File, Folder, FolderOpen, ChevronRight } from "lucide-react";

type DirectoryTreeProps = {
  nodes: TreeNode[];
  currentPath: string;
};

export function DirectoryTree({ nodes, currentPath }: DirectoryTreeProps) {
  return (
    <nav aria-label="ドキュメントナビゲーション">
      <ul className="space-y-0.5">
        {nodes.map((node) => (
          <TreeItem key={node.path} node={node} currentPath={currentPath} depth={0} />
        ))}
      </ul>
    </nav>
  );
}

type TreeItemProps = {
  node: TreeNode;
  currentPath: string;
  depth: number;
};

function TreeItem({ node, currentPath, depth }: TreeItemProps) {
  const isActive = currentPath === node.path;
  const isAncestor = currentPath.startsWith(node.path + "/");
  const [expanded, setExpanded] = useState(isActive || isAncestor);

  if (!node.isDirectory) {
    return (
      <li>
        <Link
          href={node.path}
          className={cn(
            "flex items-center gap-2 truncate rounded-[var(--radius-sm)] px-2 py-1.5 text-sm transition-colors duration-200",
            isActive
              ? "border-l-2 border-[var(--sidebar-active-indicator)] bg-[var(--sidebar-active-bg)] font-medium text-[var(--sidebar-active-text)]"
              : "border-l-2 border-transparent text-[var(--sidebar-text-secondary)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-text)]",
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <File className="h-3.5 w-3.5 shrink-0 text-[var(--sidebar-text-secondary)]" strokeWidth={1.5} />
          <span className="truncate">{node.name}</span>
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex w-full items-center gap-2 truncate rounded-[var(--radius-sm)] px-2 py-1.5 text-sm transition-colors duration-200 cursor-pointer",
          isActive
            ? "border-l-2 border-[var(--sidebar-active-indicator)] bg-[var(--sidebar-active-bg)] font-medium text-[var(--sidebar-active-text)]"
            : "border-l-2 border-transparent text-[var(--sidebar-text-secondary)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-text)]",
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        aria-expanded={expanded}
      >
        {expanded ? (
          <FolderOpen className="h-3.5 w-3.5 shrink-0 text-[var(--accent-bg)]" strokeWidth={1.5} />
        ) : (
          <Folder className="h-3.5 w-3.5 shrink-0 text-[var(--sidebar-text-secondary)]" strokeWidth={1.5} />
        )}
        <span className="flex-1 truncate text-left">{node.name}</span>
        <ChevronRight
          className={cn(
            "h-3 w-3 shrink-0 text-[var(--sidebar-text-secondary)] transition-transform duration-200",
            expanded && "rotate-90",
          )}
          strokeWidth={1.5}
        />
      </button>
      {expanded && node.children.length > 0 && (
        <ul className="space-y-0.5">
          {node.children.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              currentPath={currentPath}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
