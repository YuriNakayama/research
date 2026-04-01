"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TreeNode } from "@/lib/docs-content";

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
            "block truncate rounded-md px-2 py-1.5 text-sm transition-colors",
            isActive
              ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <span className="mr-1.5 inline-block w-4 text-center text-gray-400">
            📄
          </span>
          {node.name}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex w-full items-center truncate rounded-md px-2 py-1.5 text-sm transition-colors",
          isActive
            ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        aria-expanded={expanded}
      >
        <span className="mr-1.5 inline-block w-4 text-center text-gray-400">
          {expanded ? "📂" : "📁"}
        </span>
        <span className="flex-1 truncate text-left">{node.name}</span>
        <svg
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform",
            expanded && "rotate-90",
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
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
