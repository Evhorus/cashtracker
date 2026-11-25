/** Validates server env at boot so missing vars (like NEXT_PUBLIC_URL) fail fast instead of falling back silently. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  await import("@/shared/config/env.server");
}
