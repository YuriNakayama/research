import type { DomainSummary } from "@/lib/content-index";
import { DomainCard } from "./domain-card";

type DomainDashboardProps = {
  summaries: DomainSummary[];
};

// Root landing view: a mobile-first grid of research domains built from
// domain.yaml + scanned run metadata, replacing the raw directory listing.
export function DomainDashboard({ summaries }: DomainDashboardProps) {
  const totalReports = summaries.reduce((sum, s) => sum + s.reportCount, 0);

  return (
    <div>
      {/* Title block, consistent with DirectoryIndex */}
      <div className="mb-10 brutal-border-strong brutal-shadow bg-[var(--surface-elevated)]">
        <div className="flex items-center justify-between brutal-border-b border-[var(--border-primary)] bg-[var(--text-primary)] px-4 py-2">
          <span className="brutal-label text-[var(--text-inverse)]">
            [INDEX] / ROOT
          </span>
          <span className="brutal-label tabular-nums text-[var(--text-inverse)]">
            DOMAINS: {String(summaries.length).padStart(2, "0")}
          </span>
        </div>
        <div className="px-6 py-6">
          <h1 className="brutal-display text-4xl text-[var(--text-primary)] md:text-5xl">
            RESEARCH
          </h1>
          <div className="mt-3 flex flex-wrap gap-3 brutal-label text-[var(--text-tertiary)]">
            <span className="tabular-nums">
              DOMAINS: {String(summaries.length).padStart(2, "0")}
            </span>
            <span>|</span>
            <span className="tabular-nums">
              REPORTS: {String(totalReports).padStart(3, "0")}
            </span>
          </div>
        </div>
      </div>

      {summaries.length === 0 ? (
        <div className="brutal-border bg-[var(--surface-secondary)] p-8">
          <p className="brutal-label text-[var(--text-tertiary)]">
            &gt; NO DOMAINS YET
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {summaries.map((summary, index) => (
            <DomainCard key={summary.domain} summary={summary} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
