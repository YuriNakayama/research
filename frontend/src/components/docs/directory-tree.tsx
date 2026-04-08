"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TreeNode } from "@/lib/docs-content";
import { ChevronRight } from "lucide-react";

type DirectoryTreeProps = {
  nodes: TreeNode[];
  currentPath: string;
};

export function DirectoryTree({ nodes, currentPath }: DirectoryTreeProps) {
  return (
    <nav aria-label="ドキュメントナビゲーション">
      <ul>
        {nodes.map((node) => (
          <TreeItem
            key={node.path}
            node={node}
            currentPath={currentPath}
            depth={0}
          />
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

  const indent = `${depth * 12 + 10}px`;

  if (!node.isDirectory) {
    return (
      <li>
        <Link
          href={node.path}
          className={cn(
            "flex items-center gap-2 truncate border-l-[3px] py-1.5 pr-2 text-sm transition-colors",
            isActive
              ? "border-[var(--sidebar-active-indicator)] bg-[var(--sidebar-active-bg)] font-semibold text-[var(--sidebar-active-text)]"
              : "border-transparent text-[var(--sidebar-text-secondary)] hover:border-[var(--sidebar-active-indicator)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-text)]",
          )}
          style={{ paddingLeft: indent }}
        >
          <span className="brutal-mono shrink-0 text-[0.7rem] opacity-60">
            —
          </span>
          <span className="truncate">{node.name}</span>
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex w-full items-center gap-2 truncate border-l-[3px] py-1.5 pr-2 text-sm cursor-pointer transition-colors",
          isActive
            ? "border-[var(--sidebar-active-indicator)] bg-[var(--sidebar-active-bg)] font-semibold text-[var(--sidebar-active-text)]"
            : "border-transparent text-[var(--sidebar-text)] hover:border-[var(--sidebar-active-indicator)] hover:bg-[var(--sidebar-hover-bg)]",
        )}
        style={{ paddingLeft: indent }}
        aria-expanded={expanded}
      >
        <span className="brutal-mono shrink-0 text-[0.7rem]">
          {expanded ? "▼" : "▶"}
        </span>
        <span className="brutal-label flex-1 truncate text-left">
          {node.name}
        </span>
        <ChevronRight
          className={cn(
            "h-3 w-3 shrink-0 transition-transform",
            expanded && "rotate-90",
          )}
          strokeWidth={2.5}
        />
      </button>
      {expanded && node.children.length > 0 && (
        <ul>
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
