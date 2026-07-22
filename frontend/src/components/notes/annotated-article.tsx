"use client";

import { useRef } from "react";
import { NoteHighlightLayer } from "@/components/notes/note-highlight-layer";

/**
 * Wraps the rendered markdown so selection anchors have a stable container to
 * measure against.
 *
 * `relative` is required: the highlight layer positions its markers absolutely
 * against this element's box.
 */
export function AnnotatedArticle({
  children,
}: {
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div ref={containerRef} className="relative">
      {children}
      <NoteHighlightLayer containerRef={containerRef} />
    </div>
  );
}
