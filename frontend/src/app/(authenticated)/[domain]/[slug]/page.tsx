import { notFound } from "next/navigation";
import {
  getReportFiles,
  getReportContent,
  extractTitle,
  extractMetadata,
  getDomains,
} from "@/lib/content";
import { ReportHeader } from "@/components/report/report-header";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { Toc } from "@/components/report/toc";
import { extractTocItems } from "@/lib/toc";
import { MobileToc } from "@/components/report/mobile-toc";
import Link from "next/link";

interface Props {
  params: Promise<{ domain: string; slug: string }>;
}

export async function generateStaticParams() {
  const domains = getDomains();
  const params: { domain: string; slug: string }[] = [];

  for (const domain of domains) {
    const files = getReportFiles(domain);
    for (const file of files) {
      params.push({ domain, slug: file.slug });
    }
  }

  return params;
}

export default async function ReportPage({ params }: Props) {
  const { domain, slug } = await params;

  const reportFiles = getReportFiles(domain);
  const file = reportFiles.find((f) => f.slug === slug);

  if (!file) {
    notFound();
  }

  const content = getReportContent(file.filePath);
  const title = extractTitle(content);
  const metadata = extractMetadata(content);
  const tocItems = extractTocItems(content);

  // Remove the first H1 title from content (already shown in header)
  const bodyContent = content.replace(/^#\s+.+$/m, "").trim();

  const domainLabel = domain.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="relative">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-gray-500 dark:text-gray-400" aria-label="パンくずリスト">
        <Link href="/" className="hover:underline">
          ホーム
        </Link>
        <span className="mx-1">/</span>
        <Link href={`/${domain}`} className="hover:underline">
          {domainLabel}
        </Link>
        <span className="mx-1">/</span>
        <span className="text-gray-700 dark:text-gray-200">{title}</span>
      </nav>

      <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-8">
        {/* Main content */}
        <article>
          <ReportHeader title={title} metadata={metadata} />
          <MarkdownRenderer content={bodyContent} />
        </article>

        {/* Desktop TOC sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <Toc items={tocItems} />
          </div>
        </aside>
      </div>

      {/* Mobile TOC */}
      <MobileToc items={tocItems} />
    </div>
  );
}
