import Link from "next/link";
import { Folder, FileText } from "lucide-react";

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
      ? "ドキュメント"
      : parentSlug[parentSlug.length - 1];

  const directories = entries.filter((e) => e.isDirectory);
  const files = entries.filter((e) => !e.isDirectory);

  return (
    <div>
      <h1 className="mb-10 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
        {title}
      </h1>
      {entries.length === 0 ? (
        <p className="text-[var(--text-tertiary)]">
          このディレクトリにはドキュメントがありません。
        </p>
      ) : (
        <div className="space-y-6">
          {directories.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {directories.map((entry) => (
                <Link
                  key={entry.slug.join("/")}
                  href={`/docs/${entry.slug.join("/")}`}
                  className="group rounded-[var(--radius-xl)] border border-[var(--border-primary)] p-6 transition-all duration-200 hover:border-[var(--accent-bg)] hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <Folder
                      className="h-5 w-5 shrink-0 text-[var(--accent-bg)] transition-colors duration-200"
                      strokeWidth={1.5}
                    />
                    <span className="truncate text-base font-medium text-[var(--text-primary)] transition-colors duration-200 group-hover:text-[var(--text-accent)]">
                      {entry.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {files.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {files.map((entry) => (
                <Link
                  key={entry.slug.join("/")}
                  href={`/docs/${entry.slug.join("/")}`}
                  className="group rounded-[var(--radius-lg)] border border-[var(--border-secondary)] p-4 transition-all duration-200 hover:border-[var(--accent-bg)]"
                >
                  <div className="flex items-center gap-2">
                    <FileText
                      className="h-4 w-4 shrink-0 text-[var(--text-tertiary)]"
                      strokeWidth={1.5}
                    />
                    <span className="truncate text-sm text-[var(--text-secondary)] transition-colors duration-200 group-hover:text-[var(--text-accent)]">
                      {entry.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
