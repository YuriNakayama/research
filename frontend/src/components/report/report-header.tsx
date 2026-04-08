import { ArrowUpRight } from "lucide-react";

type ReportHeaderProps = {
  title: string;
  metadata: Record<string, string>;
};

export function ReportHeader({ title, metadata }: ReportHeaderProps) {
  const items = [
    { label: "AUTHORS", value: metadata["authors"] },
    { label: "YEAR", value: metadata["year"] },
    { label: "VENUE", value: metadata["venue"] },
    { label: "TYPE", value: metadata["type"] },
  ].filter((item) => item.value);

  return (
    <div className="mb-10 brutal-border-strong brutal-shadow bg-[var(--surface-elevated)]">
      <div className="flex items-center justify-between brutal-border-b border-[var(--border-primary)] bg-[var(--text-primary)] px-4 py-2">
        <span className="brutal-label text-[var(--text-inverse)]">
          [REPORT] / DOCUMENT
        </span>
        {metadata["year"] && (
          <span className="brutal-label text-[var(--text-inverse)]">
            {metadata["year"]}
          </span>
        )}
      </div>

      <div className="px-6 py-6">
        <h1 className="brutal-display text-3xl leading-[1.05] text-[var(--text-primary)] md:text-4xl">
          {title}
        </h1>

        {items.length > 0 && (
          <dl className="mt-6 grid grid-cols-1 gap-0 brutal-border sm:grid-cols-2">
            {items.map((item, idx) => (
              <div
                key={item.label}
                className={`flex flex-col gap-1 p-3 ${
                  idx % 2 === 0 ? "sm:border-r-2 sm:border-[var(--border-primary)]" : ""
                } ${idx >= 2 ? "border-t-2 border-[var(--border-primary)]" : ""}`}
              >
                <dt className="brutal-label text-[var(--text-tertiary)]">
                  {item.label}
                </dt>
                <dd className="text-sm text-[var(--text-primary)]">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {metadata["link"] && (
          <a
            href={metadata["link"]}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 brutal-border-strong bg-[var(--accent-bg)] px-4 py-2 brutal-label text-[var(--accent-text)] brutal-shadow-sm transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3px_3px_0_0_var(--border-primary)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--border-primary)]"
          >
            OPEN SOURCE
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
          </a>
        )}
      </div>
    </div>
  );
}
