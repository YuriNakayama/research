"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import { useRouter } from "next/navigation";

const isE2ETest = process.env.NEXT_PUBLIC_E2E_TEST === "true";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(isE2ETest);
  const [loading, setLoading] = useState(!isE2ETest);
  const router = useRouter();

  useEffect(() => {
    if (isE2ETest) return;
    getCurrentUser()
      .then(() => setAuthenticated(true))
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">認証確認中...</p>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}
