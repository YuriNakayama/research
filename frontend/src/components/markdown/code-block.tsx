"use client";

import {
  useState,
  useCallback,
  useRef,
  type ComponentPropsWithoutRef,
} from "react";
import { Copy, Check } from "lucide-react";

type CodeBlockProps = ComponentPropsWithoutRef<"pre"> & {
  "data-language"?: string;
  "data-theme"?: string;
};

export function CodeBlock({
  children,
  "data-language": language,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = useCallback(() => {
    const text = preRef.current?.textContent ?? "";
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  return (
    <div className="my-6 overflow-hidden brutal-border border-[var(--code-border)]">
      <div className="code-block-header">
        <span>&gt; {language ?? "CODE"}</span>
        <button
          type="button"
          className="code-copy-button"
          onClick={handleCopy}
          aria-label="コードをコピー"
        >
          {copied ? (
            <Check className="h-4 w-4" strokeWidth={2.5} />
          ) : (
            <Copy className="h-4 w-4" strokeWidth={2.5} />
          )}
        </button>
      </div>
      <pre ref={preRef} className="overflow-x-auto" {...props}>
        {children}
      </pre>
    </div>
  );
}
