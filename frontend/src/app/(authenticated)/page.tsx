import Link from "next/link";

const DOMAINS = [
  {
    name: "legal_tech",
    label: "Legal Tech",
    description: "法律・リーガルテック分野のリサーチ",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Research Viewer</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {DOMAINS.map((domain) => (
          <Link
            key={domain.name}
            href={`/${domain.name}`}
            className="rounded-lg border p-6 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <h2 className="mb-2 text-xl font-semibold">{domain.label}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {domain.description}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
