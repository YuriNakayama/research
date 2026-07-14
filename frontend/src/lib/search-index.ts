import { getContentEntries } from "./content-index";

// Lightweight, serializable record used by the client-side command palette.
// Derived from ContentEntry but trimmed to only what search + result rendering
// need, so the payload shipped to the browser stays small.
export type SearchRecord = {
  href: string;
  domain: string;
  title: string;
  type?: string;
  year?: string;
  venue?: string;
  authors?: string[];
  headings: string[];
};

// Build the search index at request time on the server. Callers pass the
// result into the client SearchProvider as a prop (no API route needed, so the
// authenticated SSR boundary is preserved).
export function getSearchRecords(): SearchRecord[] {
  return getContentEntries().map((entry) => ({
    href: entry.href,
    domain: entry.domain,
    title: entry.title,
    type: entry.type,
    year: entry.year,
    venue: entry.venue,
    authors: entry.authors,
    headings: entry.headings,
  }));
}
