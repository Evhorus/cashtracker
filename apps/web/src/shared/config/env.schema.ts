import { z } from "zod";

/** Server env schema split from env.server.ts (without `server-only`) so tests can import it without booting. */
/** Uses `error` so missing (undefined) vars show the custom message instead of Zod's type error. */
const required = (message: string) =>
  z.string({ error: message }).min(1, message);

/** Restricts to http(s) because plain `z.url()` accepts "localhost:4000" as protocol "localhost:". */
const httpUrl = (message: string) =>
  z.url({ error: message, protocol: /^https?$/ });

/** Relative app-local path (e.g. "/sign-in"); rejects absolute URLs to prevent open redirects. */
const appPath = (name: string, why: string) =>
  required(`${name} is required. ${why}`).regex(
    // Reject protocol-relative ("//host") and backslash-normalized ("/\host") external redirects.
    /^\/(?![/\\])/,
    `${name} must be a path beginning with "/" and pointing at this app (not "//host" or "/\\host"). ${why}`,
  );

export const envSchema = z.object({
  API_URL: httpUrl(
    "API_URL must be the backend API base URL (e.g. http://localhost:4000/api).",
  ),
  CLERK_SECRET_KEY: required(
    "CLERK_SECRET_KEY is required. Copy it from the Clerk dashboard.",
  ),
  NEXT_PUBLIC_URL: httpUrl(
    "NEXT_PUBLIC_URL must be this app's own public origin (e.g. http://localhost:3000). It is what sitemap.xml and robots.txt advertise.",
  ),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: required(
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required. Copy it from the Clerk dashboard.",
  ).startsWith(
    "pk_",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must start with pk_ - a value starting with sk_ is the SECRET key, which must never reach the browser.",
  ),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: appPath(
    "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
    "Without it Clerk sends users to its own hosted sign-in page instead of this app's /sign-in.",
  ),
  NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL: appPath(
    "NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL",
    "It is where a user lands after signing in (e.g. /dashboard).",
  ),
  NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL: appPath(
    "NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL",
    "It is where a user lands after signing up (e.g. /dashboard).",
  ),
});
