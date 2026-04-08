"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthProvider } from "@/components/auth/auth-provider";

function PostLogin() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return (
    <p className="brutal-label text-center text-[var(--text-tertiary)]">
      REDIRECTING...
    </p>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <div className="relative flex min-h-screen items-center justify-center bg-[var(--surface-primary)] px-4 py-12 overflow-hidden">
        {/* Background grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Corner markers */}
        <div className="pointer-events-none absolute left-6 top-6 brutal-label text-[var(--text-tertiary)]">
          [001] / RESEARCH-VIEWER
        </div>
        <div className="pointer-events-none absolute right-6 top-6 brutal-label text-[var(--text-tertiary)]">
          AUTH / SECURE
        </div>
        <div className="pointer-events-none absolute bottom-6 left-6 brutal-label text-[var(--text-tertiary)]">
          © {new Date().getFullYear()}
        </div>
        <div className="pointer-events-none absolute bottom-6 right-6 brutal-label text-[var(--text-tertiary)]">
          SYS.READY
        </div>

        <div className="relative w-full max-w-md">
          {/* Title block */}
          <div className="mb-6 brutal-border-strong brutal-shadow bg-[var(--surface-elevated)] p-6">
            <div className="brutal-label mb-3 text-[var(--text-tertiary)]">
              [LOGIN] / STEP 01
            </div>
            <h1 className="brutal-display text-4xl text-[var(--text-primary)] md:text-5xl">
              RESEARCH
              <br />
              <span className="inline-block bg-[var(--accent-bg)] px-2 text-[var(--accent-text)]">
                VIEWER
              </span>
            </h1>
            <p className="mt-4 text-sm text-[var(--text-secondary)]">
              アクセスにはログインが必要です。
            </p>
          </div>

          <Authenticator
            hideSignUp
            components={{
              Header() {
                return (
                  <div className="brutal-label mb-4 text-center text-[var(--text-tertiary)]">
                    &gt; ENTER CREDENTIALS
                  </div>
                );
              },
            }}
          >
            <PostLogin />
          </Authenticator>
        </div>
      </div>
    </AuthProvider>
  );
}
