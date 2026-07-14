import { Header } from "@/components/layout/header";
import { SearchProvider } from "@/components/search/search-provider";
import { getSearchRecords } from "@/lib/search-index";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Built on the server (SSR) so the search index never needs a separate API
  // route, keeping the authenticated boundary intact.
  const records = getSearchRecords();

  return (
    <SearchProvider records={records}>
      <Header />
      {children}
    </SearchProvider>
  );
}
