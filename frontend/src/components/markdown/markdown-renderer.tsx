"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import type { ComponentPropsWithoutRef } from "react";
import { isValidElement } from "react";
import { CodeBlock } from "./code-block";
import { MermaidBlock } from "./mermaid-block";
import { ImageWithCaption } from "./image-with-caption";

type MarkdownRendererProps = {
  content: string;
  basePath?: string;
};

function preprocessMathBlocks(content: string): string {
  return content.replace(/```math\n([\s\S]*?)```/g, (_match, math: string) => {
    return `$$\n${math}$$`;
  });
}

function getElementProp(element: unknown, key: string): unknown {
  if (!isValidElement(element)) return undefined;
  return (element.props as Record<string, unknown>)[key];
}

function isMermaidCodeBlock(children: unknown): string | null {
  const className = getElementProp(children, "className");
  if (typeof className === "string" && className.includes("language-mermaid")) {
    return extractTextFromChildren(getElementProp(children, "children"));
  }
  return null;
}

function extractTextFromChildren(node: unknown): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractTextFromChildren).join("");
  if (isValidElement(node)) {
    return extractTextFromChildren((node.props as Record<string, unknown>).children);
  }
  return "";
}

function resolveImageSrc(src: string | Blob | undefined, basePath: string | undefined): string | undefined {
  if (!src || typeof src !== "string") return typeof src === "string" ? src : undefined;
  // Already absolute URL or absolute path
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) {
    return src;
  }
  // Relative path — resolve against basePath via /api/docs-assets/
  if (basePath) {
    return `/api/docs-assets/${basePath}/${src}`;
  }
  return src;
}

/**
 * Resolve a markdown hyperlink so that internal .md links become /docs/<slug>.
 *
 * Rules:
 * - External URLs, mailto/tel, and in-page anchors pass through unchanged.
 * - Links already starting with "/" pass through unchanged.
 * - For relative paths ending in .md (or .mdx), resolve against basePath and
 *   prefix with /docs/. Strip the extension. Trailing /index becomes the
 *   directory slug.
 * - Query/hash fragments on the source href are preserved.
 */
function resolveDocHref(href: string | undefined, basePath: string | undefined): string | undefined {
  if (!href) return href;

  // Pass-through: external, mailto/tel, anchors, or already-absolute app paths
  if (
    /^[a-z][a-z0-9+.-]*:/i.test(href) || // any scheme (http, https, mailto, tel, …)
    href.startsWith("#") ||
    href.startsWith("/")
  ) {
    return href;
  }

  // Split off query/hash so we only rewrite the path portion
  const hashIndex = href.search(/[#?]/);
  const pathPart = hashIndex === -1 ? href : href.slice(0, hashIndex);
  const suffix = hashIndex === -1 ? "" : href.slice(hashIndex);

  // Only rewrite markdown targets. Leave other relative assets alone so the
  // existing image / file handling is not disturbed.
  if (!/\.mdx?$/i.test(pathPart)) {
    return href;
  }

  // Resolve pathPart against basePath using standard POSIX "." / ".." rules
  const baseSegments = basePath ? basePath.split("/").filter(Boolean) : [];
  const relSegments = pathPart.split("/");
  const resolved: string[] = [...baseSegments];
  for (const segment of relSegments) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") {
      resolved.pop();
      continue;
    }
    resolved.push(segment);
  }

  // Strip the .md/.mdx extension on the final segment
  const last = resolved.pop();
  if (last !== undefined) {
    const stripped = last.replace(/\.mdx?$/i, "");
    // Directory index file → drop the final "index" segment
    if (stripped.toLowerCase() !== "index") {
      resolved.push(stripped);
    }
  }

  return `/docs/${resolved.join("/")}${suffix}`;
}

export function MarkdownRenderer({ content, basePath }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none"
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[
        rehypeKatex,
        rehypeHighlight,
      ]}
      components={{
        pre: ({ children, ...props }: ComponentPropsWithoutRef<"pre">) => {
          // Check if this is a mermaid code block
          const mermaidCode = isMermaidCodeBlock(children);
          if (mermaidCode) {
            return <MermaidBlock code={mermaidCode} />;
          }

          // Get language from code child's className or data-language
          const childClassName = getElementProp(children, "className");
          const classStr = typeof childClassName === "string" ? childClassName : "";
          const langMatch = classStr.match(/language-(\w+)/);
          const language = (props as Record<string, unknown>)["data-language"] as string
            ?? langMatch?.[1]
            ?? undefined;

          return (
            <CodeBlock data-language={language} {...props}>
              {children}
            </CodeBlock>
          );
        },
        table: ({ children, ...props }: ComponentPropsWithoutRef<"table">) => (
          <div className="overflow-x-auto">
            <table {...props}>{children}</table>
          </div>
        ),
        img: ({ src, ...props }: ComponentPropsWithoutRef<"img">) => (
          <ImageWithCaption src={resolveImageSrc(typeof src === "string" ? src : undefined, basePath)} {...props} />
        ),
        a: ({ href, children, ...props }: ComponentPropsWithoutRef<"a">) => (
          <a href={resolveDocHref(href, basePath)} {...props}>
            {children}
          </a>
        ),
        code: ({ className, children, ...props }: ComponentPropsWithoutRef<"code">) => {
          const match = className?.match(/language-(\w+)/);
          if (match?.[1] === "mermaid") {
            return <MermaidBlock code={String(children).trim()} />;
          }
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {preprocessMathBlocks(content)}
    </ReactMarkdown>
  );
}
