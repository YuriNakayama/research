interface ReportHeaderProps {
  title: string;
  metadata: Record<string, string>;
}

export function ReportHeader({ title, metadata }: ReportHeaderProps) {
  const items = [
    { label: "著者", value: metadata["authors"] },
    { label: "年", value: metadata["year"] },
    { label: "会議/ジャーナル", value: metadata["venue"] },
    { label: "タイプ", value: metadata["type"] },
  ].filter((item) => item.value);

  return (
    <div className="mb-8 border-b pb-6 dark:border-gray-700">
      <h1 className="mb-4 text-2xl font-bold leading-tight md:text-3xl">
        {title}
      </h1>
      {items.length > 0 && (
        <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
          {items.map((item) => (
            <div key={item.label} className="flex gap-1">
              <dt className="font-medium">{item.label}:</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {metadata["link"] && (
        <a
          href={metadata["link"]}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          元論文を開く
        </a>
      )}
    </div>
  );
}
