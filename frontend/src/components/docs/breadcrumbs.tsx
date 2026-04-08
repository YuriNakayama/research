import Link from "next/link";
import type { Breadcrumb } from "@/lib/docs-content";

type BreadcrumbsProps = {
  items: Breadcrumb[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="パンくずリスト" className="mb-8">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-2 brutal-label text-[var(--text-tertiary)]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.href} className="flex items-center gap-1">
              {index > 0 && (
                <span
                  aria-hidden
                  className="px-1 brutal-mono text-[var(--text-tertiary)]"
                >
                  /
                </span>
              )}
              {isLast ? (
                <span className="bg-[var(--accent-bg)] px-2 py-0.5 text-[var(--accent-text)]">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="px-2 py-0.5 brutal-border border-transparent transition-colors hover:brutal-invert hover:border-[var(--border-primary)]"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
