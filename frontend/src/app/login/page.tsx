"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthProvider } from "@/components/auth/auth-provider";
import { BookOpen } from "lucide-react";

function PostLogin() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return (
    <p className="text-center text-[var(--text-tertiary)]">リダイレクト中...</p>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface-primary)] px-4">
        <Authenticator
          hideSignUp
          components={{
            Header() {
              return (
                <div className="mb-6 text-center">
                  <BookOpen
                    className="mx-auto mb-4 h-8 w-8 text-[var(--text-primary)]"
                    strokeWidth={1.5}
                  />
                  <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                    Research Viewer
                  </h1>
                  <p className="mt-2 text-sm text-[var(--text-tertiary)]">
                    ログインしてください
                  </p>
                </div>
              );
            },
          }}
        >
          <PostLogin />
        </Authenticator>
      </div>
    </AuthProvider>
  );
}
