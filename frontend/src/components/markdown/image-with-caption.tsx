import type { ComponentPropsWithoutRef } from "react";

type ImageWithCaptionProps = ComponentPropsWithoutRef<"img">;

export function ImageWithCaption({ alt, ...props }: ImageWithCaptionProps) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt ?? ""}
      className="max-w-full rounded"
      loading="lazy"
      {...props}
    />
  );

  if (alt) {
    return (
      <figure>
        {img}
        <figcaption>{alt}</figcaption>
      </figure>
    );
  }

  return img;
}
