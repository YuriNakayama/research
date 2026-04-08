import { type NextRequest, NextResponse } from "next/server";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/lib/amplify-server";

/**
 * Authentication middleware.
 *
 * This is the primary defense: every request matched by `config.matcher` runs
 * through here before reaching a route handler. Unauthenticated users are
 * redirected to /login. The client-side AuthGuard has been removed in favor of
 * this server-side check so that an E2E flag or a stale bundle cannot bypass
 * authentication in production.
 *
 * E2E bypass (intentional, server-only):
 *   Tests set the `x-e2e-bypass` header to the value of `E2E_BYPASS_TOKEN`,
 *   which is only injected at Playwright startup via a random per-run value.
 *   `E2E_BYPASS_TOKEN` is a plain (non-`NEXT_PUBLIC_`) env var, so it is never
 *   embedded in the client bundle. In production `next.config.ts` throws if
 *   the variable is set, preventing accidental exposure.
 */

const LOGIN_PATH = "/login";

function isE2EBypassAllowed(request: NextRequest): boolean {
  const expected = process.env.E2E_BYPASS_TOKEN;
  if (!expected) return false;
  const provided = request.headers.get("x-e2e-bypass");
  return provided === expected;
}

export async function middleware(request: NextRequest) {
  if (isE2EBypassAllowed(request)) {
    return NextResponse.next();
  }

  const authenticated = await runWithAmplifyServerContext({
    nextServerContext: { request, response: NextResponse.next() },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec);
        // A valid Cognito session exposes tokens. Treat absence as unauthenticated.
        return session.tokens !== undefined;
      } catch {
        return false;
      }
    },
  });

  if (authenticated) {
    return NextResponse.next();
  }

  const loginUrl = new URL(LOGIN_PATH, request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Skip /login, Next internals, static assets, and the health endpoint.
  // Everything else requires authentication.
  matcher: [
    "/((?!login|_next/static|_next/image|favicon.ico|api/health|.*\\..*).*)",
  ],
};
