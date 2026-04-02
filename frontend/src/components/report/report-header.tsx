import { ExternalLink } from "lucide-react";

type ReportHeaderProps = {
  title: string;
  metadata: Record<string, string>;
};

export function ReportHeader({ title, metadata }: ReportHeaderProps) {
  const items = [
    { label: "著者", value: metadata["authors"] },
    { label: "年", value: metadata["year"] },
    { label: "会議/ジャーナル", value: metadata["venue"] },
    { label: "タイプ", value: metadata["type"] },
  ].filter((item) => item.value);

  return (
    <div className="mb-10 border-b border-[var(--border-primary)] pb-8">
      <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-[var(--text-primary)] md:text-4xl">
        {title}
      </h1>
      {items.length > 0 && (
        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <dt className="text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                {item.label}
              </dt>
              <dd className="text-[var(--text-secondary)]">{item.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {metadata["link"] && (
        <a
          href={metadata["link"]}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-[var(--text-link)] transition-colors duration-200 hover:text-[var(--text-accent)]"
        >
          元論文を開く
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
        </a>
      )}
    </div>
  );
}
