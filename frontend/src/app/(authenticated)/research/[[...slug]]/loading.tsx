import { Loader } from "@/components/layout/loader";

/**
 * Route-level loading UI for research pages. Next.js shows this via Suspense
 * while the server renders the requested slug, giving navigation a consistent
 * loading indicator instead of a blank frame.
 */
export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader label="読み込み中" inline />
    </div>
  );
}
