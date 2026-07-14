import { ArrowUpRight } from "lucide-react";
import { AuthorList } from "./author-list";

type ReportHeaderProps = {
  title: string;
  metadata: Record<string, string>;
};

// Split a comma-separated author string into trimmed names.
function parseAuthors(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((a) => a.trim())
    .filter((a) => a.length > 0);
}

export function ReportHeader({ title, metadata }: ReportHeaderProps) {
  const authors = parseAuthors(metadata["authors"]);
  const type = metadata["type"];
  const year = metadata["year"];
  const venue = metadata["venue"];
  const link = metadata["link"];

  return (
    <div className="mb-10 brutal-border-strong brutal-shadow bg-[var(--surface-elevated)]">
      <div className="flex flex-wrap items-center justify-between gap-2 brutal-border-b border-[var(--border-primary)] bg-[var(--text-primary)] px-4 py-2">
        <span className="brutal-label text-[var(--text-inverse)]">
          [REPORT] / DOCUMENT
        </span>
        {/* Type + year as badges for quick scanning */}
        <div className="flex flex-wrap items-center gap-2">
          {type && (
            <span className="brutal-label brutal-border border-[var(--text-inverse)] px-2 py-0.5 text-[var(--text-inverse)]">
              {type}
            </span>
          )}
          {year && (
            <span className="brutal-label tabular-nums text-[var(--text-inverse)]">
              {year}
            </span>
          )}
        </div>
      </div>

      <div className="px-6 py-6">
        <h1 className="brutal-display text-3xl leading-[1.05] text-[var(--text-primary)] md:text-4xl">
          {title}
        </h1>

        {venue && (
          <p className="mt-4 text-sm text-[var(--text-secondary)]">
            <span className="brutal-label mr-2 text-[var(--text-tertiary)]">
              VENUE
            </span>
            {venue}
          </p>
        )}

        {authors.length > 0 && (
          <div className="mt-4">
            <span className="brutal-label mb-2 block text-[var(--text-tertiary)]">
              AUTHORS ({authors.length})
            </span>
            <AuthorList authors={authors} />
          </div>
        )}

        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 brutal-border-strong bg-[var(--accent-bg)] px-4 py-2 brutal-label text-[var(--accent-text)] brutal-shadow-sm transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3px_3px_0_0_var(--border-primary)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--border-primary)]"
          >
            OPEN SOURCE
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </a>
        )}
      </div>
    </div>
  );
}
