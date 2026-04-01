"use client";

import { useEffect, useRef, useState, useId } from "react";
import { useTheme } from "next-themes";

type MermaidBlockProps = {
  code: string;
};

export function MermaidBlock({ code }: MermaidBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { resolvedTheme } = useTheme();
  const id = useId().replace(/:/g, "m");

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: resolvedTheme === "dark" ? "dark" : "default",
          fontFamily: "var(--font-sans)",
        });

        const { svg } = await mermaid.render(`mermaid-${id}`, code);

        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setLoading(false);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Mermaid render error");
          setLoading(false);
        }
      }
    }

    setLoading(true);
    render();

    return () => {
      cancelled = true;
    };
  }, [code, resolvedTheme, id]);

  if (error) {
    return (
      <div className="mermaid-container">
        <pre className="overflow-x-auto text-left text-sm opacity-70">
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className="mermaid-container">
      {loading && <div className="mermaid-loading">Loading diagram...</div>}
      <div ref={containerRef} style={{ display: loading ? "none" : "block" }} />
    </div>
  );
}
