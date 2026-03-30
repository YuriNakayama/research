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
  return <p className="text-center text-gray-500">リダイレクト中...</p>;
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen items-center justify-center px-4">
        <Authenticator
          hideSignUp
          components={{
            Header() {
              return (
                <div className="mb-6 text-center">
                  <h1 className="text-2xl font-bold">Research Viewer</h1>
                  <p className="mt-1 text-sm text-gray-500">
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
