"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import type { ComponentPropsWithoutRef } from "react";

// Allow KaTeX attributes through sanitize
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    span: [
      ...(defaultSchema.attributes?.span ?? []),
      ["className", /^katex/],
      "style",
    ],
    div: [
      ...(defaultSchema.attributes?.div ?? []),
      ["className", /^katex/],
      "style",
    ],
    annotation: ["encoding"],
    math: ["xmlns"],
    semantics: [],
  },
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "math",
    "semantics",
    "mrow",
    "mi",
    "mo",
    "mn",
    "msup",
    "msub",
    "mfrac",
    "mover",
    "munder",
    "mtable",
    "mtr",
    "mtd",
    "mtext",
    "annotation",
    "svg",
    "path",
    "line",
    "rect",
    "circle",
  ],
};

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none"
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[
        rehypeKatex,
        [rehypeSanitize, sanitizeSchema],
      ]}
      components={{
        table: ({ children, ...props }: ComponentPropsWithoutRef<"table">) => (
          <div className="overflow-x-auto">
            <table {...props}>{children}</table>
          </div>
        ),
        pre: ({ children, ...props }: ComponentPropsWithoutRef<"pre">) => (
          <pre className="overflow-x-auto" {...props}>
            {children}
          </pre>
        ),
        img: ({ alt, ...props }: ComponentPropsWithoutRef<"img">) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={alt ?? ""}
            className="max-w-full rounded"
            loading="lazy"
            {...props}
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
