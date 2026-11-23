import "server-only";

import { auth } from "@clerk/nextjs/server";

import { env } from "@/shared/config/env.server";

export type AuthenticatedFetchOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

/**
 * Wrapper around fetch that automatically adds authentication token from Clerk
 * and builds the full API URL from a relative path
 * @param path - Relative API path (e.g., '/envelopes' or '/envelopes/123') or full URL
 * @param options - Fetch options (headers will be merged with auth header)
 * @returns Promise with the fetch response
 */
export async function authenticatedFetch(
  path: string,
  options?: AuthenticatedFetchOptions,
): Promise<Response> {
  await auth.protect();
  const { getToken } = await auth();
  const token = await getToken();

  // Build full URL if path is relative
  const url = path.startsWith("http") ? path : `${env.API_URL}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers || {}),
  };

  // Add authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // No persistent cache, by default and on purpose. This is a finance
  // app used from several devices: what one device just wrote must show
  // on the next load of any other, and a cached read can only promise
  // that if every write remembers to invalidate every read that shows
  // it - which this app got wrong in places (a renamed category kept its
  // old name on envelopes and the dashboard). Reading the backend every
  // time makes it true by construction. The key to a cached fetch also
  // includes the Authorization header, which rotates every minute, so
  // the cache could not have lived longer than that anyway.
  // `options` comes after so a read can still opt in deliberately.
  return fetch(url, {
    cache: "no-store",
    ...options,
    headers,
  });
}
