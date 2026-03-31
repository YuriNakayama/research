import { getDomains, getReportFiles, extractTitle, getReportContent, extractMetadata } from "@/lib/content";
import { getAllReportMetadata } from "@/lib/metadata";
import { ReportCard } from "@/components/report/report-card";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return getDomains().map((domain) => ({ domain }));
}

interface Props {
  params: Promise<{ domain: string }>;
}

export default async function DomainPage({ params }: Props) {
  const { domain } = await params;

  const reportFiles = getReportFiles(domain);
  if (reportFiles.length === 0) {
    notFound();
  }

  // Get CSV metadata for enrichment
  const csvMetadata = getAllReportMetadata(domain);
  const csvByTitle = new Map(csvMetadata.map((item) => [item.title, item]));

  const reports = reportFiles.map((file) => {
    const content = getReportContent(file.filePath);
    const title = extractTitle(content);
    const mdMeta = extractMetadata(content);
    const csvItem = csvByTitle.get(title);

    return {
      slug: file.slug,
      title,
      authors: csvItem?.authors ?? mdMeta["authors"] ?? "",
      year: csvItem?.year ?? mdMeta["year"] ?? "",
      venue: csvItem?.venue ?? mdMeta["venue"] ?? "",
      summary: csvItem?.summary ?? "",
      date: csvItem?.date ?? "",
    };
  });

  const domainLabel = domain.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{domainLabel}</h1>
      <div className="grid gap-3">
        {reports.map((report) => (
          <ReportCard
            key={report.slug}
            domain={domain}
            slug={report.slug}
            title={report.title}
            authors={report.authors}
            year={report.year}
            venue={report.venue}
            summary={report.summary}
            date={report.date}
          />
        ))}
      </div>
    </div>
  );
}
