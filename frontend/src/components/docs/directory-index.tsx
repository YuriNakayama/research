import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type DirectoryEntry = {
  name: string;
  isDirectory: boolean;
  slug: string[];
};

type DirectoryIndexProps = {
  entries: DirectoryEntry[];
  parentSlug: string[];
};

export function DirectoryIndex({ entries, parentSlug }: DirectoryIndexProps) {
  const title =
    parentSlug.length === 0
      ? "DOCS"
      : (parentSlug[parentSlug.length - 1] ?? "").toUpperCase();

  const directories = entries.filter((e) => e.isDirectory);
  const files = entries.filter((e) => !e.isDirectory);
  const totalCount = entries.length;

  return (
    <div>
      {/* Title block */}
      <div className="mb-10 brutal-border-strong brutal-shadow bg-[var(--surface-elevated)]">
        <div className="flex items-center justify-between brutal-border-b border-[var(--border-primary)] bg-[var(--text-primary)] px-4 py-2">
          <span className="brutal-label text-[var(--text-inverse)]">
            [INDEX] / {parentSlug.length === 0 ? "ROOT" : `L${parentSlug.length}`}
          </span>
          <span className="brutal-label text-[var(--text-inverse)]">
            ITEMS: {String(totalCount).padStart(3, "0")}
          </span>
        </div>
        <div className="px-6 py-6">
          <h1 className="brutal-display text-4xl text-[var(--text-primary)] md:text-5xl">
            {title}
          </h1>
          <div className="mt-3 flex flex-wrap gap-3 brutal-label text-[var(--text-tertiary)]">
            <span>DIR: {String(directories.length).padStart(2, "0")}</span>
            <span>|</span>
            <span>FILE: {String(files.length).padStart(2, "0")}</span>
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="brutal-border bg-[var(--surface-secondary)] p-8">
          <p className="brutal-label text-[var(--text-tertiary)]">
            &gt; NO DOCUMENTS IN THIS DIRECTORY
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {directories.length > 0 && (
            <section>
              <h2 className="brutal-label mb-3 text-[var(--text-tertiary)]">
                {"// DIRECTORIES"}
              </h2>
              <div className="grid gap-0 brutal-border sm:grid-cols-2 lg:grid-cols-3">
                {directories.map((entry, idx) => (
                  <Link
                    key={entry.slug.join("/")}
                    href={`/docs/${entry.slug.join("/")}`}
                    className={`group relative flex items-start justify-between gap-3 border-[var(--border-primary)] p-5 transition-colors hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)] ${
                      idx % 3 !== 2 ? "lg:border-r-2" : ""
                    } ${idx % 2 !== 1 ? "sm:border-r-2 lg:border-r-0" : ""} ${
                      idx >= 1 ? "border-t-2 sm:border-t-2" : ""
                    }`}
                    style={{
                      borderRightWidth: undefined,
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="brutal-label mb-1 text-[var(--text-tertiary)] group-hover:text-[var(--accent-text)]">
                        {String(idx + 1).padStart(2, "0")} / DIR
                      </div>
                      <div className="brutal-display text-base text-[var(--text-primary)] group-hover:text-[var(--accent-text)]">
                        {entry.name}
                      </div>
                    </div>
                    <ArrowUpRight
                      className="h-5 w-5 shrink-0 text-[var(--text-primary)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--accent-text)]"
                      strokeWidth={2.5}
                    />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {files.length > 0 && (
            <section>
              <h2 className="brutal-label mb-3 text-[var(--text-tertiary)]">
                {"// FILES"}
              </h2>
              <ul className="brutal-border">
                {files.map((entry, idx) => (
                  <li
                    key={entry.slug.join("/")}
                    className={
                      idx > 0
                        ? "brutal-border-t border-[var(--border-primary)]"
                        : ""
                    }
                  >
                    <Link
                      href={`/docs/${entry.slug.join("/")}`}
                      className="group flex items-center gap-4 px-5 py-3 transition-colors hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)]"
                    >
                      <span className="brutal-label w-10 shrink-0 text-[var(--text-tertiary)] group-hover:text-[var(--accent-text)]">
                        {String(idx + 1).padStart(3, "0")}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm text-[var(--text-primary)] group-hover:text-[var(--accent-text)]">
                        {entry.name}
                      </span>
                      <ArrowUpRight
                        className="h-4 w-4 shrink-0 text-[var(--text-primary)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--accent-text)]"
                        strokeWidth={2.5}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
