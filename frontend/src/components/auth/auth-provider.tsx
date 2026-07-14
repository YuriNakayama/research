"use client";

import { useEffect, useState } from "react";
import { configureAmplify } from "@/lib/amplify";
import { Loader } from "@/components/layout/loader";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    configureAmplify();
    setReady(true);
  }, []);

  if (!ready) {
    return <Loader fullscreen />;
  }

  return <>{children}</>;
}
