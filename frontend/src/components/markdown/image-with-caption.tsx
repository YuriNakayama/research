import type { ComponentPropsWithoutRef } from "react";

type ImageWithCaptionProps = ComponentPropsWithoutRef<"img">;

export function ImageWithCaption({ alt, ...props }: ImageWithCaptionProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt ?? ""}
      className="max-w-full rounded"
      loading="lazy"
      decoding="async"
      title={alt ?? undefined}
      {...props}
    />
  );
}
