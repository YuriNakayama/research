"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import { useRouter } from "next/navigation";

// Auth is bypassed whenever this bundle is not a production build
// (`next build` sets NODE_ENV="production", making this literal false
// and eliminating the branch via dead-code elimination), OR when the
// E2E test flag is explicitly set.
const bypassAuth =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_E2E_TEST === "true";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(bypassAuth);
  const [loading, setLoading] = useState(!bypassAuth);
  const router = useRouter();

  useEffect(() => {
    if (bypassAuth) return;
    getCurrentUser()
      .then(() => setAuthenticated(true))
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="brutal-label text-[var(--text-tertiary)]">
          &gt; VERIFYING SESSION...
        </p>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}
