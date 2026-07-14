import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { DomainSummary } from "@/lib/content-index";

type DomainCardProps = {
  summary: DomainSummary;
  index: number;
};

// Format a compact YYYYMMDD run date as YYYY.MM.DD for display. Returns the raw
// value if it doesn't match the expected shape.
function formatRunDate(runDate: string | undefined): string {
  if (!runDate) return "—";
  const match = runDate.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (!match) return runDate;
  return `${match[1]}.${match[2]}.${match[3]}`;
}

export function DomainCard({ summary, index }: DomainCardProps) {
  const {
    displayName,
    description,
    href,
    clusterCount,
    reportCount,
    latestRunDate,
    phaseCounts,
  } = summary;

  return (
    <Link
      href={href}
      className="group flex flex-col brutal-border brutal-shadow-sm bg-[var(--surface-elevated)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:brutal-shadow focus-visible:-translate-x-0.5 focus-visible:-translate-y-0.5"
    >
      {/* Card header: index + latest run date */}
      <div className="flex items-center justify-between brutal-border-b border-[var(--border-primary)] bg-[var(--text-primary)] px-3 py-1.5">
        <span className="brutal-label text-[var(--text-inverse)]">
          {String(index + 1).padStart(2, "0")} / DOMAIN
        </span>
        {/* tabular-nums keeps dates from shifting width across cards */}
        <span className="brutal-label tabular-nums text-[var(--text-inverse)]">
          {formatRunDate(latestRunDate)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="brutal-display text-lg text-[var(--text-primary)] group-hover:text-[var(--accent-bg)]">
          {displayName}
        </h3>

        {description && (
          <p className="line-clamp-3 text-sm leading-relaxed text-[var(--text-secondary)]">
            {description}
          </p>
        )}

        {/* Metrics row, pushed to the bottom */}
        <div className="mt-auto flex items-end justify-between pt-2">
          <dl className="flex gap-4 brutal-label text-[var(--text-tertiary)]">
            <div>
              <dt className="sr-only">レポート数</dt>
              <dd className="tabular-nums text-[var(--text-primary)]">
                {reportCount}
                <span className="ml-1 text-[var(--text-tertiary)]">REPORTS</span>
              </dd>
            </div>
            {clusterCount > 0 && (
              <div>
                <dt className="sr-only">クラスタ数</dt>
                <dd className="tabular-nums text-[var(--text-primary)]">
                  {clusterCount}
                  <span className="ml-1 text-[var(--text-tertiary)]">
                    CLUSTERS
                  </span>
                </dd>
              </div>
            )}
          </dl>
          <ArrowUpRight
            className="h-5 w-5 shrink-0 text-[var(--text-primary)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            strokeWidth={2.5}
            aria-hidden
          />
        </div>

        {/* Phase breakdown */}
        <div className="flex flex-wrap gap-2 brutal-label text-[var(--text-tertiary)]">
          <PhaseBadge label="G" count={phaseCounts.gather} />
          <PhaseBadge label="R" count={phaseCounts.retrieval} />
          <PhaseBadge label="C" count={phaseCounts.clustering} />
        </div>
      </div>
    </Link>
  );
}

type PhaseBadgeProps = {
  label: string;
  count: number;
};

// One phase count chip (Gather / Retrieval / Clustering). Dimmed when empty so
// the presence/absence of a phase is visible at a glance.
function PhaseBadge({ label, count }: PhaseBadgeProps) {
  const empty = count === 0;
  return (
    <span
      className={`brutal-border px-1.5 py-0.5 tabular-nums ${
        empty
          ? "border-[var(--border-primary)]/30 text-[var(--text-tertiary)]/50"
          : "border-[var(--border-primary)] text-[var(--text-primary)]"
      }`}
    >
      {label}:{count}
    </span>
  );
}
