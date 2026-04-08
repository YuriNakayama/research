"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type { TocItem } from "@/lib/toc";
export { extractTocItems } from "@/lib/toc";
import type { TocItem } from "@/lib/toc";

type TocProps = {
  items: TocItem[];
  className?: string;
};

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

    const headings = document.querySelectorAll(
      "h2[id], h3[id], h4[id], h5[id], h6[id]",
    );
    headings.forEach((h) => observer.observe(h));

    return () => observer.disconnect();
  }, []);

  if (items.length === 0) return null;

  return (
    <nav className={cn("text-sm", className)} aria-label="目次">
      <ul className="space-y-0">
        {items.map((item, idx) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "flex gap-2 border-l-[3px] py-1.5 pr-2 transition-colors",
                  item.level >= 4 && "text-xs",
                  isActive
                    ? "border-[var(--accent-bg)] bg-[var(--accent-bg)] font-semibold text-[var(--accent-text)]"
                    : "border-transparent text-[var(--text-tertiary)] hover:border-[var(--text-primary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]",
                )}
                style={{ paddingLeft: `${(item.level - 2) * 12 + 10}px` }}
              >
                <span className="brutal-mono shrink-0 text-[0.65rem] opacity-70">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="truncate">{item.text}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
