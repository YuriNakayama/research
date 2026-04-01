import Link from "next/link";

type DirectoryEntry = {
  name: string;
  isDirectory: boolean;
  slug: string[];
};

type DirectoryIndexProps = {
  entries: DirectoryEntry[];
  parentSlug: string[];
};

export function DirectoryIndex({ entries, parentSlug }: DirectoryIndexProps) {
  const title =
    parentSlug.length === 0
      ? "ドキュメント"
      : parentSlug[parentSlug.length - 1];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{title}</h1>
      {entries.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          このディレクトリにはドキュメントがありません。
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <Link
              key={entry.slug.join("/")}
              href={`/docs/${entry.slug.join("/")}`}
              className="group rounded-lg border p-4 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-700 dark:hover:bg-blue-950"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {entry.isDirectory ? "📁" : "📄"}
                </span>
                <span className="truncate font-medium text-gray-900 group-hover:text-blue-700 dark:text-gray-100 dark:group-hover:text-blue-300">
                  {entry.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
