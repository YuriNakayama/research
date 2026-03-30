"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type { TocItem } from "@/lib/toc";
export { extractTocItems } from "@/lib/toc";
import type { TocItem } from "@/lib/toc";

interface TocProps {
  items: TocItem[];
  className?: string;
}

export function Toc({ items, className }: TocProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px" },
    );

    const headings = document.querySelectorAll("h2[id], h3[id]");
    headings.forEach((h) => observer.observe(h));

    return () => observer.disconnect();
  }, []);

  if (items.length === 0) return null;

  return (
    <nav className={cn("text-sm", className)} aria-label="目次">
      <p className="mb-2 font-semibold">目次</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id} style={{ paddingLeft: `${(item.level - 2) * 12}px` }}>
            <a
              href={`#${item.id}`}
              className={cn(
                "block truncate py-0.5 transition-colors hover:text-gray-900 dark:hover:text-gray-100",
                activeId === item.id
                  ? "font-medium text-gray-900 dark:text-gray-100"
                  : "text-gray-500 dark:text-gray-400",
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
