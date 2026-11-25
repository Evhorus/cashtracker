import "server-only";

import { z } from "zod";

import { envSchema } from "./env.schema";

/**
 * Single server-only `process.env` entry point (also validates NEXT_PUBLIC_* and Clerk URLs at boot
 * so missing Clerk URLs fail fast instead of silently falling back to Clerk's hosted Account Portal).
 */
function parseEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    // Throw so instrumentation.ts fails startup instead of serving broken requests.
    throw new Error(
      `Invalid environment variables. Check .env against .env.template.\n\n${z.prettifyError(result.error)}`,
    );
  }

  return result.data;
}

export const env = parseEnv();
