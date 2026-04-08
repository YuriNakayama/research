import { createServerRunner } from "@aws-amplify/adapter-nextjs";

/**
 * Amplify server-side runner for use in Next.js middleware, Server Components,
 * Route Handlers, and Server Actions. Reads the same Cognito configuration as
 * the client-side setup in `src/lib/amplify.ts`.
 */
export const { runWithAmplifyServerContext } = createServerRunner({
  config: {
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? "",
        userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID ?? "",
      },
    },
  },
});
