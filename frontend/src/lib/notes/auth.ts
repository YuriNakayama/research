import { cookies } from "next/headers";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/lib/amplify-server";

/**
 * Resolve the current user's Cognito `sub` from the verified session.
 *
 * The `sub` is the stable, unique user identifier and is the ONLY source of
 * truth for note ownership — it is read from the server-validated ID token,
 * never from client-supplied input. Callers use it to build the DynamoDB
 * partition key (`USER#<sub>`), which is what confines every read/write to the
 * caller's own data.
 *
 * Returns `null` when there is no valid session (treated as unauthenticated).
 */
export async function getCurrentUserSub(): Promise<string | null> {
  return runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec);
        const sub = session.tokens?.idToken?.payload.sub;
        return typeof sub === "string" && sub.length > 0 ? sub : null;
      } catch {
        return null;
      }
    },
  });
}
