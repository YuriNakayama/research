import { type NextRequest, NextResponse } from "next/server";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/lib/amplify-server";

/**
 * Authentication middleware.
 *
 * This is the primary defense: every request matched by `config.matcher` runs
 * through here before reaching a route handler. Every request is validated
 * against a real Cognito session — E2E tests authenticate the same way (via
 * Playwright storageState from a real login) rather than bypassing this check,
 * so there is a single authentication path shared by production and tests.
 * Unauthenticated users are redirected to /login.
 */

const LOGIN_PATH = "/login";

export async function middleware(request: NextRequest) {
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

  // API routes are called with `fetch`, which follows redirects by default: a
  // redirect to /login would hand the caller a 200 HTML page, so `response.ok`
  // stays true and the failure surfaces as an opaque JSON/Zod parse error.
  // Answer with a 401 in the same envelope the route handlers use instead.
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
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
