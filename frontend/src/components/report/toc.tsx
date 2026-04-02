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

    const headings = document.querySelectorAll("h2[id], h3[id], h4[id], h5[id], h6[id]");
    headings.forEach((h) => observer.observe(h));

    return () => observer.disconnect();
  }, []);

  if (items.length === 0) return null;

  return (
    <nav className={cn("text-sm", className)} aria-label="目次">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
        目次
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id} style={{ paddingLeft: `${(item.level - 2) * 12}px` }}>
            <a
              href={`#${item.id}`}
              className={cn(
                "block truncate border-l-2 py-0.5 pl-2 transition-colors duration-200",
                item.level >= 4 && "text-xs",
                activeId === item.id
                  ? "border-[var(--accent-bg)] font-medium text-[var(--text-accent)]"
                  : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-link)]",
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
