import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllDocsSlugs,
  getDocContent,
  isDirectory,
  getDirectoryEntries,
  getDocsTree,
  getBreadcrumbs,
  getRootEntries,
} from "@/lib/docs-content";
import { extractTocItems } from "@/lib/toc";
import { DocsLayout } from "@/components/docs/docs-layout";
import { DirectoryIndex } from "@/components/docs/directory-index";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { ReportHeader } from "@/components/report/report-header";
import { Toc } from "@/components/report/toc";
import { MobileToc } from "@/components/report/mobile-toc";
import { Breadcrumbs } from "@/components/docs/breadcrumbs";

export const dynamicParams = false;

export function generateStaticParams(): { slug?: string[] }[] {
  const slugs = getAllDocsSlugs();
  return [
    { slug: undefined }, // /docs/ top page
    ...slugs.map((s) => ({ slug: s })),
  ];
}

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    return { title: "Docs | Research Viewer" };
  }

  const doc = getDocContent(slug);
  if (doc) {
    return { title: `${doc.title} | Research Viewer` };
  }

  return { title: `${slug[slug.length - 1]} | Research Viewer` };
}

export default async function DocsPage({ params }: PageProps) {
  const { slug } = await params;
  const tree = getDocsTree();
  const currentSlug = slug ?? [];
  const breadcrumbs = getBreadcrumbs(currentSlug);
  const currentPath = currentSlug.length > 0 ? `/docs/${currentSlug.join("/")}` : "/docs";

  // Top page: show root directories
  if (currentSlug.length === 0) {
    const entries = getRootEntries();

    return (
      <DocsLayout tree={tree} currentPath={currentPath}>
        <Breadcrumbs items={breadcrumbs} />
        <DirectoryIndex entries={entries} parentSlug={currentSlug} />
      </DocsLayout>
    );
  }

  // Directory page: show listing
  if (isDirectory(currentSlug)) {
    const entries = getDirectoryEntries(currentSlug);

    return (
      <DocsLayout tree={tree} currentPath={currentPath}>
        <Breadcrumbs items={breadcrumbs} />
        <DirectoryIndex entries={entries} parentSlug={currentSlug} />
      </DocsLayout>
    );
  }

  // Markdown page: render content
  const doc = getDocContent(currentSlug);
  if (!doc) {
    notFound();
  }

  const tocItems = extractTocItems(doc.content);
  const hasMetadata = Object.keys(doc.metadata).length > 0;

  return (
    <DocsLayout
      tree={tree}
      currentPath={currentPath}
      toc={<Toc items={tocItems} className="sticky top-20" />}
      mobileToc={<MobileToc items={tocItems} />}
    >
      <Breadcrumbs items={breadcrumbs} />
      {hasMetadata && <ReportHeader title={doc.title} metadata={doc.metadata} />}
      <MarkdownRenderer content={doc.content} />
    </DocsLayout>
  );
}
