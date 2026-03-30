import Link from "next/link";

interface ReportCardProps {
  domain: string;
  slug: string;
  title: string;
  authors?: string;
  year?: string;
  venue?: string;
  summary?: string;
  date?: string;
}

export function ReportCard({
  domain,
  slug,
  title,
  authors,
  year,
  venue,
  summary,
  date,
}: ReportCardProps) {
  return (
    <Link
      href={`/${domain}/${slug}`}
      className="block rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
    >
      <h3 className="mb-1 font-semibold leading-snug">{title}</h3>

      <div className="mb-2 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
        {authors && <span>{authors}</span>}
        {year && (
          <>
            <span aria-hidden="true">&middot;</span>
            <span>{year}</span>
          </>
        )}
        {venue && (
          <>
            <span aria-hidden="true">&middot;</span>
            <span>{venue}</span>
          </>
        )}
        {date && (
          <>
            <span aria-hidden="true">&middot;</span>
            <span>{date}</span>
          </>
        )}
      </div>

      {summary && (
        <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
          {summary}
        </p>
      )}
    </Link>
  );
}
