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
};

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

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
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
        img: (props: ComponentPropsWithoutRef<"img">) => (
          <ImageWithCaption {...props} />
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
      {content}
    </ReactMarkdown>
  );
}
